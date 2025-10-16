/**
 * Auth Controller
 * @module controllers/auth
 * @description Controlador para endpoints de autenticación
 */

import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { RegisterDTO, LoginDTO, AuthRequest } from '../types';

/**
 * Controlador de Autenticación
 * @class AuthController
 */
class AuthController {
  /**
   * Registrar nuevo usuario
   * @route POST /api/auth/register
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con usuario y token
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const data: RegisterDTO = req.body;

      const result = await authService.register(data);

      return successResponse(res, 201, 'Usuario registrado exitosamente', result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'El email ya está registrado') {
          return errorResponse(res, 409, 'Conflict', error.message, error.message);
        }
        return errorResponse(res, 400, 'Bad Request', error.message, 'Error al registrar usuario');
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Registration failed',
        'Error al registrar usuario'
      );
    }
  }

  /**
   * Iniciar sesión
   * @route POST /api/auth/login
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con usuario y token
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const data: LoginDTO = req.body;

      const result = await authService.login(data);

      return successResponse(res, 200, 'Login exitoso', result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Credenciales inválidas' || error.message === 'Cuenta desactivada') {
          return errorResponse(res, 401, 'Unauthorized', error.message, error.message);
        }
        return errorResponse(res, 400, 'Bad Request', error.message, 'Error al iniciar sesión');
      }

      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Login failed',
        'Error al iniciar sesión'
      );
    }
  }

  /**
   * Obtener perfil del usuario actual
   * @route GET /api/auth/profile
   * @param {AuthRequest} req - Request con usuario autenticado
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con perfil del usuario
   */
  async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return errorResponse(res, 401, 'Unauthorized', 'Not authenticated', 'No autenticado');
      }

      const user = await authService.getUserById(req.user.id);

      if (!user) {
        return errorResponse(res, 404, 'Not Found', 'User not found', 'Usuario no encontrado');
      }

      return successResponse(res, 200, 'Perfil obtenido exitosamente', {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch {
      return errorResponse(
        res,
        500,
        'Internal Server Error',
        'Failed to get profile',
        'Error al obtener perfil'
      );
    }
  }

  /**
   * Verificar token
   * @route POST /api/auth/verify
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Respuesta con validación del token
   */
  async verifyToken(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.body;

      if (!token) {
        return errorResponse(res, 400, 'Bad Request', 'Token is required', 'Token requerido');
      }

      const payload = authService.verifyToken(token);

      return successResponse(res, 200, 'Token válido', { valid: true, payload });
    } catch {
      return errorResponse(
        res,
        401,
        'Unauthorized',
        'Invalid or expired token',
        'Token inválido o expirado'
      );
    }
  }
}

export default new AuthController();
