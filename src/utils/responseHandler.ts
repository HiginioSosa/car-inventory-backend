/**
 * Response Handler Utility
 * @module utils/responseHandler
 * @description Utilidades para estandarizar las respuestas de la API
 */

import { Response } from 'express';

/**
 * Interface para respuestas exitosas
 * @interface SuccessResponse
 * @template T - Tipo de datos de la respuesta
 */
interface SuccessResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}

/**
 * Interface para respuestas de error
 * @interface ErrorResponse
 */
interface ErrorResponse {
  status: number;
  name: string;
  message: string;
  customMessage: string;
}

/**
 * Envía una respuesta exitosa estandarizada
 * @template T - Tipo de datos de la respuesta
 * @param {Response} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de éxito
 * @param {T} [data] - Datos a enviar en la respuesta
 * @returns {Response} Respuesta de Express
 */
export const successResponse = <T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  const response: SuccessResponse<T> = {
    status: statusCode,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta de error estandarizada
 * @param {Response} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} name - Nombre del error
 * @param {string} message - Mensaje de error en inglés
 * @param {string} customMessage - Mensaje de error en español
 * @returns {Response} Respuesta de Express
 */
export const errorResponse = (
  res: Response,
  statusCode: number,
  name: string,
  message: string,
  customMessage: string
): Response => {
  const response: ErrorResponse = {
    status: statusCode,
    name,
    message,
    customMessage,
  };
  return res.status(statusCode).json(response);
};
