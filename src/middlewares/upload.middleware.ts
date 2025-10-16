/**
 * File Upload Middleware
 * @module middlewares/upload
 * @description Middleware para subir archivos con Multer
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../config/env';

/**
 * Crear directorio de uploads si no existe
 */
const uploadsDir = path.resolve(config.UPLOAD_PATH);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configuración de almacenamiento de Multer
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generar nombre completamente aleatorio usando UUID-like pattern
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const randomStr2 = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname).toLowerCase();

    // Formato: timestamp-random1-random2.ext
    const uniqueName = `${timestamp}-${randomStr}-${randomStr2}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * Filtro de archivos - Solo imágenes
 * @param {Request} _req - Request de Express
 * @param {Express.Multer.File} file - Archivo subido
 * @param {FileFilterCallback} cb - Callback
 * @returns {void}
 */
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Tipos MIME permitidos
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Extensiones permitidas
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'foto'));
  }
};

/**
 * Configuración de Multer
 * @type {multer.Multer}
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // 5MB por defecto
  },
});

/**
 * Middleware para subir una sola imagen
 * @type {multer.RequestHandler}
 */
export const uploadSingle = upload.single('foto');

/**
 * Middleware para subir múltiples imágenes
 * @param {number} maxCount - Número máximo de archivos
 * @returns {multer.RequestHandler}
 */
export const uploadMultiple = (maxCount: number = 5) => {
  return upload.array('fotos', maxCount);
};

/**
 * Función para eliminar archivo
 * @param {string} filePath - Ruta del archivo a eliminar
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    // Prevenir path traversal: solo usar el basename
    const safeFilename = path.basename(filePath);
    const fullPath = path.join(uploadsDir, safeFilename);

    // Verificar que el path resultante esté dentro del directorio de uploads
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(uploadsDir)) {
      console.error(`❌ Path inválido intentado: ${filePath}`);
      throw new Error('Invalid file path');
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Archivo eliminado exitosamente: ${safeFilename}`);
    } else {
      console.warn(`⚠️  Archivo no encontrado para eliminar: ${safeFilename}`);
    }
  } catch (error) {
    console.error(`❌ Error al eliminar archivo ${filePath}:`, error);
    throw error;
  }
};

/**
 * Función para obtener URL pública del archivo
 * @param {string} filename - Nombre del archivo
 * @param {Request} req - Request de Express
 * @returns {string} URL completa del archivo
 */
export const getFileUrl = (filename: string, req: Request): string => {
  // Sanitizar filename para prevenir path traversal
  const safeFilename = path.basename(filename);
  return `${req.protocol}://${req.get('host')}/uploads/${safeFilename}`;
};

export { upload };
