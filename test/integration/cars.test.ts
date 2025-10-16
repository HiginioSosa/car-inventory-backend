/**
 * Integration tests for Cars API
 * @module test/integration/cars
 */

import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import app from '../../src/server';
import User from '../../src/models/User';
import Car, { ICar } from '../../src/models/Car';
import { config } from '../../src/config/env';

// Type for car response
interface CarResponse {
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  [key: string]: unknown;
}

describe('Cars API Integration Tests', () => {
  let authToken: string;
  let _testUserId: string;
  let testCarId: string;

  // Setup: Connect to test database and create test user
  beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI);

    // Clean up before creating user
    await User.deleteMany({ email: 'cartest@example.com' });

    // Create test user directly
    const user = await User.create({
      email: 'cartest@example.com',
      password: 'Password123',
      name: 'Car Test User',
    });
    _testUserId = (user._id as mongoose.Types.ObjectId).toString();

    // Get token by logging in
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'cartest@example.com',
      password: 'Password123',
    });
    authToken = loginResponse.body.data.token;
  });

  // Cleanup
  afterAll(async () => {
    await Car.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Car.deleteMany({});
  });

  describe('GET /api/cars', () => {
    beforeEach(async () => {
      // Create test cars
      await Car.create([
        {
          marca: 'Toyota',
          modelo: 'Corolla',
          anio: 2020,
          precio: 250000,
          kilometraje: 15000,
          color: 'Rojo',
          email: 'test1@example.com',
          telefono: '1234567890',
        },
        {
          marca: 'Honda',
          modelo: 'Civic',
          anio: 2021,
          precio: 300000,
          kilometraje: 8000,
          color: 'Azul',
          email: 'test2@example.com',
          telefono: '0987654321',
        },
        {
          marca: 'Toyota',
          modelo: 'Camry',
          anio: 2019,
          precio: 280000,
          kilometraje: 25000,
          color: 'Negro',
          email: 'test3@example.com',
          telefono: '1122334455',
        },
      ]);
    });

    it('should get all cars successfully', async () => {
      const response = await request(app)
        .get('/api/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Autos obtenidos exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });

    it('should filter cars by marca', async () => {
      const response = await request(app)
        .get('/api/cars?marca=Toyota')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(2);
      response.body.data.data.forEach((car: CarResponse) => {
        expect(car.marca).toBe('Toyota');
      });
    });

    it('should filter cars by modelo', async () => {
      const response = await request(app)
        .get('/api/cars?modelo=Civic')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].modelo).toBe('Civic');
    });

    it('should filter cars by anio', async () => {
      const response = await request(app)
        .get('/api/cars?anio=2020')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].anio).toBe(2020);
    });

    it('should filter cars by price range', async () => {
      const response = await request(app)
        .get('/api/cars?minPrecio=250000&maxPrecio=280000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.data.length).toBeGreaterThan(0);
      response.body.data.data.forEach((car: CarResponse) => {
        expect(car.precio).toBeGreaterThanOrEqual(250000);
        expect(car.precio).toBeLessThanOrEqual(280000);
      });
    });

    it('should filter cars by color', async () => {
      const response = await request(app)
        .get('/api/cars?color=Azul')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].color).toBe('Azul');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/cars?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 2);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
      expect(response.body.data.data.length).toBeLessThanOrEqual(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/cars').expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('GET /api/cars/:id', () => {
    beforeEach(async () => {
      const car = await Car.create({
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2020,
        precio: 250000,
        kilometraje: 15000,
        email: 'test@example.com',
        telefono: '1234567890',
      });
      testCarId = (car._id as mongoose.Types.ObjectId).toString();
    });

    it('should get car by id successfully', async () => {
      const response = await request(app)
        .get(`/api/cars/${testCarId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Auto obtenido exitosamente');
      expect(response.body.data).toHaveProperty('_id', testCarId);
      expect(response.body.data).toHaveProperty('marca', 'Toyota');
      expect(response.body.data).toHaveProperty('modelo', 'Corolla');
    });

    it('should return 404 for non-existent car', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/cars/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('name', 'Not Found');
    });

    it('should return 400 for invalid car id', async () => {
      const response = await request(app)
        .get('/api/cars/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/cars/${testCarId}`).expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('POST /api/cars', () => {
    const validCarData = {
      marca: 'Nissan',
      modelo: 'Sentra',
      anio: 2022,
      precio: 320000,
      kilometraje: 5000,
      color: 'Blanco',
      email: 'seller@example.com',
      telefono: '5551234567',
    };

    it('should create car successfully without photo', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .field('marca', validCarData.marca)
        .field('modelo', validCarData.modelo)
        .field('anio', validCarData.anio)
        .field('precio', validCarData.precio)
        .field('kilometraje', validCarData.kilometraje)
        .field('color', validCarData.color)
        .field('email', validCarData.email)
        .field('telefono', validCarData.telefono)
        .expect(201);

      expect(response.body).toHaveProperty('status', 201);
      expect(response.body).toHaveProperty('message', 'Auto creado exitosamente');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('marca', validCarData.marca);
      expect(response.body.data).toHaveProperty('modelo', validCarData.modelo);
      expect(response.body.data).toHaveProperty('foto', null);
    });

    it('should create car successfully with photo', async () => {
      // Create a test image file
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      const testImageBuffer = Buffer.from('fake image content');
      fs.writeFileSync(testImagePath, testImageBuffer);

      try {
        const response = await request(app)
          .post('/api/cars')
          .set('Authorization', `Bearer ${authToken}`)
          .field('marca', validCarData.marca)
          .field('modelo', validCarData.modelo)
          .field('anio', validCarData.anio)
          .field('precio', validCarData.precio)
          .field('kilometraje', validCarData.kilometraje)
          .field('color', validCarData.color)
          .field('email', validCarData.email)
          .field('telefono', validCarData.telefono)
          .attach('foto', testImagePath)
          .expect(201);

        expect(response.body).toHaveProperty('status', 201);
        expect(response.body.data).toHaveProperty('foto');
        expect(response.body.data.foto).not.toBeNull();
      } finally {
        // Cleanup test image
        if (fs.existsSync(testImagePath)) {
          fs.unlinkSync(testImagePath);
        }
      }
    });

    it('should fail with missing required field - marca', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .field('modelo', validCarData.modelo)
        .field('anio', validCarData.anio)
        .field('precio', validCarData.precio)
        .field('kilometraje', validCarData.kilometraje)
        .field('email', validCarData.email)
        .field('telefono', validCarData.telefono)
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('marca');
    });

    it('should fail with invalid año (year too old)', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .field('marca', validCarData.marca)
        .field('modelo', validCarData.modelo)
        .field('año', 1800)
        .field('precio', validCarData.precio)
        .field('kilometraje', validCarData.kilometraje)
        .field('email', validCarData.email)
        .field('telefono', validCarData.telefono)
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });

    it('should fail with invalid precio (negative)', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .field('marca', validCarData.marca)
        .field('modelo', validCarData.modelo)
        .field('anio', validCarData.anio)
        .field('precio', -1000)
        .field('kilometraje', validCarData.kilometraje)
        .field('email', validCarData.email)
        .field('telefono', validCarData.telefono)
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .field('marca', validCarData.marca)
        .field('modelo', validCarData.modelo)
        .field('anio', validCarData.anio)
        .field('precio', validCarData.precio)
        .field('kilometraje', validCarData.kilometraje)
        .field('email', 'invalid-email')
        .field('telefono', validCarData.telefono)
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });

    it('should fail with invalid telefono format', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${authToken}`)
        .field('marca', validCarData.marca)
        .field('modelo', validCarData.modelo)
        .field('anio', validCarData.anio)
        .field('precio', validCarData.precio)
        .field('kilometraje', validCarData.kilometraje)
        .field('email', validCarData.email)
        .field('telefono', '123')
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/cars')
        .field('marca', validCarData.marca)
        .field('modelo', validCarData.modelo)
        .field('anio', validCarData.anio)
        .field('precio', validCarData.precio)
        .field('kilometraje', validCarData.kilometraje)
        .field('email', validCarData.email)
        .field('telefono', validCarData.telefono)
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('PUT /api/cars/:id', () => {
    beforeEach(async () => {
      const car = await Car.create({
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2020,
        precio: 250000,
        kilometraje: 15000,
        email: 'test@example.com',
        telefono: '1234567890',
      });
      testCarId = (car._id as mongoose.Types.ObjectId).toString();
    });

    it('should update car successfully', async () => {
      const response = await request(app)
        .put(`/api/cars/${testCarId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('precio', 260000)
        .field('kilometraje', 16000)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Auto actualizado exitosamente');
      expect(response.body.data).toHaveProperty('precio', 260000);
      expect(response.body.data).toHaveProperty('kilometraje', 16000);
    });

    it('should return 404 for non-existent car', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/api/cars/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('precio', 260000)
        .expect(404);

      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('name', 'Not Found');
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .put(`/api/cars/${testCarId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('precio', -1000)
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/cars/${testCarId}`)
        .field('precio', 260000)
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('DELETE /api/cars/:id', () => {
    beforeEach(async () => {
      const car = await Car.create({
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2020,
        precio: 250000,
        kilometraje: 15000,
        email: 'test@example.com',
        telefono: '1234567890',
      });
      testCarId = (car._id as mongoose.Types.ObjectId).toString();
    });

    it('should delete car successfully (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/cars/${testCarId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Auto eliminado exitosamente');
      expect(response.body.data).toHaveProperty('id', testCarId);
      expect(response.body.data).toHaveProperty('fechaEliminacion');

      // Verify soft delete
      const car = await Car.findById(testCarId);
      expect(car).not.toBeNull();
      expect((car as ICar)?.isDeleted).toBe(true);
      expect((car as ICar)?.fechaEliminacion).not.toBeNull();
    });

    it('should return 404 for non-existent car', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/cars/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('name', 'Not Found');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/cars/${testCarId}`).expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('GET /api/cars/search', () => {
    beforeEach(async () => {
      await Car.create([
        {
          marca: 'Toyota',
          modelo: 'Corolla',
          anio: 2020,
          precio: 250000,
          kilometraje: 15000,
          email: 'test1@example.com',
          telefono: '1234567890',
        },
        {
          marca: 'Honda',
          modelo: 'Civic',
          anio: 2021,
          precio: 300000,
          kilometraje: 8000,
          email: 'test2@example.com',
          telefono: '0987654321',
        },
      ]);
    });

    it('should search cars successfully with query', async () => {
      const response = await request(app)
        .get('/api/cars/search?q=Toyota')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Búsqueda completada exitosamente');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail without query parameter', async () => {
      const response = await request(app)
        .get('/api/cars/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('message', 'Search term is required');
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/cars/search?q=Ferrari')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/cars/search?q=Toyota').expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });

  describe('GET /api/cars/stats', () => {
    beforeEach(async () => {
      await Car.create([
        {
          marca: 'Toyota',
          modelo: 'Corolla',
          anio: 2020,
          precio: 250000,
          kilometraje: 15000,
          email: 'test1@example.com',
          telefono: '1234567890',
        },
        {
          marca: 'Honda',
          modelo: 'Civic',
          anio: 2021,
          precio: 300000,
          kilometraje: 8000,
          email: 'test2@example.com',
          telefono: '0987654321',
        },
      ]);
    });

    it('should get car statistics successfully', async () => {
      const response = await request(app)
        .get('/api/cars/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Estadísticas obtenidas exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.total).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/cars/stats').expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });
  });
});
