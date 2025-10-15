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
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
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

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP)') as any);
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
 * @example
 * router.post('/cars', uploadSingle, createCar);
 */
export const uploadSingle = upload.single('foto');

/**
 * Middleware para subir múltiples imágenes
 * @param {number} maxCount - Número máximo de archivos
 * @returns {multer.RequestHandler}
 * @example
 * router.post('/gallery', uploadMultiple(5), createGallery);
 */
export const uploadMultiple = (maxCount: number = 5) => {
  return upload.array('fotos', maxCount);
};

/**
 * Función para eliminar archivo
 * @param {string} filePath - Ruta del archivo a eliminar
 * @returns {Promise<void>}
 * @example
 * await deleteFile(car.foto);
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(uploadsDir, path.basename(filePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Función para obtener URL pública del archivo
 * @param {string} filename - Nombre del archivo
 * @param {Request} req - Request de Express
 * @returns {string} URL completa del archivo
 * @example
 * const photoUrl = getFileUrl(filename, req);
 */
export const getFileUrl = (filename: string, req: Request): string => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};
