/**
 * Logger and Morgan Configuration
 * @module utils/logger
 * @description Configuración de logging para la aplicación usando Morgan
 */

import morgan from 'morgan';
import { config } from '../config/env';

/**
 * Formato de Morgan según el entorno
 * @type {string}
 * @description Usa 'combined' en producción y formato personalizado en desarrollo
 */
export const morganFormat =
  config.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :response-time ms - :res[content-length]';

/**
 * Middleware de Morgan configurado
 * @type {morgan.RequestHandler}
 */
export const morganConfig = morgan(morganFormat);

/**
 * Logger personalizado con emojis y colores
 * @namespace logger
 */
export const logger = {
  /**
   * Registra un mensaje informativo
   * @param {string} message - Mensaje a registrar
   * @param {...unknown} args - Argumentos adicionales
   */
  info: (message: string, ...args: unknown[]) => {
    console.log(`ℹ️  [INFO] ${message}`, ...args);
  },
  /**
   * Registra un mensaje de error
   * @param {string} message - Mensaje de error
   * @param {...unknown} args - Argumentos adicionales
   */
  error: (message: string, ...args: unknown[]) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  },
  /**
   * Registra una advertencia
   * @param {string} message - Mensaje de advertencia
   * @param {...unknown} args - Argumentos adicionales
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`⚠️  [WARN] ${message}`, ...args);
  },
  /**
   * Registra un mensaje de éxito
   * @param {string} message - Mensaje de éxito
   * @param {...unknown} args - Argumentos adicionales
   */
  success: (message: string, ...args: unknown[]) => {
    console.log(`✅ [SUCCESS] ${message}`, ...args);
  },
  /**
   * Registra un mensaje de depuración (solo en desarrollo)
   * @param {string} message - Mensaje de depuración
   * @param {...unknown} args - Argumentos adicionales
   */
  debug: (message: string, ...args: unknown[]) => {
    if (config.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, ...args);
    }
  },
};
