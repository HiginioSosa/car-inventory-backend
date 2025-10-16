/**
 * Validation Middleware
 * @module middlewares/validation
 * @description Middleware para validar requests usando express-validator
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { errorResponse } from '../utils/responseHandler';
import { deleteFile } from './upload.middleware';

/**
 * Middleware para validar requests
 * @param {ValidationChain[]} validations - Array de validaciones de express-validator
 * @returns {Function} Middleware de validación
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ejecutar todas las validaciones
    for (const validation of validations) {
      await validation.run(req);
    }

    // Verificar si hay errores
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Si hay errores y se subió un archivo, eliminarlo
    if (req.file) {
      try {
        await deleteFile(req.file.filename);
        console.log(`🗑️  Imagen eliminada por validación fallida: ${req.file.filename}`);
      } catch (error) {
        console.error('Error al eliminar imagen tras validación fallida:', error);
      }
    }

    // Formatear errores
    const extractedErrors = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
    }));

    // Retornar respuesta de error
    errorResponse(
      res,
      400,
      'Validation Error',
      JSON.stringify(extractedErrors),
      'Errores de validación'
    );
  };
};
