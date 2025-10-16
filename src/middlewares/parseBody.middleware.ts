/**
 * Parse Body Middleware
 * @module middlewares/parseBody
 * @description Middleware para parsear y convertir campos del body después del upload
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para convertir campos numéricos del body
 * Se ejecuta después del upload de multer
 */
export const parseCarBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    // Convertir campos numéricos
    const numericFields = ['anio', 'precio', 'kilometraje'];

    numericFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        const parsed = parseInt(req.body[field], 10);
        if (!isNaN(parsed)) {
          req.body[field] = parsed;
        }
      }
    });
  }

  next();
};
