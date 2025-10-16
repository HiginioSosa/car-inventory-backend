/**
 * Catalog Controller
 * @module controllers/catalog
 * @description Controlador para endpoints de catálogos (marcas, modelos, años)
 */

import { Request, Response } from 'express';
import catalogService from '../services/catalog.service';
import { successResponse, errorResponse } from '../utils/responseHandler';

/**
 * Controlador de Catálogos
 * @class CatalogController
 */
class CatalogController {
  /**
   * Obtener todas las marcas
   * @route GET /api/catalogs/brands
   * @param {Request} _req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con lista de marcas
   */
  async getAllBrands(_req: Request, res: Response): Promise<Response> {
    try {
      const brands = await catalogService.getAllBrands();

      return successResponse(res, 200, 'Marcas obtenidas exitosamente', { marcas: brands });
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(res, 400, 'Bad Request', error.message, 'Error al obtener marcas');
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to fetch brands',
        'Error al obtener marcas'
      );
    }
  }

  /**
   * Obtener modelos por marca
   * @route GET /api/catalogs/models/:marca
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con lista de modelos
   */
  async getModelsByBrand(req: Request, res: Response): Promise<Response> {
    try {
      const { marca } = req.params;

      if (!marca) {
        return errorResponse(res, 400, 'Bad Request', 'Brand is required', 'La marca es requerida');
      }

      const models = await catalogService.getModelsByBrand(marca);

      return successResponse(res, 200, 'Modelos obtenidos exitosamente', {
        marca,
        modelos: models,
      });
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(res, 404, 'Not Found', error.message, 'Marca no encontrada');
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to fetch models',
        'Error al obtener modelos'
      );
    }
  }

  /**
   * Obtener catálogo de años
   * @route GET /api/catalogs/years
   * @param {Request} _req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con lista de años
   */
  async getYears(_req: Request, res: Response): Promise<Response> {
    try {
      const years = await catalogService.getYears();

      return successResponse(res, 200, 'Años obtenidos exitosamente', { años: years });
    } catch {
      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to fetch years',
        'Error al obtener años'
      );
    }
  }

  /**
   * Obtener catálogo completo (marcas con modelos)
   * @route GET /api/catalogs/full
   * @param {Request} _req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con catálogo completo
   */
  async getFullCatalog(_req: Request, res: Response): Promise<Response> {
    try {
      const catalogs = await catalogService.getFullCatalog();

      return successResponse(res, 200, 'Catálogo obtenido exitosamente', { catalogs });
    } catch {
      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to fetch catalog',
        'Error al obtener catálogo'
      );
    }
  }

  /**
   * Crear o actualizar catálogo
   * @route POST /api/catalogs
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con catálogo creado/actualizado
   */
  async upsertCatalog(req: Request, res: Response): Promise<Response> {
    try {
      const { marca, modelos } = req.body;

      if (!marca || !modelos || !Array.isArray(modelos)) {
        return errorResponse(
          res,
          400,
          'Bad Request',
          'Brand and models array are required',
          'Marca y array de modelos son requeridos'
        );
      }

      const catalog = await catalogService.upsertCatalog(marca, modelos);

      return successResponse(res, 201, 'Catálogo actualizado exitosamente', catalog);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(
          res,
          400,
          'Bad Request',
          error.message,
          'Error al actualizar catálogo'
        );
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to upsert catalog',
        'Error al actualizar catálogo'
      );
    }
  }

  /**
   * Agregar modelo a una marca
   * @route POST /api/catalogs/:marca/models
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con catálogo actualizado
   */
  async addModel(req: Request, res: Response): Promise<Response> {
    try {
      const { marca } = req.params;
      const { modelo } = req.body;

      if (!marca || !modelo) {
        return errorResponse(
          res,
          400,
          'Bad Request',
          'Brand and model are required',
          'Marca y modelo son requeridos'
        );
      }

      const catalog = await catalogService.addModel(marca, modelo);

      return successResponse(res, 200, 'Modelo agregado exitosamente', catalog);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(res, 400, 'Bad Request', error.message, 'Error al agregar modelo');
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to add model',
        'Error al agregar modelo'
      );
    }
  }

  /**
   * Inicializar catálogos con datos por defecto
   * @route POST /api/catalogs/initialize
   * @param {Request} _req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta de confirmación
   */
  async initializeCatalogs(_req: Request, res: Response): Promise<Response> {
    try {
      await catalogService.initializeCatalogs();

      return successResponse(res, 201, 'Catálogos inicializados exitosamente', {
        message: 'Default catalogs have been initialized',
      });
    } catch {
      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to initialize catalogs',
        'Error al inicializar catálogos'
      );
    }
  }
}

export default new CatalogController();
