/**
 * Database Seed Script
 * @module scripts/seed
 * @description Script para poblar la base de datos con datos iniciales
 */

import mongoose from 'mongoose';
import { config } from '../config/env';
import User from '../models/User';
import Car from '../models/Car';
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
 * Crear carros de ejemplo
 */
const createSampleCars = async (): Promise<void> => {
  try {
    const existingCars = await Car.countDocuments({ isDeleted: false });

    if (existingCars > 0) {
      logger.info(`${existingCars} cars already exist in the database`);
      return;
    }

    const sampleCars = [
      {
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2023,
        precio: 350000,
        kilometraje: 5000,
        color: 'Blanco',
        email: 'contacto@toyotastore.com',
        telefono: '5551234567',
        foto: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80',
      },
      {
        marca: 'Honda',
        modelo: 'Civic',
        anio: 2022,
        precio: 380000,
        kilometraje: 15000,
        color: 'Negro',
        email: 'ventas@hondamexico.com',
        telefono: '5552345678',
        foto: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
      },
      {
        marca: 'Mazda',
        modelo: 'CX-5',
        anio: 2024,
        precio: 520000,
        kilometraje: 2000,
        color: 'Rojo',
        email: 'info@mazdadealers.com',
        telefono: '5553456789',
        foto: 'https://images.unsplash.com/photo-1617531653520-bd466c52cae1?w=800&q=80',
      },
      {
        marca: 'Ford',
        modelo: 'Mustang',
        anio: 2023,
        precio: 750000,
        kilometraje: 8000,
        color: 'Azul',
        email: 'contacto@fordstore.com',
        telefono: '5554567890',
        foto: 'https://images.unsplash.com/photo-1584345604476-8ec5f5c3b8e0?w=800&q=80',
      },
      {
        marca: 'Chevrolet',
        modelo: 'Camaro',
        anio: 2022,
        precio: 680000,
        kilometraje: 12000,
        color: 'Amarillo',
        email: 'ventas@chevrolet.com',
        telefono: '5555678901',
        foto: 'https://images.unsplash.com/photo-1552519507-49e48579c1cf?w=800&q=80',
      },
      {
        marca: 'Nissan',
        modelo: 'Versa',
        anio: 2023,
        precio: 280000,
        kilometraje: 7000,
        color: 'Gris',
        email: 'info@nissan.com.mx',
        telefono: '5556789012',
        foto: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
      },
      {
        marca: 'Volkswagen',
        modelo: 'Jetta',
        anio: 2024,
        precio: 420000,
        kilometraje: 1500,
        color: 'Plateado',
        email: 'contacto@vw.com.mx',
        telefono: '5557890123',
        foto: 'https://images.unsplash.com/photo-1622998698838-c365f60df331?w=800&q=80',
      },
      {
        marca: 'BMW',
        modelo: 'Serie 3',
        anio: 2023,
        precio: 850000,
        kilometraje: 10000,
        color: 'Negro',
        email: 'ventas@bmw.com.mx',
        telefono: '5558901234',
        foto: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      },
      {
        marca: 'Mercedes-Benz',
        modelo: 'Clase C',
        anio: 2023,
        precio: 920000,
        kilometraje: 6000,
        color: 'Blanco',
        email: 'info@mercedes-benz.com.mx',
        telefono: '5559012345',
        foto: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      },
      {
        marca: 'Audi',
        modelo: 'A4',
        anio: 2024,
        precio: 880000,
        kilometraje: 3000,
        color: 'Gris',
        email: 'contacto@audi.com.mx',
        telefono: '5550123456',
        foto: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      },
      {
        marca: 'Hyundai',
        modelo: 'Elantra',
        anio: 2023,
        precio: 340000,
        kilometraje: 9000,
        color: 'Rojo',
        email: 'ventas@hyundai.com.mx',
        telefono: '5551234560',
        foto: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80',
      },
      {
        marca: 'Kia',
        modelo: 'Sportage',
        anio: 2024,
        precio: 480000,
        kilometraje: 4000,
        color: 'Azul',
        email: 'info@kia.com.mx',
        telefono: '5552345601',
        foto: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
      },
      {
        marca: 'Subaru',
        modelo: 'Outback',
        anio: 2023,
        precio: 560000,
        kilometraje: 11000,
        color: 'Verde',
        email: 'contacto@subaru.com.mx',
        telefono: '5553456012',
        foto: 'https://images.unsplash.com/photo-1610786148881-397a0e5c5e9c?w=800&q=80',
      },
      {
        marca: 'Tesla',
        modelo: 'Model 3',
        anio: 2024,
        precio: 1200000,
        kilometraje: 5000,
        color: 'Blanco',
        email: 'ventas@tesla.com',
        telefono: '5554567123',
        foto: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
      },
      {
        marca: 'Jeep',
        modelo: 'Wrangler',
        anio: 2023,
        precio: 780000,
        kilometraje: 13000,
        color: 'Negro',
        email: 'info@jeep.com.mx',
        telefono: '5555678234',
        foto: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&q=80',
      },
    ];

    // Obtener el usuario admin para asignar como creador
    const adminUser = await User.findOne({ email: 'admin@carinventory.com' });

    // Crear todos los carros
    const cars = sampleCars.map((carData) => ({
      ...carData,
      createdBy: adminUser?._id,
      fechaAlta: new Date(),
      fechaModificacion: new Date(),
      isDeleted: false,
    }));

    await Car.insertMany(cars);
    logger.success(`${cars.length} sample cars created successfully`);
  } catch (error) {
    logger.error('Error creating sample cars:', error);
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
  await createSampleCars();

  logger.success('Database seeding completed!');
  logger.info('You can now use the following credentials to login:');
  logger.info('Admin: admin@carinventory.com / Admin123');
  logger.info('User: user@carinventory.com / User123');

  await mongoose.connection.close();
  process.exit(0);
};

// Ejecutar seed
seed();
