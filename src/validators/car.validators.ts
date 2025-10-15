/**
 * Car Validators
 * @module validators/car
 * @description Validaciones para endpoints de autos
 */

import { body, param, query } from 'express-validator';

/**
 * Validaciones para crear un auto
 * @type {ValidationChain[]}
 */
export const createCarValidations = [
  body('marca')
    .trim()
    .notEmpty()
    .withMessage('La marca es requerida')
    .isString()
    .withMessage('La marca debe ser un texto')
    .isLength({ max: 50 })
    .withMessage('La marca no puede exceder 50 caracteres'),

  body('modelo')
    .trim()
    .notEmpty()
    .withMessage('El modelo es requerido')
    .isString()
    .withMessage('El modelo debe ser un texto')
    .isLength({ max: 50 })
    .withMessage('El modelo no puede exceder 50 caracteres'),

  body('año')
    .notEmpty()
    .withMessage('El año es requerido')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`),

  body('precio')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isInt({ min: 0 })
    .withMessage('El precio debe ser un número entero positivo'),

  body('kilometraje')
    .notEmpty()
    .withMessage('El kilometraje es requerido')
    .isInt({ min: 100 })
    .withMessage('El kilometraje debe ser un número entero mayor a 100'),

  body('color')
    .optional()
    .trim()
    .isString()
    .withMessage('El color debe ser un texto')
    .isLength({ max: 50 })
    .withMessage('El color no puede exceder 50 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),

  body('telefono')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^\d{10}$/)
    .withMessage('El teléfono debe tener exactamente 10 dígitos'),
];

/**
 * Validaciones para actualizar un auto
 * @type {ValidationChain[]}
 */
export const updateCarValidations = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('El ID es requerido')
    .isMongoId()
    .withMessage('ID de auto inválido'),

  body('marca')
    .optional()
    .trim()
    .isString()
    .withMessage('La marca debe ser un texto')
    .isLength({ max: 50 })
    .withMessage('La marca no puede exceder 50 caracteres'),

  body('modelo')
    .optional()
    .trim()
    .isString()
    .withMessage('El modelo debe ser un texto')
    .isLength({ max: 50 })
    .withMessage('El modelo no puede exceder 50 caracteres'),

  body('año')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`),

  body('precio')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El precio debe ser un número entero positivo'),

  body('kilometraje')
    .optional()
    .isInt({ min: 100 })
    .withMessage('El kilometraje debe ser un número entero mayor a 100'),

  body('color')
    .optional()
    .trim()
    .isString()
    .withMessage('El color debe ser un texto')
    .isLength({ max: 50 })
    .withMessage('El color no puede exceder 50 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),

  body('telefono')
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('El teléfono debe tener exactamente 10 dígitos'),
];

/**
 * Validaciones para ID de auto
 * @type {ValidationChain[]}
 */
export const carIdValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('El ID es requerido')
    .isMongoId()
    .withMessage('ID de auto inválido'),
];

/**
 * Validaciones para filtros de búsqueda
 * @type {ValidationChain[]}
 */
export const carFilterValidations = [
  query('marca').optional().trim().isString().withMessage('La marca debe ser un texto'),

  query('modelo').optional().trim().isString().withMessage('El modelo debe ser un texto'),

  query('año').optional().isInt({ min: 1900 }).withMessage('El año debe ser un número válido'),

  query('minPrecio')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El precio mínimo debe ser un número positivo'),

  query('maxPrecio')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El precio máximo debe ser un número positivo'),

  query('color').optional().trim().isString().withMessage('El color debe ser un texto'),

  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  query('sortBy')
    .optional()
    .isIn(['precio', 'año', 'kilometraje', 'fechaAlta'])
    .withMessage('Campo de ordenamiento no válido'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser "asc" o "desc"'),
];
