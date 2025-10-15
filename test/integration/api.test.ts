import request from 'supertest';
import app from '../../src/server';

describe('Root Endpoint', () => {
  describe('GET /', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });

    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });

    it('should have correct API name', async () => {
      const response = await request(app).get('/');

      expect(response.body.message).toBe('Car Inventory API');
      expect(response.body.version).toBe('1.0.0');
    });

    it('should list available endpoints', async () => {
      const response = await request(app).get('/');

      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('docs');
    });
  });
});

describe('404 Not Found', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });

  it('should return proper error structure', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.body).toHaveProperty('status', 404);
    expect(response.body).toHaveProperty('name', 'Not Found');
    expect(response.body).toHaveProperty('message', 'Route not found');
  });
});
