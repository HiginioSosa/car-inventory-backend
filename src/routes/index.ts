/**
 * Routes Index
 * @module routes
 * @description Archivo principal de rutas que agrupa todas las rutas de la aplicación
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import carRoutes from './car.routes';
import catalogRoutes from './catalog.routes';

const router = Router();

/**
 * Montar rutas en sus respectivos paths
 */
router.use('/auth', authRoutes);
router.use('/cars', carRoutes);
router.use('/catalogs', catalogRoutes);

export default router;
