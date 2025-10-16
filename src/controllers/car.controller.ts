/**
 * Car Controller
 * @module controllers/car
 * @description Controlador para endpoints de autos
 */

import { Request, Response } from 'express';
import carService from '../services/car.service';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { CreateCarDTO, UpdateCarDTO, CarFilters, AuthRequest, CarResponse } from '../types';
import { getFileUrl } from '../middlewares/upload.middleware';
import { ICar } from '../models/Car';

/**
 * Controlador de Autos
 * @class CarController
 */
class CarController {
  /**
   * Obtener todos los autos con filtros
   * @route GET /api/cars
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con lista de autos
   */
  async getAllCars(req: Request, res: Response): Promise<Response> {
    try {
      const filters: CarFilters = {
        marca: req.query.marca as string,
        modelo: req.query.modelo as string,
        año: req.query.año ? parseInt(req.query.año as string) : undefined,
        minPrecio: req.query.minPrecio ? parseInt(req.query.minPrecio as string) : undefined,
        maxPrecio: req.query.maxPrecio ? parseInt(req.query.maxPrecio as string) : undefined,
        color: req.query.color as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sortBy: (req.query.sortBy as string) || 'fechaAlta',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await carService.getAllCars(filters);

      // Agregar URL completa a las fotos y convertir fechas a ISO
      const carsWithUrls = result.data.map((car: ICar) => {
        const carObj = car as unknown as Record<string, unknown>;
        return {
          ...carObj,
          foto: carObj.foto ? getFileUrl(carObj.foto as string, req) : null,
          fechaAlta: (carObj.fechaAlta as Date).toISOString(),
          fechaModificacion: (carObj.fechaModificacion as Date).toISOString(),
          fechaEliminacion: carObj.fechaEliminacion
            ? (carObj.fechaEliminacion as Date).toISOString()
            : null,
        } as CarResponse;
      });

      return successResponse(res, 200, 'Autos obtenidos exitosamente', {
        ...result,
        data: carsWithUrls,
      });
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(res, 400, 'Bad Request', error.message, 'Error al obtener autos');
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to fetch cars',
        'Error al obtener autos'
      );
    }
  }

  /**
   * Obtener auto por ID
   * @route GET /api/cars/:id
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con auto encontrado
   */
  async getCarById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const car = await carService.getCarById(id);

      if (!car) {
        return errorResponse(res, 404, 'Not Found', 'Car not found', 'Auto no encontrado');
      }

      // Agregar URL completa a la foto
      const carWithUrl = {
        ...car.toObject(),
        foto: car.foto ? getFileUrl(car.foto, req) : null,
      };

      return successResponse(res, 200, 'Auto obtenido exitosamente', carWithUrl);
    } catch (error) {
      if (error instanceof Error && error.message === 'Auto no encontrado') {
        return errorResponse(res, 404, 'Not Found', error.message, error.message);
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to fetch car',
        'Error al obtener auto'
      );
    }
  }

  /**
   * Crear nuevo auto
   * @route POST /api/cars
   * @param {AuthRequest} req - Request con usuario autenticado
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con auto creado
   */
  async createCar(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const data: CreateCarDTO = req.body;

      // Si hay foto, agregar el nombre del archivo
      if (req.file) {
        data.foto = req.file.filename;
      }

      const car = await carService.createCar(data, req.user?.id);

      // Agregar URL completa a la foto
      const carWithUrl = {
        ...car.toObject(),
        foto: car.foto ? getFileUrl(car.foto, req) : null,
      };

      return successResponse(res, 201, 'Auto creado exitosamente', {
        id: car._id,
        fechaAlta: car.fechaAlta.toISOString(),
        ...carWithUrl,
      });
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse(res, 400, 'Bad Request', error.message, 'Error al crear auto');
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to create car',
        'Error al crear auto'
      );
    }
  }

  /**
   * Actualizar auto existente
   * @route PUT /api/cars/:id
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con auto actualizado
   */
  async updateCar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data: UpdateCarDTO = req.body;

      // Si hay nueva foto, agregar el nombre del archivo
      if (req.file) {
        data.foto = req.file.filename;
      }

      const car = await carService.updateCar(id, data);

      if (!car) {
        return errorResponse(res, 404, 'Not Found', 'Car not found', 'Auto no encontrado');
      }

      // Agregar URL completa a la foto
      const carWithUrl = {
        ...car.toObject(),
        foto: car.foto ? getFileUrl(car.foto, req) : null,
      };

      return successResponse(res, 200, 'Auto actualizado exitosamente', carWithUrl);
    } catch (error) {
      if (error instanceof Error && error.message === 'Auto no encontrado') {
        return errorResponse(res, 404, 'Not Found', error.message, error.message);
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to update car',
        'Error al actualizar auto'
      );
    }
  }

  /**
   * Eliminar auto (soft delete)
   * @route DELETE /api/cars/:id
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con confirmación
   */
  async deleteCar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const car = await carService.deleteCar(id);

      if (!car) {
        return errorResponse(res, 404, 'Not Found', 'Car not found', 'Auto no encontrado');
      }

      return successResponse(res, 200, 'Auto eliminado exitosamente', {
        id: car._id,
        fechaEliminacion: car.fechaEliminacion?.toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Auto no encontrado') {
        return errorResponse(res, 404, 'Not Found', error.message, error.message);
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to delete car',
        'Error al eliminar auto'
      );
    }
  }

  /**
   * Obtener estadísticas de autos
   * @route GET /api/cars/stats
   * @param {Request} _req - Request de Express (no utilizado)
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con estadísticas
   */
  async getStats(_req: Request, res: Response): Promise<Response> {
    try {
      const stats = await carService.getStats();

      return successResponse(res, 200, 'Estadísticas obtenidas exitosamente', stats);
    } catch {
      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to get stats',
        'Error al obtener estadísticas'
      );
    }
  }

  /**
   * Buscar autos por texto
   * @route GET /api/cars/search
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con autos encontrados
   */
  async searchCars(req: Request, res: Response): Promise<Response> {
    try {
      const searchTerm = req.query.q as string;

      if (!searchTerm) {
        return errorResponse(
          res,
          400,
          'Bad Request',
          'Search term is required',
          'Término de búsqueda requerido'
        );
      }

      const cars = await carService.searchCars(searchTerm);

      // Agregar URL completa a las fotos y convertir fechas a ISO
      const carsWithUrls = cars.map((car: ICar) => {
        const carObj = car as unknown as Record<string, unknown>;
        return {
          ...carObj,
          foto: carObj.foto ? getFileUrl(carObj.foto as string, req) : null,
          fechaAlta: (carObj.fechaAlta as Date).toISOString(),
          fechaModificacion: (carObj.fechaModificacion as Date).toISOString(),
          fechaEliminacion: carObj.fechaEliminacion
            ? (carObj.fechaEliminacion as Date).toISOString()
            : null,
        } as CarResponse;
      });

      return successResponse(res, 200, 'Búsqueda completada exitosamente', carsWithUrls);
    } catch {
      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Search failed',
        'Error en la búsqueda'
      );
    }
  }
}

export default new CarController();
