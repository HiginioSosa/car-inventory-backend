import { config } from '../../src/config/env';

describe('Environment Configuration', () => {
  it('should load test environment variables', () => {
    expect(config.NODE_ENV).toBe('test');
  });

  it('should have required configuration properties', () => {
    expect(config).toHaveProperty('NODE_ENV');
    expect(config).toHaveProperty('PORT');
    expect(config).toHaveProperty('HOST');
    expect(config).toHaveProperty('MONGODB_URI');
    expect(config).toHaveProperty('JWT_SECRET');
    expect(config).toHaveProperty('JWT_EXPIRES_IN');
    expect(config).toHaveProperty('CORS_ORIGIN');
  });

  it('should have correct types', () => {
    expect(typeof config.NODE_ENV).toBe('string');
    expect(typeof config.PORT).toBe('number');
    expect(typeof config.HOST).toBe('string');
    expect(typeof config.MONGODB_URI).toBe('string');
    expect(typeof config.JWT_SECRET).toBe('string');
  });

  it('should use test database', () => {
    expect(config.MONGODB_URI).toContain('test');
  });
});
