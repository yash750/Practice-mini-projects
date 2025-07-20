import testPool from '../../db/connectTestDB.js';
import { v4 as uuidv4 } from 'uuid';

const tables = [
  'bikeAvailabilityHistory',
  'bikes',
  'users',
  'service_areas',
  'cities',
];

/**
 * Cleans all relevant tables in the test database.
 */
async function cleanDatabase() {
  try {
    await testPool.execute('SET FOREIGN_KEY_CHECKS = 0;');
    for (const table of tables) {
      await testPool.execute(`TRUNCATE TABLE ${table};`);
    }
    await testPool.execute('SET FOREIGN_KEY_CHECKS = 1;');
  } catch (error) {
    console.error('Failed to clean the database:', error);
    throw error;
  }
}

/**
 * Seeds a default city for testing.
 */
async function seedTestCity() {
  const [result] = await testPool.execute(
    `INSERT INTO cities (id, name, centroidLatitude, centroidLongitude) VALUES (?, ?, ?, ?)`,
    [1, 'Test-City', 12.9716, 77.5946]
  );
  return result.insertId;
}

/**
 * Seeds a default service area (a polygon representing Koramangala, Bangalore for testing).
 */
async function seedTestServiceArea() {
  const cityId = await seedTestCity();
  // A simple rectangular polygon for testing around Koramangala
  const polygonWKT =
    'POLYGON((77.62 12.92, 77.63 12.92, 77.63 12.93, 77.62 12.93, 77.62 12.92))';
    await testPool.execute(`
  INSERT INTO service_areas (name, area, city_id)
  VALUES (?, ST_GeomFromText(?, 4326), ?)
`, ['Koramangala-Test-Area', polygonWKT, cityId]);   
}

/**
 * Cleans and sets up the database with default data for a test run.
 */
export async function setupTestDatabase() {
  await cleanDatabase();
  await seedTestServiceArea();
}

/**
 * Seeds a user into the database.
 * @param {object} userData - User properties to override defaults.
 * @returns {object} The created user data.
 */
export async function seedUser(userData = {}) {
  const user = {
    id: userData.id || uuidv4(),
    name: userData.name || 'Test User',
    email: userData.email || `test-${uuidv4()}@example.com`,
    password: 'password123',
    balance: userData.balance === undefined ? 100 : userData.balance,
    isBlocked: userData.isBlocked === undefined ? 0 : userData.isBlocked,
    ...userData,
  };

  await testPool.execute(
    `INSERT INTO users (id, name, email, password, balance, isBlocked) VALUES (?, ?, ?, ?, ?, ?)`,
    [user.id, user.name, user.email, user.password, user.balance, user.isBlocked]
  );
  return user;
}

/**
 * Seeds a bike into the database.
 * @param {object} bikeData - Bike properties to override defaults.
 * @returns {object} The created bike data.
 */
export async function seedBike(bikeData = {}) {
    const bike = {
        id: bikeData.id || uuidv4(),
        bikeNumber: bikeData.bikeNumber || Math.floor(Math.random() * 10000),
        latitude: bikeData.latitude || 12.927,
        longitude: bikeData.longitude || 77.627,
        isFaulty: bikeData.isFaulty === undefined ? 0 : bikeData.isFaulty,
        status: bikeData.status || 'available',
        bikeCategory: bikeData.bikeCategory || 'Standard',
        ...bikeData
    };

    await testPool.execute(
        'INSERT INTO bikes (id, bikeNumber, latitude, longitude, isFaulty, status, bikeCategory) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bike.id, bike.bikeNumber, bike.latitude, bike.longitude, bike.isFaulty, bike.status, bike.bikeCategory]
    );
    return bike;
}

export async function getHistoryLogCountForUser(email) {
  const [userRows] = await testPool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (userRows.length === 0) return 0;
  const userId = userRows[0].id;

  const [rows] = await testPool.execute('SELECT COUNT(*) as count FROM bikeAvailabilityHistory WHERE userId = ?', [userId]);
  return rows[0].count;
}