import request from 'supertest';
import app from '../../app.js';
import testPool from '../../db/connectTestDB.js';
import { TestDataSetup } from '../utils/testDataSetup.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });
process.env.NODE_ENV = 'test';

describe('GET /api/bikes/get_available_bikes - Auto Setup Integration Tests', () => {
  let testDataSetup;
  let testData;

  beforeAll(async () => {
    testDataSetup = new TestDataSetup();
    testData = await testDataSetup.setupCompleteTestData();
  });

  afterAll(async () => {
    await testDataSetup.cleanup();
    await testPool.end();
  });

  afterEach(async () => {
    // Clean up any history entries created during tests
    await testPool.execute('DELETE FROM bikeAvailabilityHistory WHERE userId IN (?, ?, ?, ?)', 
      [testData.users.validUser.id, testData.users.blockedUser.id, testData.users.lowBalanceUser.id, testData.users.exactBalanceUser.id]);
  });

  describe('POST /api/bikes/get_available_bikes', () => {
    test('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({ lat: 12.9716 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required parameters.' });
    });

    test('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'User not found.',
        data: { balance: 0, allow_ride: false, bikes: [] }
      });
    });

    test('should return blocked message for blocked user', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: testData.users.blockedUser.email
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Your account is blocked.');
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should return low balance message for user with insufficient balance', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: testData.users.lowBalanceUser.email
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('You balance is low.');
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should return service area not available for coordinates outside service area', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 14.9650,
          long: 79.5946,
          email: testData.users.validUser.email
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('We are not serviceable in your area');
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should return success with available bikes and create history entry', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: testData.users.validUser.email
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(response.body.data.allow_ride).toBe(true);
      expect(response.body.data.bikes).toBeInstanceOf(Array);
      expect(response.body.data.bikes.length).toBeGreaterThan(0);
      expect(response.body.data.balance).toBe(120);

      // Verify history entry was created
      const [historyEntries] = await testPool.execute(
        'SELECT * FROM bikeAvailabilityHistory WHERE userId = ?',
        [testData.users.validUser.id]
      );
      expect(historyEntries.length).toBe(1);
      expect(historyEntries[0].latitude).toBe(12.9716);
      expect(historyEntries[0].longitude).toBe(77.5946);
    });

    test('should handle edge case with balance exactly 50', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: testData.users.exactBalanceUser.email
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(response.body.data.balance).toBe(50);
      expect(response.body.data.allow_ride).toBe(true);
    });

    test('should handle invalid coordinates gracefully', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 'invalid',
          long: 'invalid',
          email: testData.users.validUser.email
        });

      expect(response.status).toBe(200);
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should maintain database consistency after multiple requests', async () => {
      const initialUserCount = await testPool.execute('SELECT COUNT(*) as count FROM users');
      const initialBikeCount = await testPool.execute('SELECT COUNT(*) as count FROM bikes');

      // Make multiple requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/bikes/get_available_bikes')
          .send({
            lat: 12.9716,
            long: 77.5946,
            email: testData.users.validUser.email
          });
      }

      const finalUserCount = await testPool.execute('SELECT COUNT(*) as count FROM users');
      const finalBikeCount = await testPool.execute('SELECT COUNT(*) as count FROM bikes');

      expect(finalUserCount[0][0].count).toBe(initialUserCount[0][0].count);
      expect(finalBikeCount[0][0].count).toBe(initialBikeCount[0][0].count);
    });
  });
});