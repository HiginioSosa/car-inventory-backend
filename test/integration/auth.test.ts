/**
 * Integration tests for Auth API
 * @module test/integration/auth
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import User from '../../src/models/User';
import { config } from '../../src/config/env';

describe('Auth API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  // Setup: Connect to test database
  beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI);
  });

  // Cleanup: Clear database and close connection
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Clear users before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(201);

      expect(response.body).toHaveProperty('status', 201);
      expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');

      // Verify user data
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', validRegisterData.email);
      expect(response.body.data.user).toHaveProperty('name', validRegisterData.name);
      expect(response.body.data.user).toHaveProperty('role', 'user');
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify token is a string
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(0);
    });

    it('should fail when email is already registered (duplicate email)', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(validRegisterData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData)
        .expect(409);

      expect(response.body).toHaveProperty('status', 409);
      expect(response.body).toHaveProperty('name', 'Conflict');
      expect(response.body).toHaveProperty('message', 'El email ya está registrado');
    });

    it('should fail with invalid data - missing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should fail with invalid data - missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with invalid data - missing name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with password too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      email: 'login@example.com',
      password: 'password123',
      name: 'Login Test User',
    };

    beforeEach(async () => {
      // Register a user for login tests
      const response = await request(app).post('/api/auth/register').send(testUser);
      testUserId = response.body.data.user.id;
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Login exitoso');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');

      // Verify user data
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).toHaveProperty('name', testUser.name);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Save token for later tests
      authToken = response.body.data.token;
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    });

    it('should fail with inactive account', async () => {
      // Deactivate the user account
      await User.findByIdAndUpdate(testUserId, { isActive: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Cuenta desactivada');
    });

    it('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/profile', () => {
    const testUser = {
      email: 'profile@example.com',
      password: 'password123',
      name: 'Profile Test User',
    };

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await request(app).post('/api/auth/register').send(testUser);
      authToken = registerResponse.body.data.token;
      testUserId = registerResponse.body.data.user.id;
    });

    it('should get user profile successfully with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Perfil obtenido exitosamente');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('name', testUser.name);
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should fail without authorization token', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
    });

    it('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });

    it('should fail when user does not exist', async () => {
      // Delete the user but use the old token
      await User.findByIdAndDelete(testUserId);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('name', 'Not Found');
    });
  });

  describe('POST /api/auth/verify', () => {
    let validToken: string;

    beforeEach(async () => {
      // Register a user to get a valid token
      const response = await request(app).post('/api/auth/register').send({
        email: 'verify@example.com',
        password: 'password123',
        name: 'Verify Test User',
      });
      validToken = response.body.data.token;
    });

    it('should verify valid token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          token: validToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message', 'Token válido');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('valid', true);
      expect(response.body.data).toHaveProperty('payload');
      expect(response.body.data.payload).toHaveProperty('id');
      expect(response.body.data.payload).toHaveProperty('email');
      expect(response.body.data.payload).toHaveProperty('role');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          token: 'invalid.token.here',
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should fail with expired token', async () => {
      // Create an expired token (signed with past expiration)
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.4Adcj0vfN1RLdwBWKZfX1eqp8HQiVFN9T5JYFJyNjN0';

      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          token: expiredToken,
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
    });

    it('should fail when token is missing', async () => {
      const response = await request(app).post('/api/auth/verify').send({}).expect(400);

      expect(response.body).toHaveProperty('status', 400);
      expect(response.body).toHaveProperty('name', 'Bad Request');
      expect(response.body).toHaveProperty('message', 'Token is required');
    });

    it('should fail with empty token string', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          token: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });

    it('should fail with malformed JWT', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          token: 'not.a.jwt',
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
      expect(response.body).toHaveProperty('name', 'Unauthorized');
    });
  });
});
