/**
 * Rate Limiter Middleware
 * @module middlewares/rateLimiter
 * @description Middlewares para limitar requests y prevenir ataques
 */

import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/responseHandler';
import { Response, Request } from 'express';

/**
 * Rate limiter general para toda la API
 * 100 requests por 15 minutos por IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde',
  standardHeaders: true, // Retorna rate limit info en `RateLimit-*` headers
  legacyHeaders: false, // Deshabilita `X-RateLimit-*` headers
  handler: (_req: Request, res: Response) => {
    errorResponse(
      res,
      429,
      'Too Many Requests',
      'Too many requests from this IP, please try again later',
      'Demasiadas solicitudes desde esta IP, por favor intente más tarde'
    );
  },
});

/**
 * Rate limiter estricto para autenticación
 * 5 intentos por 15 minutos por IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 requests por ventana
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: 'Demasiados intentos de inicio de sesión, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    errorResponse(
      res,
      429,
      'Too Many Requests',
      'Too many login attempts from this IP, please try again after 15 minutes',
      'Demasiados intentos de inicio de sesión, por favor intente más tarde en 15 minutos'
    );
  },
});

/**
 * Rate limiter para creación de recursos
 * 20 requests por 10 minutos por IP
 */
export const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // Límite de 20 requests por ventana
  message: 'Demasiadas solicitudes de creación, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    errorResponse(
      res,
      429,
      'Too Many Requests',
      'Too many creation requests from this IP, please try again later',
      'Demasiadas solicitudes de creación, por favor intente más tarde'
    );
  },
});

/**
 * Rate limiter para upload de archivos
 * 10 uploads por 10 minutos por IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10, // Límite de 10 uploads por ventana
  message: 'Demasiadas cargas de archivos, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    errorResponse(
      res,
      429,
      'Too Many Requests',
      'Too many file uploads from this IP, please try again later',
      'Demasiadas cargas de archivos, por favor intente más tarde'
    );
  },
});
