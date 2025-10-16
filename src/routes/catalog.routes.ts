/**
 * Catalog Routes
 * @module routes/catalog
 * @description Rutas para catálogos de marcas, modelos y años
 */

import { Router } from 'express';
import catalogController from '../controllers/catalog.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/catalogs:
 *   get:
 *     summary: Obtener catálogo completo
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Catálogo obtenido exitosamente
 */
router.get('/', catalogController.getFullCatalog);

/**
 * @swagger
 * /api/catalogs/brands:
 *   get:
 *     summary: Obtener todas las marcas
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Marcas obtenidas exitosamente
 */
router.get('/brands', catalogController.getAllBrands);

/**
 * @swagger
 * /api/catalogs/models/{marca}:
 *   get:
 *     summary: Obtener modelos por marca
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: marca
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la marca
 *     responses:
 *       200:
 *         description: Modelos obtenidos exitosamente
 *       404:
 *         description: Marca no encontrada
 */
router.get('/models/:marca', catalogController.getModelsByBrand);

/**
 * @swagger
 * /api/catalogs/years:
 *   get:
 *     summary: Obtener catálogo de años
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Años obtenidos exitosamente
 */
router.get('/years', catalogController.getYears);

/**
 * @swagger
 * /api/catalogs/initialize:
 *   post:
 *     summary: Inicializar catálogos con datos predeterminados
 *     tags: [Catalogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catálogos inicializados exitosamente
 */
router.post('/initialize', authenticate, catalogController.initializeCatalogs);

export default router;
