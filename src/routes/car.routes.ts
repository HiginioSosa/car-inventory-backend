/**
 * Car Routes
 * @module routes/car
 * @description Rutas para gestión de autos
 */

import { Router } from 'express';
import carController from '../controllers/car.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createCarValidations,
  updateCarValidations,
  carIdValidation,
  carFilterValidations,
} from '../validators/car.validators';
import { createLimiter, uploadLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Obtener todos los autos
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *       - in: query
 *         name: modelo
 *         schema:
 *           type: string
 *       - in: query
 *         name: año
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minPrecio
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPrecio
 *         schema:
 *           type: integer
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Autos obtenidos exitosamente
 */
router.get('/', authenticate, validate(carFilterValidations), carController.getAllCars);

/**
 * @swagger
 * /api/cars/stats:
 *   get:
 *     summary: Obtener estadísticas de autos
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats', authenticate, carController.getStats);

/**
 * @swagger
 * /api/cars/search:
 *   get:
 *     summary: Buscar autos por texto
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Búsqueda completada exitosamente
 */
router.get('/search', authenticate, carController.searchCars);

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Obtener auto por ID
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auto obtenido exitosamente
 *       404:
 *         description: Auto no encontrado
 */
router.get('/:id', authenticate, validate(carIdValidation), carController.getCarById);

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Crear nuevo auto
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - marca
 *               - modelo
 *               - año
 *               - precio
 *               - kilometraje
 *               - email
 *               - telefono
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               año:
 *                 type: integer
 *               precio:
 *                 type: integer
 *               kilometraje:
 *                 type: integer
 *               color:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Auto creado exitosamente
 */
router.post(
  '/',
  authenticate,
  createLimiter,
  uploadLimiter,
  uploadSingle,
  validate(createCarValidations),
  carController.createCar
);

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Actualizar auto existente
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               año:
 *                 type: integer
 *               precio:
 *                 type: integer
 *               kilometraje:
 *                 type: integer
 *               color:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Auto actualizado exitosamente
 *       404:
 *         description: Auto no encontrado
 */
router.put(
  '/:id',
  authenticate,
  uploadLimiter,
  uploadSingle,
  validate(updateCarValidations),
  carController.updateCar
);

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Eliminar auto (soft delete)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auto eliminado exitosamente
 *       404:
 *         description: Auto no encontrado
 */
router.delete('/:id', authenticate, validate(carIdValidation), carController.deleteCar);

export default router;
