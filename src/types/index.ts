/**
 * Types and Interfaces
 * @module types
 * @description Tipos e interfaces globales de la aplicación
 */

import { Request } from 'express';

/**
 * Interface para el request autenticado
 * @interface AuthRequest
 * @extends {Request}
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Interface para payload de JWT
 * @interface JWTPayload
 */
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Interface para datos de registro
 * @interface RegisterDTO
 */
export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

/**
 * Interface para datos de login
 * @interface LoginDTO
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Interface para respuesta de autenticación
 * @interface AuthResponse
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

/**
 * Interface para crear un auto
 * @interface CreateCarDTO
 */
export interface CreateCarDTO {
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  kilometraje: number;
  color?: string;
  email: string;
  telefono: string;
  foto?: string;
}

/**
 * Type para actualizar un auto
 * @type UpdateCarDTO
 */
export type UpdateCarDTO = Partial<CreateCarDTO>;

/**
 * Interface para filtros de búsqueda de autos
 * @interface CarFilters
 */
export interface CarFilters {
  marca?: string;
  modelo?: string;
  anio?: number;
  minPrecio?: number;
  maxPrecio?: number;
  color?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface para respuesta paginada
 * @interface PaginatedResponse
 * @template T
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Interface para catálogo de años
 * @interface YearCatalog
 */
export interface YearCatalog {
  anios: number[];
}

/**
 * Type para roles de usuario
 * @type {UserRole}
 */
export type UserRole = 'admin' | 'user';

/**
 * Type para códigos de estado HTTP
 * @type {HttpStatusCode}
 */
export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 500;

/**
 * Interface para objeto de Car con datos serializados
 */
export interface CarResponse {
  _id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  kilometraje: number;
  color?: string;
  email: string;
  telefono: string;
  foto: string | null;
  fechaAlta: string;
  fechaModificacion: string;
  fechaEliminacion?: string | null;
  isDeleted: boolean;
  createdBy?: string;
}

/**
 * Interface para catálogo completo de marcas y modelos
 */
export interface CatalogResponse {
  _id: string;
  marca: string;
  modelos: Array<{
    nombre: string;
    isActive: boolean;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type para query de MongoDB
 */
export interface MongoQuery {
  isDeleted: boolean;
  marca?: { $regex: string | RegExp; $options: string };
  modelo?: { $regex: string | RegExp; $options: string };
  anio?: number;
  precio?: {
    $gte?: number;
    $lte?: number;
  };
  color?: { $regex: string | RegExp; $options: string };
}

/**
 * Type para opciones de ordenamiento de MongoDB
 */
export type SortOptions = {
  [key: string]: 1 | -1;
};
