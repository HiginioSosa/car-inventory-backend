import request from 'supertest';
import app from '../../src/server';

describe('Health Check Endpoint', () => {
  describe('GET /health', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should return correct health check structure', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return status OK', async () => {
      const response = await request(app).get('/health');

      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Server is running');
    });

    it('should have valid timestamp', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});
