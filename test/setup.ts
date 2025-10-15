/**
 * Test Setup File
 * This file runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/car_inventory_test';
process.env.JWT_SECRET = 'test_secret_key_for_testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.LOG_LEVEL = 'error';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to keep test output clean
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};
