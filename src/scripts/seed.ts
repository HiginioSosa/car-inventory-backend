/**
 * Database Seed Script
 * @module scripts/seed
 * @description Script para poblar la base de datos con datos iniciales
 */

import mongoose from 'mongoose';
import { config } from '../config/env';
import User from '../models/User';
import catalogService from '../services/catalog.service';
import { logger } from '../utils/logger';

/**
 * Conectar a la base de datos
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.success('Connected to MongoDB');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Crear usuario administrador por defecto
 */
const createAdminUser = async (): Promise<void> => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@carinventory.com' });

    if (existingAdmin) {
      logger.info('Admin user already exists');
      return;
    }

    const admin = new User({
      email: 'admin@carinventory.com',
      password: 'Admin123',
      name: 'Administrator',
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    logger.success('Admin user created successfully');
    logger.info('Email: admin@carinventory.com');
    logger.info('Password: Admin123');
  } catch (error) {
    logger.error('Error creating admin user:', error);
  }
};

/**
 * Crear usuario de prueba
 */
const createTestUser = async (): Promise<void> => {
  try {
    const existingUser = await User.findOne({ email: 'user@carinventory.com' });

    if (existingUser) {
      logger.info('Test user already exists');
      return;
    }

    const user = new User({
      email: 'user@carinventory.com',
      password: 'User123',
      name: 'Test User',
      role: 'user',
      isActive: true,
    });

    await user.save();
    logger.success('Test user created successfully');
    logger.info('Email: user@carinventory.com');
    logger.info('Password: User123');
  } catch (error) {
    logger.error('Error creating test user:', error);
  }
};

/**
 * Inicializar catálogos
 */
const initializeCatalogs = async (): Promise<void> => {
  try {
    await catalogService.initializeCatalogs();
    logger.success('Catalogs initialized successfully');
  } catch (error) {
    logger.error('Error initializing catalogs:', error);
  }
};

/**
 * Función principal
 */
const seed = async (): Promise<void> => {
  logger.info('Starting database seeding...');

  await connectDB();

  await createAdminUser();
  await createTestUser();
  await initializeCatalogs();

  logger.success('Database seeding completed!');
  logger.info('You can now use the following credentials to login:');
  logger.info('Admin: admin@carinventory.com / Admin123');
  logger.info('User: user@carinventory.com / User123');

  await mongoose.connection.close();
  process.exit(0);
};

// Ejecutar seed
seed();
