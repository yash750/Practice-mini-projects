// This file sets up the test environment
import { jest } from '@jest/globals';

// Mock the database connection to use the test database
jest.mock('../db/connectDatabase.js', () => {
  const originalModule = jest.requireActual('../db/connectTestDB.js');
  return originalModule;
});