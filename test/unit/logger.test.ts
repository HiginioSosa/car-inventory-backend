import { logger } from '../../src/utils/logger';

describe('Logger Utility', () => {
  // Save original console methods
  const originalConsole = { ...console };

  beforeEach(() => {
    // Mock console methods before each test
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    // Restore console after all tests
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should include INFO prefix and emoji', () => {
      logger.info('Test message');
      const calls = (console.log as jest.Mock).mock.calls;
      expect(calls[calls.length - 1][0]).toContain('[INFO]');
      expect(calls[calls.length - 1][0]).toContain('ℹ️');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should include ERROR prefix and emoji', () => {
      logger.error('Test error');
      const calls = (console.error as jest.Mock).mock.calls;
      expect(calls[calls.length - 1][0]).toContain('[ERROR]');
      expect(calls[calls.length - 1][0]).toContain('❌');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should include WARN prefix and emoji', () => {
      logger.warn('Test warning');
      const calls = (console.warn as jest.Mock).mock.calls;
      expect(calls[calls.length - 1][0]).toContain('[WARN]');
      expect(calls[calls.length - 1][0]).toContain('⚠️');
    });
  });

  describe('success', () => {
    it('should log success messages', () => {
      logger.success('Test success');
      expect(console.log).toHaveBeenCalled();
    });

    it('should include SUCCESS prefix and emoji', () => {
      logger.success('Test success');
      const calls = (console.log as jest.Mock).mock.calls;
      expect(calls[calls.length - 1][0]).toContain('[SUCCESS]');
      expect(calls[calls.length - 1][0]).toContain('✅');
    });
  });
});
