import { v4 as uuidv4 } from 'uuid';
import testPool from '../../db/connectTestDB.js';

export class TestDataSetup {
  constructor() {
    this.createdData = {
      users: [],
      bikes: [],
      serviceAreas: [],
      cities: [],
      history: []
    };
  }

  async createTestUser(userData = {}) {
    const defaultUser = {
      id: uuidv4(),
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      balance: 120,
      latitude: 12.9716,
      longitude: 77.5946,
      isBlocked: 0
    };

    const user = { ...defaultUser, ...userData };
    
    await testPool.execute(
      `INSERT INTO users (id, name, email, password, balance, latitude, longitude, isBlocked) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, user.password, user.balance, user.latitude, user.longitude, user.isBlocked]
    );

    this.createdData.users.push(user.id);
    return user;
  }

  async createTestCity(cityData = {}) {
    const defaultCity = {
      name: 'Test City',
      centroidLatitude: 12.9716,
      centroidLongitude: 77.5946,
      activeServiceIds: JSON.stringify([1])
    };

    const city = { ...defaultCity, ...cityData };
    
    const [result] = await testPool.execute(
      `INSERT INTO cities (name, centroidLatitude, centroidLongitude, activeServiceIds) 
       VALUES (?, ?, ?, ?)`,
      [city.name, city.centroidLatitude, city.centroidLongitude, city.activeServiceIds]
    );

    const cityId = result.insertId;
    this.createdData.cities.push(cityId);
    return { ...city, id: cityId };
  }

  async createTestServiceArea(areaData = {}) {
    const defaultArea = {
      name: 'Test Service Area',
      city_id: 1,
      // Polygon covering Bengaluru area
      area: 'POLYGON((77.5 12.9, 77.6 12.9, 77.6 13.0, 77.5 13.0, 77.5 12.9))'
    };

    const area = { ...defaultArea, ...areaData };
    
    const [result] = await testPool.execute(
      `INSERT INTO service_areas (name, area, city_id) 
       VALUES (?, ST_GeomFromText(?, 4326), ?)`,
      [area.name, area.area, area.city_id]
    );

    const areaId = result.insertId;
    this.createdData.serviceAreas.push(areaId);
    return { ...area, id: areaId };
  }

  async createTestBike(bikeData = {}) {
    const defaultBike = {
      id: uuidv4(),
      bikeNumber: Math.floor(Math.random() * 10000) + 1000,
      latitude: 12.9716,
      longitude: 77.5946,
      isFaulty: 0,
      status: 'available',
      bikeCategory: 'standard'
    };

    const bike = { ...defaultBike, ...bikeData };
    
    await testPool.execute(
      `INSERT INTO bikes (id, bikeNumber, latitude, longitude, isFaulty, status, bikeCategory) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bike.id, bike.bikeNumber, bike.latitude, bike.longitude, bike.isFaulty, bike.status, bike.bikeCategory]
    );

    this.createdData.bikes.push(bike.id);
    return bike;
  }

  async setupCompleteTestData() {
    // Create city first
    const city = await this.createTestCity();
    
    // Create service area
    const serviceArea = await this.createTestServiceArea({ city_id: city.id });
    
    // Create test users
    const validUser = await this.createTestUser({
      email: 'valid@test.com',
      balance: 120
    });

    const blockedUser = await this.createTestUser({
      email: 'blocked@test.com',
      balance: 100,
      isBlocked: 1
    });

    const lowBalanceUser = await this.createTestUser({
      email: 'lowbalance@test.com',
      balance: 30
    });

    const exactBalanceUser = await this.createTestUser({
      email: 'exact50@test.com',
      balance: 50
    });

    // Create test bikes
    const bike1 = await this.createTestBike({
      latitude: 12.9716,
      longitude: 77.5946
    });

    const bike2 = await this.createTestBike({
      latitude: 12.9720,
      longitude: 77.5950
    });

    return {
      city,
      serviceArea,
      users: { validUser, blockedUser, lowBalanceUser, exactBalanceUser },
      bikes: { bike1, bike2 }
    };
  }

  async cleanup() {
    // Clean up in reverse order of dependencies
    if (this.createdData.history.length > 0) {
      await testPool.execute(
        `DELETE FROM bikeAvailabilityHistory WHERE id IN (${this.createdData.history.map(() => '?').join(',')})`,
        this.createdData.history
      );
    }

    if (this.createdData.bikes.length > 0) {
      await testPool.execute(
        `DELETE FROM bikes WHERE id IN (${this.createdData.bikes.map(() => '?').join(',')})`,
        this.createdData.bikes
      );
    }

    if (this.createdData.users.length > 0) {
      await testPool.execute(
        `DELETE FROM users WHERE id IN (${this.createdData.users.map(() => '?').join(',')})`,
        this.createdData.users
      );
    }

    if (this.createdData.serviceAreas.length > 0) {
      await testPool.execute(
        `DELETE FROM service_areas WHERE id IN (${this.createdData.serviceAreas.map(() => '?').join(',')})`,
        this.createdData.serviceAreas
      );
    }

    if (this.createdData.cities.length > 0) {
      await testPool.execute(
        `DELETE FROM cities WHERE id IN (${this.createdData.cities.map(() => '?').join(',')})`,
        this.createdData.cities
      );
    }

    // Reset tracking
    this.createdData = {
      users: [],
      bikes: [],
      serviceAreas: [],
      cities: [],
      history: []
    };
  }
}