import { jest } from '@jest/globals';

jest.mock('../../db/connectDatabase.js');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

import pool from '../../db/connectDatabase.js';
import { 
  get_available_bikes, 
  isUserInServiceArea, 
  fetchAvailableBikes, 
  makeEntryInHistory 
} from '../../controllers/get_available_bikes.controller.js';

pool.execute = jest.fn();

describe('get_available_bikes Controller - Unit Tests', () => {
  beforeEach(() => {
    pool.execute.mockClear();
  });

  describe('isUserInServiceArea', () => {
    test('should return allow_ride true when user is in service area', async () => {
      const mockRows = [{ name: 'Downtown', city_id: 1 }];
      pool.execute.mockResolvedValue([mockRows]);

      const result = await isUserInServiceArea(12.9716, 77.5946);

      expect(result).toEqual({
        allow_ride: true,
        service_area_name: 'Downtown',
        city_id: 1
      });
    });

    test('should return allow_ride false when user is not in service area', async () => {
      pool.execute.mockResolvedValue([[]]);

      const result = await isUserInServiceArea(12.9716, 77.5946);

      expect(result).toEqual({
        allow_ride: false,
        service_area_name: "",
        message: "We are not serviceable in your area"
      });
    });

    test('should handle database error gracefully', async () => {
      pool.execute.mockRejectedValue(new Error('DB connection failed'));

      const result = await isUserInServiceArea(12.9716, 77.5946);

      expect(result).toEqual({
        allow_ride: false,
        service_area_name: "",
        message: "Error checking service area availability."
      });
    });
  });

  describe('fetchAvailableBikes', () => {
    test('should return available bikes in service area', async () => {
      const mockBikes = [
        { id: 1, latitude: 12.9716, longitude: 77.5946, status: 'available' }
      ];
      pool.execute.mockResolvedValue([mockBikes]);

      const userInServiceArea = { service_area_name: 'Downtown' };
      const result = await fetchAvailableBikes(userInServiceArea);

      expect(result).toEqual(mockBikes);
    });

    test('should return empty array when no bikes available', async () => {
      pool.execute.mockResolvedValue([[]]);

      const userInServiceArea = { service_area_name: 'Downtown' };
      const result = await fetchAvailableBikes(userInServiceArea);

      expect(result).toEqual([]);
    });

    test('should throw error when database query fails', async () => {
      pool.execute.mockRejectedValue(new Error('DB query failed'));

      const userInServiceArea = { service_area_name: 'Downtown' };

      await expect(fetchAvailableBikes(userInServiceArea)).rejects.toThrow('DB query failed');
    });
  });

  describe('makeEntryInHistory', () => {
    test('should successfully create history entry', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await makeEntryInHistory('uuid-123', 'user-1', 12.9716, 77.5946, '[]');

      expect(result).toBe(true);
    });

    test('should return false when database insert fails', async () => {
      pool.execute.mockRejectedValue(new Error('Insert failed'));

      const result = await makeEntryInHistory('uuid-123', 'user-1', 12.9716, 77.5946, '[]');

      expect(result).toBe(false);
    });
  });

  describe('get_available_bikes main controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
      mockReq = {
        body: {
          lat: 12.9716,
          long: 77.5946,
          email: 'test@example.com'
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    test('should return 400 when required parameters are missing', async () => {
      mockReq.body = { lat: 12.9716 };

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required parameters.' });
    });

    test('should return 401 when user not found', async () => {
      pool.execute.mockResolvedValue([[]]);

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found.',
        data: { balance: 0, allow_ride: false, bikes: [] }
      });
    });

    test('should return blocked message when user is blocked', async () => {
      const mockUser = [{ id: 1, isBlocked: true, balance: 100 }];
      pool.execute.mockResolvedValue([mockUser]);

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Your account is blocked.',
        data: { balance: 100, allow_ride: false, bikes: [] }
      });
    });

    test('should return low balance message when balance < 50', async () => {
      const mockUser = [{ id: 1, isBlocked: false, balance: 30 }];
      pool.execute.mockResolvedValue([mockUser]);

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You balance is low.',
        data: { balance: 30, allow_ride: false, bikes: [] }
      });
    });

    test('should return service area not available message', async () => {
      const mockUser = [{ id: 1, isBlocked: false, balance: 100 }];
      pool.execute
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([[]]);

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'We are not serviceable in your area',
        data: { balance: 100, allow_ride: false, bikes: [] }
      });
    });

    test('should return no bikes available message', async () => {
      const mockUser = [{ id: 1, isBlocked: false, balance: 100 }];
      const mockServiceArea = [{ name: 'Downtown', city_id: 1 }];
      pool.execute
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockServiceArea])
        .mockResolvedValueOnce([[]]);

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No bikes available in your area.',
        data: { balance: 100, allow_ride: false, bikes: [] }
      });
    });

    test('should return success with available bikes', async () => {
      const mockUser = [{ id: 1, isBlocked: false, balance: 100 }];
      const mockServiceArea = [{ name: 'Downtown', city_id: 1 }];
      const mockBikes = [{ id: 1, status: 'available' }];
      pool.execute
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockServiceArea])
        .mockResolvedValueOnce([mockBikes])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Success',
        data: { balance: 100, allow_ride: true, bikes: mockBikes }
      });
    });

    test('should handle server error gracefully', async () => {
      pool.execute.mockRejectedValue(new Error('Database connection failed'));

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error in get_available_bikes controller',
        message: 'Database connection failed'
      });
    });

    test('should handle balance exactly 50', async () => {
      const mockUser = [{ id: 1, isBlocked: false, balance: 50 }];
      const mockServiceArea = [{ name: 'Downtown', city_id: 1 }];
      const mockBikes = [{ id: 1, status: 'available' }];
      pool.execute
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([mockServiceArea])
        .mockResolvedValueOnce([mockBikes])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      await get_available_bikes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Success',
        data: { balance: 50, allow_ride: true, bikes: mockBikes }
      });
    });
  });
});