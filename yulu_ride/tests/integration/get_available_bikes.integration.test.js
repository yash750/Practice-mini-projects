import request from 'supertest';
import app from '../../app.js';
import testPool from '../../db/connectDatabase.js';

describe('GET /api/bikes/get_available_bikes - Integration Tests', () => {
  let testUserId, testServiceAreaId, testBikeId;

  beforeAll(async () => {
    // Setup test data - placeholders for manual data entry
    // TODO: Manually insert test user with email ''ravi@example.com', balance 120, isBlocked false
    // TODO: Manually insert service area with name 'Bengaluru Operational Zone' covering coordinates (12.9716, 77.5946)
    // TODO: Manually insert available bike in the test service area
    
    // Get test data IDs for cleanup
    const [userRows] = await testPool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      ['ravi@example.com']
    );
    testUserId = userRows[0]?.id;

    const [areaRows] = await testPool.execute(
      'SELECT id FROM service_areas WHERE name = ? LIMIT 1',
      ['Bengaluru Operational Zone']
    );
    testServiceAreaId = areaRows[0]?.id;

    const [bikeRows] = await testPool.execute(
      'SELECT id FROM bikes WHERE status = "available" LIMIT 1'
    );
    testBikeId = bikeRows[0]?.id;
  });

  afterAll(async () => {
    // Cleanup: Remove any test entries created during tests to maintain DB consistency;
    if (testUserId) {
      await testPool.execute('DELETE FROM bikeAvailabilityHistory WHERE userId = ?', [testUserId]);
    }
    await testPool.end();
  });

  afterEach(async () => {
    // Ensure DB state consistency after each test
    if (testUserId) {
      await testPool.execute('DELETE FROM bikeAvailabilityHistory WHERE userId = ?', [testUserId]);
    }
  });

  describe('POST /api/bikes/get_available_bikes', () => {
    test('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({ lat: 12.9716 }); // missing long and email

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
      // TODO: Manually create blocked user with email 'blocked.user@example.com'
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: 'blocked@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Your account is blocked.');
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should return low balance message for user with insufficient balance', async () => {
      // TODO: Manually create user with email 'lowbalance.user@example.com' and balance < 50
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: 'vikram@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('You balance is low.');
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should return service area not available for coordinates outside service area', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 14.9650, // coordinates outside any service area
          long: 79.5946,
          email: 'priya@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('We are not serviceable in your area');
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should return no bikes available when no bikes in service area', async () => {
      // TODO: Manually create service area with no available bikes
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 13.0000, // coordinates in service area with no bikes
          long: 77.0000,
          email: 'priya@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('No bikes available in your area.');
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should return success with available bikes and create history entry', async () => {
      const initialHistoryCount = await testPool.execute(
        'SELECT COUNT(*) as count FROM bikeAvailabilityHistory WHERE userId = ?',
        [testUserId]
      );

      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: 'ravi@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(response.body.data.allow_ride).toBe(true);
      expect(response.body.data.bikes).toBeInstanceOf(Array);
      expect(response.body.data.bikes.length).toBeGreaterThan(0);
      expect(response.body.data.balance).toBeGreaterThanOrEqual(50);

      // Verify history entry was created
      const [finalHistoryCount] = await testPool.execute(
        'SELECT COUNT(*) as count FROM bikeAvailabilityHistory WHERE userId = ?',
        [testUserId]
      );
      expect(finalHistoryCount[0].count).toBe(initialHistoryCount[0][0].count + 1);

      // Verify history entry content
      const [historyEntry] = await testPool.execute(
        'SELECT * FROM bikeAvailabilityHistory WHERE userId = ? ORDER BY id DESC LIMIT 1',
        [testUserId]
      );
      expect(historyEntry[0].latitude).toBe(12.9716);
      expect(historyEntry[0].longitude).toBe(77.5946);
      expect(JSON.parse(historyEntry[0].response)).toBeInstanceOf(Array);
    });

    test('should handle edge case with balance exactly 50', async () => {
      // TODO: Manually create user with email 'balance50.user@example.com' and balance exactly 50
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: 'balance50@example.com'
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
          email: 'ravi@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should handle extreme coordinate values', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 999.999,
          long: -999.999,
          email: 'ravi@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.allow_ride).toBe(false);
    });

    test('should handle SQL injection attempts in email', async () => {
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: "'; DROP TABLE users; --"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('User not found.');
    });

    test('should handle very long email strings', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const response = await request(app)
        .post('/api/bikes/get_available_bikes')
        .send({
          lat: 12.9716,
          long: 77.5946,
          email: longEmail
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('User not found.');
    });

    test('should maintain database consistency after multiple requests', async () => {
      const initialUserCount = await testPool.execute('SELECT COUNT(*) as count FROM users');
      const initialBikeCount = await testPool.execute('SELECT COUNT(*) as count FROM bikes');
      const initialAreaCount = await testPool.execute('SELECT COUNT(*) as count FROM service_areas');

      // Make multiple requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/bikes/get_available_bikes')
          .send({
            lat: 12.9716,
            long: 77.5946,
            email: 'ravi@example.com'
          });
      }

      // Verify core tables remain unchanged
      const [finalUserCount] = await testPool.execute('SELECT COUNT(*) as count FROM users');
      const [finalBikeCount] = await testPool.execute('SELECT COUNT(*) as count FROM bikes');
      const [finalAreaCount] = await testPool.execute('SELECT COUNT(*) as count FROM service_areas');

      expect(finalUserCount[0].count).toBe(initialUserCount[0][0].count);
      expect(finalBikeCount[0].count).toBe(initialBikeCount[0][0].count);
      expect(finalAreaCount[0].count).toBe(initialAreaCount[0][0].count);
    });
  });

  describe('GET /api/bikes/health', () => {
    test('should return health check success', async () => {
      const response = await request(app)
        .get('/api/bikes/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Success' });
    });
  });
});