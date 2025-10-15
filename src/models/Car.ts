/**
 * Car Model
 * @module models/Car
 * @description Modelo de auto para el inventario
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para el documento de Auto
 * @interface ICar
 * @extends {Document}
 */
export interface ICar extends Document {
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  kilometraje: number;
  color?: string;
  email: string;
  telefono: string;
  foto?: string;
  fechaAlta: Date;
  fechaModificacion: Date;
  fechaEliminacion?: Date;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

/**
 * Schema de Auto
 * @type {Schema}
 */
const carSchema = new Schema<ICar>(
  {
    marca: {
      type: String,
      required: [true, 'La marca es requerida'],
      trim: true,
      index: true,
    },
    modelo: {
      type: String,
      required: [true, 'El modelo es requerido'],
      trim: true,
      index: true,
    },
    año: {
      type: Number,
      required: [true, 'El año es requerido'],
      min: [1900, 'El año debe ser mayor a 1900'],
      max: [new Date().getFullYear() + 1, 'El año no puede ser mayor al próximo año'],
      index: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio debe ser positivo'],
      validate: {
        validator: Number.isInteger,
        message: 'El precio debe ser un número entero',
      },
      index: true,
    },
    kilometraje: {
      type: Number,
      required: [true, 'El kilometraje es requerido'],
      min: [100, 'El kilometraje debe ser mayor a 100'],
      validate: {
        validator: Number.isInteger,
        message: 'El kilometraje debe ser un número entero',
      },
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, 'El color no puede exceder 50 caracteres'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      match: [/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos'],
    },
    foto: {
      type: String,
      default: null,
    },
    fechaAlta: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    fechaModificacion: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    fechaEliminacion: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

/**
 * Middleware pre-save: Actualiza fechaModificacion
 */
carSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.fechaModificacion = new Date();
  }
  next();
});

/**
 * Middleware pre-findOneAndUpdate: Actualiza fechaModificacion
 */
carSchema.pre('findOneAndUpdate', function (next) {
  this.set({ fechaModificacion: new Date() });
  next();
});

/**
 * Índices compuestos para búsquedas optimizadas
 */
carSchema.index({ marca: 1, modelo: 1 });
carSchema.index({ precio: 1 });
carSchema.index({ año: 1 });
carSchema.index({ isDeleted: 1, fechaAlta: -1 });

export default mongoose.model<ICar>('Car', carSchema);
