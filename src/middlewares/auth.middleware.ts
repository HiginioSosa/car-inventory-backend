/**
 * Authentication Middleware
 * @module middlewares/auth
 * @description Middleware para validar JWT y autorización
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest, JWTPayload, UserRole } from '../types';
import { errorResponse } from '../utils/responseHandler';

/**
 * Middleware para verificar JWT
 * @param {AuthRequest} req - Request con usuario
 * @param {Response} res - Response de Express
 * @param {NextFunction} next - Función next
 * @returns {void}
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 401, 'Unauthorized', 'No token provided', 'Token no proporcionado');
      return;
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

    // Agregar usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      errorResponse(res, 401, 'Unauthorized', 'Token expired', 'Token expirado');
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      errorResponse(res, 401, 'Unauthorized', 'Invalid token', 'Token inválido');
      return;
    }

    errorResponse(
      res,
      500,
      'Internal Server Error',
      'Authentication error',
      'Error de autenticación'
    );
  }
};

/**
 * Middleware para verificar rol de usuario
 * @param {UserRole[]} roles - Roles permitidos
 * @returns {Function} Middleware function
 */
export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 401, 'Unauthorized', 'Not authenticated', 'No autenticado');
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      errorResponse(res, 403, 'Forbidden', 'Insufficient permissions', 'Permisos insuficientes');
      return;
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Permite acceso sin autenticación pero agrega usuario si está autenticado
 * @param {AuthRequest} req - Request con usuario
 * @param {Response} _res - Response de Express (no utilizado)
 * @param {NextFunction} next - Función next
 * @returns {void}
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch {
    // Continuar sin autenticación si el token es inválido
    next();
  }
};
