/**
 * Auth Service
 * @module services/auth
 * @description Lógica de negocio para autenticación
 */

import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { config } from '../config/env';
import { RegisterDTO, LoginDTO, AuthResponse, JWTPayload } from '../types';

/**
 * Clase para manejar la lógica de autenticación
 * @class AuthService
 */
class AuthService {
  /**
   * Registrar un nuevo usuario
   * @param {RegisterDTO} data - Datos del usuario
   * @returns {Promise<AuthResponse>} Usuario creado y token
   * @throws {Error} Si el email ya está registrado
   * @example
   * const result = await authService.register({ email, password, name });
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      name,
      role: 'user',
    });

    await user.save();

    // Generar token
    const token = this.generateToken(user);

    return {
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Iniciar sesión
   * @param {LoginDTO} data - Credenciales del usuario
   * @returns {Promise<AuthResponse>} Usuario y token
   * @throws {Error} Si las credenciales son inválidas
   * @example
   * const result = await authService.login({ email, password });
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    const { email, password } = data;

    // Buscar usuario con contraseña
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new Error('Cuenta desactivada');
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = this.generateToken(user);

    return {
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Verificar token JWT
   * @param {string} token - Token JWT
   * @returns {JWTPayload} Payload del token
   * @throws {Error} Si el token es inválido
   * @example
   * const payload = authService.verifyToken(token);
   */
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Generar token JWT
   * @private
   * @param {IUser} user - Usuario
   * @returns {string} Token JWT
   * @example
   * const token = this.generateToken(user);
   */
  private generateToken(user: IUser): string {
    const payload: JWTPayload = {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Obtener usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<IUser | null>} Usuario encontrado
   * @example
   * const user = await authService.getUserById(userId);
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-password');
  }

  /**
   * Actualizar perfil de usuario
   * @param {string} userId - ID del usuario
   * @param {Partial<IUser>} data - Datos a actualizar
   * @returns {Promise<IUser | null>} Usuario actualizado
   * @example
   * const updatedUser = await authService.updateUser(userId, { name: 'Nuevo nombre' });
   */
  async updateUser(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  }
}

export default new AuthService();
