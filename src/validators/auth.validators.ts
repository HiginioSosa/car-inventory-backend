/**
 * Auth Validators
 * @module validators/auth
 * @description Validaciones para endpoints de autenticación
 */

import { body } from 'express-validator';

/**
 * Validaciones para registro de usuario
 * @type {ValidationChain[]}
 */
export const registerValidations = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isString()
    .withMessage('El nombre debe ser un texto')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
];

/**
 * Validaciones para login de usuario
 * @type {ValidationChain[]}
 */
export const loginValidations = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isString()
    .withMessage('La contraseña debe ser un texto'),
];
