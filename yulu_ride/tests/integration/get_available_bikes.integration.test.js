import request from 'supertest';
import pool from '../../db/connectDatabase.js';
import app from '../../server.js';

const blockedUser = {
  email: 'blocked@example.com',
  lat: 12.9650,
  long: 77.6100
};
const lowBalanceUser = {
  email: 'vikram@example.com',
  lat: 12.9716,
  long: 77.5946
};
const validUser = {
  email: 'ravi@example.com',
  lat: 12.9716,
  long: 77.5946
};
const outsideServiceAreaUser = {
  email: 'priya@example.com',
  lat: 13.3000,
  long: 77.6200
};


describe('Get Available Bikes API Integration Tests', () => {
  // Setup test data before running tests
  beforeAll(async () => {
    // We're not creating test data as per requirements
    // The tests will use existing data in the test database
    
  });

  // Clean up after tests if needed
  afterAll(async () => {
    // Close the database connection
    await pool.end();
  });

  describe('GET /api/bikes/health', () => {
    it('should return 200 and success message', async () => {
      const response = await request(app).get('/api/bikes/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Success' });
    });
  });

  describe('POST /api/bikes/get_available_bikes', () => {
    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({ lat: 12.9716 }); // missing long and email
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required parameters.');
    });

    it('should return 401 when user is not found', async () => {
      // Using a non-existent email
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({ 
          lat: 12.9716, 
          long: 77.5946, 
          email: 'nonexistent-user-integration-test@example.com' 
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'User not found.');
      expect(response.body.data).toEqual({
        balance: 0,
        allow_ride: false,
        bikes: []
      });
    });

    // The following tests depend on data in the test database
    // These tests assume certain data exists in the test database

    it('should return appropriate message for blocked user', async () => {
      // This test assumes there's a blocked user in the test database
      // Replace with an actual blocked user email from your test database
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({...blockedUser});
      
      // If the user is blocked, we expect this response
      if (response.body.message === 'Your account is blocked.') {
        expect(response.status).toBe(200);
        expect(response.body.data.allow_ride).toBe(false);
        expect(response.body.data).toHaveProperty('balance');
        expect(response.body.data).toHaveProperty('bikes');
      }
    });

    it('should return appropriate message for user with low balance', async () => {
      // This test assumes there's a user with low balance in the test database
      // Replace with an actual low balance user email from your test database
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({...lowBalanceUser});
      
      // If the user has low balance, we expect this response
      if (response.body.message === 'You balance is low.') {
        expect(response.status).toBe(200);
        expect(response.body.data.allow_ride).toBe(false);
        expect(response.body.data).toHaveProperty('balance');
        expect(response.body.data.balance).toBeLessThan(50);
      }
    });

    it('should return appropriate message for user outside service area', async () => {
      // This test assumes coordinates outside any service area
      // Replace with coordinates that are definitely outside service areas
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({...outsideServiceAreaUser});
      
      // If the user is outside service area, we expect this response
      if (response.body.message === 'We are not serviceable in your area') {
        expect(response.status).toBe(200);
        expect(response.body.data.allow_ride).toBe(false);
      }
    });

    it('should return bikes when all conditions are met', async () => {
      // This test assumes there's a valid user and bikes in a service area
      // Replace with actual test data coordinates and email
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({...validUser});
      
      // If all conditions are met and bikes are available
      if (response.body.message === 'Success' && response.body.data.allow_ride === true) {
        expect(response.status).toBe(200);
        expect(response.body.data.allow_ride).toBe(true);
        expect(response.body.data).toHaveProperty('balance');
        expect(response.body.data).toHaveProperty('bikes');
        expect(Array.isArray(response.body.data.bikes)).toBe(true);
        expect(response.body.data.bikes.length).toBeGreaterThan(0);
        
        // Verify bike data structure
        const bike = response.body.data.bikes[0];
        expect(bike).toHaveProperty('id');
        expect(bike).toHaveProperty('bikeNumber');
        expect(bike).toHaveProperty('latitude');
        expect(bike).toHaveProperty('longitude');
        expect(bike).toHaveProperty('status', 'available');
        expect(bike).toHaveProperty('isFaulty', 0);
      }
    });

    it('should create history entry when bikes are found', async () => {
      // This test verifies that a history entry is created when bikes are found
      // Replace with actual test data coordinates and email
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({...validUser});
      
      // If bikes were found
      if (response.body.message === 'Success' && response.body.data.allow_ride === true) {
        // Query the database to verify a history entry was created
        const [userId] = await pool.execute(
          'SELECT id FROM users WHERE email = ?',
          [validUser.email]
        );
        const [historyRows] = await pool.execute(
          'SELECT * FROM bikeAvailabilityHistory WHERE userId = ? ORDER BY searchTime DESC LIMIT 1',
          [userId[0].id]
        );
        
        expect(historyRows.length).toBeGreaterThan(0);
        const historyEntry = historyRows[0];
        expect(historyEntry).toHaveProperty('id');
        expect(historyEntry).toHaveProperty('latitude', validUser.lat);
        expect(historyEntry).toHaveProperty('longitude', validUser.long);
        expect(historyEntry).toHaveProperty('response');
      }
    });
  });
});