import { jest } from '@jest/globals';
import { get_available_bikes, healthCheck, isUserInServiceArea, fetchAvailableBikes, makeEntryInHistory } from '../../controllers/get_available_bikes.controller.js';
import pool from '../../db/connectTestDB.js';

// Mock the database pool
jest.mock('../../db/connectTestDB.js', () => ({
  execute: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('get_available_bikes.controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('healthCheck', () => {
    it('should return a 200 status with success message', async () => {
      await healthCheck(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
    });
  });

  describe('isUserInServiceArea', () => {
    it('should return allow_ride true when user is in service area', async () => {
      const mockRows = [{ name: 'Test Area', city_id: 1 }];
      pool.execute.mockResolvedValueOnce([mockRows]);

      const result = await isUserInServiceArea(12.9716, 77.5946);
      
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT sa.*'),
        ['POINT(77.5946 12.9716)']
      );
      expect(result).toEqual({
        allow_ride: true,
        service_area_name: 'Test Area',
        city_id: 1
      });
    });

    it('should return allow_ride false when user is not in service area', async () => {
      pool.execute.mockResolvedValueOnce([[]]);

      const result = await isUserInServiceArea(0, 0);
      
      expect(result).toEqual({
        allow_ride: false,
        service_area_name: '',
        message: 'We are not serviceable in your area'
      });
    });

    it('should handle database errors gracefully', async () => {
      pool.execute.mockRejectedValueOnce(new Error('Database error'));

      const result = await isUserInServiceArea(12.9716, 77.5946);
      
      expect(result).toEqual({
        allow_ride: false,
        service_area_name: '',
        message: 'Error checking service area availability.'
      });
    });
  });

  describe('fetchAvailableBikes', () => {
    it('should return available bikes in the service area', async () => {
      const mockBikes = [
        { id: 'bike1', bikeNumber: 1, latitude: 12.9716, longitude: 77.5946 },
        { id: 'bike2', bikeNumber: 2, latitude: 12.9717, longitude: 77.5947 }
      ];
      pool.execute.mockResolvedValueOnce([mockBikes]);

      const userInServiceArea = { service_area_name: 'Test Area' };
      const result = await fetchAvailableBikes(userInServiceArea);
      
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT b.*'),
        ['Test Area']
      );
      expect(result).toEqual(mockBikes);
    });

    it('should throw error when database query fails', async () => {
      pool.execute.mockRejectedValueOnce(new Error('Database error'));

      const userInServiceArea = { service_area_name: 'Test Area' };
      
      await expect(fetchAvailableBikes(userInServiceArea)).rejects.toThrow('Database error');
    });
  });

  describe('makeEntryInHistory', () => {
    it('should successfully log bike availability history', async () => {
      pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await makeEntryInHistory(
        'log-id-123',
        'user-id-123',
        12.9716,
        77.5946,
        '{"bikes":[]}'
      );
      
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO bikeAvailabilityHistory'),
        ['log-id-123', 'user-id-123', 12.9716, 77.5946, '{"bikes":[]}']
      );
      expect(result).toBe(true);
    });

    it('should return false when logging fails', async () => {
      pool.execute.mockRejectedValueOnce(new Error('Database error'));

      const result = await makeEntryInHistory(
        'log-id-123',
        'user-id-123',
        12.9716,
        77.5946,
        '{"bikes":[]}'
      );
      
      expect(result).toBe(false);
    });
  });

  describe('get_available_bikes', () => {
    it('should return 400 when required parameters are missing', async () => {
      req.body = { lat: 12.9716 }; // missing long and email
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required parameters.' });
    });

    it('should return 401 when user is not found', async () => {
      req.body = { lat: 12.9716, long: 77.5946, email: 'nonexistent@example.com' };
      pool.execute.mockResolvedValueOnce([[]]);
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'User not found.', 
        data: { balance: 0, allow_ride: false, bikes: [] } 
      });
    });

    it('should return appropriate message when user is blocked', async () => {
      req.body = { lat: 12.9716, long: 77.5946, email: 'blocked@example.com' };
      pool.execute.mockResolvedValueOnce([[{ id: 'user1', isBlocked: 1, balance: 100 }]]);
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Your account is blocked.', 
        data: { balance: 100, allow_ride: false, bikes: [] } 
      });
    });

    it('should return appropriate message when user balance is low', async () => {
      req.body = { lat: 12.9716, long: 77.5946, email: 'lowbalance@example.com' };
      pool.execute.mockResolvedValueOnce([[{ id: 'user1', isBlocked: 0, balance: 40 }]]);
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'You balance is low.', 
        data: { balance: 40, allow_ride: false, bikes: [] } 
      });
    });

    it('should return appropriate message when user is not in service area', async () => {
      req.body = { lat: 0, long: 0, email: 'user@example.com' };
      pool.execute.mockResolvedValueOnce([[{ id: 'user1', isBlocked: 0, balance: 100 }]]);
      
      // Mock isUserInServiceArea to return not in service area
      jest.spyOn(global, 'isUserInServiceArea').mockImplementationOnce(() => ({
        allow_ride: false,
        service_area_name: '',
        message: 'We are not serviceable in your area'
      }));
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'We are not serviceable in your area', 
        data: { balance: 100, allow_ride: false, bikes: [] } 
      });
    });

    it('should return appropriate message when no bikes are available', async () => {
      req.body = { lat: 12.9716, long: 77.5946, email: 'user@example.com' };
      pool.execute.mockResolvedValueOnce([[{ id: 'user1', isBlocked: 0, balance: 100 }]]);
      
      // Mock isUserInServiceArea to return in service area
      jest.spyOn(global, 'isUserInServiceArea').mockImplementationOnce(() => ({
        allow_ride: true,
        service_area_name: 'Test Area',
        city_id: 1
      }));
      
      // Mock fetchAvailableBikes to return empty array
      jest.spyOn(global, 'fetchAvailableBikes').mockImplementationOnce(() => []);
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'No bikes available in your area.', 
        data: { balance: 100, allow_ride: false, bikes: [] } 
      });
    });

    it('should return available bikes when all conditions are met', async () => {
      req.body = { lat: 12.9716, long: 77.5946, email: 'user@example.com' };
      const mockUser = { id: 'user1', isBlocked: 0, balance: 100 };
      pool.execute.mockResolvedValueOnce([[mockUser]]);
      
      const mockServiceArea = {
        allow_ride: true,
        service_area_name: 'Test Area',
        city_id: 1
      };
      
      const mockBikes = [
        { id: 'bike1', bikeNumber: 1, latitude: 12.9716, longitude: 77.5946 },
        { id: 'bike2', bikeNumber: 2, latitude: 12.9717, longitude: 77.5947 }
      ];
      
      // Mock helper functions
      jest.spyOn(global, 'isUserInServiceArea').mockImplementationOnce(() => mockServiceArea);
      jest.spyOn(global, 'fetchAvailableBikes').mockImplementationOnce(() => mockBikes);
      jest.spyOn(global, 'makeEntryInHistory').mockImplementationOnce(() => true);
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Success', 
        data: { balance: 100, allow_ride: true, bikes: mockBikes } 
      });
    });

    it('should handle errors gracefully', async () => {
      req.body = { lat: 12.9716, long: 77.5946, email: 'user@example.com' };
      pool.execute.mockRejectedValueOnce(new Error('Database error'));
      
      await get_available_bikes(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Error in get_available_bikes controller', 
        message: 'Database error' 
      });
    });
  });
});