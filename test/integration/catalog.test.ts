/**
 * Integration tests for Catalog API
 * @module test/integration/catalog
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import User from '../../src/models/User';
import Catalog from '../../src/models/Catalog';
import { config } from '../../src/config/env';

describe('Catalog API Integration Tests', () => {
  let authToken: string;

  // Setup: Connect to test database and create test user
  beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI);

    // Clean up before creating user
    await User.deleteMany({ email: 'catalogtest@example.com' });

    // Create test user directly
    await User.create({
      email: 'catalogtest@example.com',
      password: 'password123',
      name: 'Catalog Test User',
    });

    // Get token by logging in
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'catalogtest@example.com',
      password: 'password123',
    });
    authToken = loginResponse.body.data.token;
  });

  // Cleanup
  afterAll(async () => {
    await Catalog.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Catalog.deleteMany({});
  });

  describe('GET /api/catalogs/brands', () => {
    beforeEach(async () => {
      // Create test catalogs
      await Catalog.create([
        {
          marca: 'Toyota',
          modelos: [
            { nombre: 'Corolla', isActive: true },
            { nombre: 'Camry', isActive: true },
          ],
          isActive: true,
        },
        {
          marca: 'Honda',
          modelos: [
            { nombre: 'Civic', isActive: true },
            { nombre: 'Accord', isActive: true },
          ],
          isActive: true,
        },
        {
          marca: 'Ford',
          modelos: [{ nombre: 'Focus', isActive: true }],
          isActive: false,
        },
      ]);
    });

    it('should get all brands successfully', async () => {
      const response = await request(app).get('/api/catalogs/brands').expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Marcas obtenidas exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('marcas');
      expect(Array.isArray(response.body.data.marcas)).toBe(true);
      expect(response.body.data.marcas.length).toBeGreaterThan(0);
    });

    it('should return only active brands', async () => {
      const response = await request(app).get('/api/catalogs/brands').expect(200);

      // Should only include active brands (Toyota and Honda, not Ford)
      const brands = response.body.data.marcas;
      expect(brands).toContain('Toyota');
      expect(brands).toContain('Honda');
      expect(brands).not.toContain('Ford');
    });

    it('should return brands in alphabetical order', async () => {
      const response = await request(app).get('/api/catalogs/brands').expect(200);

      const brands = response.body.data.marcas;
      const sortedBrands = [...brands].sort();
      expect(brands).toEqual(sortedBrands);
    });
  });

  describe('GET /api/catalogs/models/:marca', () => {
    beforeEach(async () => {
      await Catalog.create([
        {
          marca: 'Toyota',
          modelos: [
            { nombre: 'Corolla', isActive: true },
            { nombre: 'Camry', isActive: true },
            { nombre: 'Yaris', isActive: false },
          ],
          isActive: true,
        },
        {
          marca: 'Honda',
          modelos: [{ nombre: 'Civic', isActive: true }],
          isActive: true,
        },
      ]);
    });

    it('should get models by brand successfully', async () => {
      const response = await request(app).get('/api/catalogs/models/Toyota').expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Modelos obtenidos exitosamente');
      expect(response.body.data).toHaveProperty('marca', 'Toyota');
      expect(response.body.data).toHaveProperty('modelos');
      expect(Array.isArray(response.body.data.modelos)).toBe(true);
      expect(response.body.data.modelos.length).toBeGreaterThan(0);
    });

    it('should return only active models', async () => {
      const response = await request(app).get('/api/catalogs/models/Toyota').expect(200);

      const models = response.body.data.modelos;
      expect(models).toContain('Corolla');
      expect(models).toContain('Camry');
      expect(models).not.toContain('Yaris');
    });

    it('should return 404 for non-existent brand', async () => {
      const response = await request(app).get('/api/catalogs/models/Ferrari').expect(404);

      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('name', 'Not Found');
    });

    it('should handle case-sensitive brand search', async () => {
      const response = await request(app).get('/api/catalogs/models/toyota').expect(404);

      expect(response.body).toHaveProperty('status', 404);
    });
  });

  describe('GET /api/catalogs/years', () => {
    it('should get catalog of years successfully', async () => {
      const response = await request(app).get('/api/catalogs/years').expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Años obtenidos exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('años');
      expect(Array.isArray(response.body.data.años)).toBe(true);
      expect(response.body.data.años.length).toBeGreaterThan(0);
    });

    it('should return years in descending order', async () => {
      const response = await request(app).get('/api/catalogs/years').expect(200);

      const years = response.body.data.años;
      const currentYear = new Date().getFullYear();
      expect(years[0]).toBe(currentYear + 1);
      expect(years[years.length - 1]).toBe(1990);

      // Verify descending order
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i]).toBeGreaterThan(years[i + 1]);
      }
    });

    it('should include current year and next year', async () => {
      const response = await request(app).get('/api/catalogs/years').expect(200);

      const years = response.body.data.años;
      const currentYear = new Date().getFullYear();
      expect(years).toContain(currentYear);
      expect(years).toContain(currentYear + 1);
    });
  });

  describe('GET /api/catalogs', () => {
    beforeEach(async () => {
      await Catalog.create([
        {
          marca: 'Toyota',
          modelos: [
            { nombre: 'Corolla', isActive: true },
            { nombre: 'Camry', isActive: true },
          ],
          isActive: true,
        },
        {
          marca: 'Honda',
          modelos: [{ nombre: 'Civic', isActive: true }],
          isActive: true,
        },
      ]);
    });

    it('should get full catalog successfully', async () => {
      const response = await request(app).get('/api/catalogs').expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Catálogo obtenido exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('catalogs');
      expect(Array.isArray(response.body.data.catalogs)).toBe(true);
      expect(response.body.data.catalogs.length).toBeGreaterThan(0);
    });

    it('should include all catalog properties', async () => {
      const response = await request(app).get('/api/catalogs').expect(200);

      const catalog = response.body.data.catalogs[0];
      expect(catalog).toHaveProperty('_id');
      expect(catalog).toHaveProperty('marca');
      expect(catalog).toHaveProperty('modelos');
      expect(catalog).toHaveProperty('isActive');
      expect(catalog).toHaveProperty('createdAt');
      expect(catalog).toHaveProperty('updatedAt');
      expect(Array.isArray(catalog.modelos)).toBe(true);
    });

    it('should include model details', async () => {
      const response = await request(app).get('/api/catalogs').expect(200);

      const catalog = response.body.data.catalogs[0];
      const model = catalog.modelos[0];
      expect(model).toHaveProperty('nombre');
      expect(model).toHaveProperty('isActive');
    });

    it('should return empty array when no catalogs exist', async () => {
      await Catalog.deleteMany({});

      const response = await request(app).get('/api/catalogs').expect(200);

      expect(response.body.data.catalogs).toEqual([]);
    });
  });

  describe('POST /api/catalogs/initialize', () => {
    it('should initialize catalogs successfully', async () => {
      const response = await request(app)
        .post('/api/catalogs/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('status', 201);
      expect(response.body).toHaveProperty('message', 'Catálogos inicializados exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty(
        'message',
        'Default catalogs have been initialized'
      );

      // Verify catalogs were created
      const catalogs = await Catalog.find({});
      expect(catalogs.length).toBeGreaterThan(0);
    });

    it('should not duplicate catalogs on multiple initializations', async () => {
      // First initialization
      await request(app)
        .post('/api/catalogs/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      const firstCount = await Catalog.countDocuments({});

      // Second initialization
      await request(app)
        .post('/api/catalogs/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      const secondCount = await Catalog.countDocuments({});

      // Should not create duplicates
      expect(firstCount).toBe(secondCount);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post('/api/catalogs/initialize').expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });

    it('should create default brands', async () => {
      await request(app)
        .post('/api/catalogs/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      const toyota = await Catalog.findOne({ marca: 'Toyota' });
      const honda = await Catalog.findOne({ marca: 'Honda' });
      const nissan = await Catalog.findOne({ marca: 'Nissan' });

      expect(toyota).not.toBeNull();
      expect(honda).not.toBeNull();
      expect(nissan).not.toBeNull();
    });

    it('should create brands with models', async () => {
      await request(app)
        .post('/api/catalogs/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      const toyota = await Catalog.findOne({ marca: 'Toyota' });
      expect(toyota?.modelos.length).toBeGreaterThan(0);
      expect(toyota?.modelos[0]).toHaveProperty('nombre');
      expect(toyota?.modelos[0]).toHaveProperty('isActive', true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty marca parameter gracefully', async () => {
      const response = await request(app).get('/api/catalogs/models/').expect(404);

      expect(response.body).toHaveProperty('status', 404);
    });

    it('should handle special characters in marca', async () => {
      await Catalog.create({
        marca: 'BMW',
        modelos: [{ nombre: 'X5', isActive: true }],
        isActive: true,
      });

      const response = await request(app).get('/api/catalogs/models/BMW').expect(200);

      expect(response.body.data.marca).toBe('BMW');
    });

    it('should return empty models array for brand with no active models', async () => {
      await Catalog.create({
        marca: 'Mazda',
        modelos: [{ nombre: 'CX-5', isActive: false }],
        isActive: true,
      });

      const response = await request(app).get('/api/catalogs/models/Mazda').expect(200);

      expect(response.body.data.modelos).toEqual([]);
    });

    it('should handle concurrent requests', async () => {
      // Create initial catalog
      await Catalog.create({
        marca: 'Toyota',
        modelos: [{ nombre: 'Corolla', isActive: true }],
        isActive: true,
      });

      // Make multiple concurrent requests
      const requests = [
        request(app).get('/api/catalogs/brands'),
        request(app).get('/api/catalogs/models/Toyota'),
        request(app).get('/api/catalogs/years'),
        request(app).get('/api/catalogs'),
      ];

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 200);
      });
    });
  });
});
