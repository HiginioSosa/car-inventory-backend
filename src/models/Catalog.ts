/**
 * Catalog Model
 * @module models/Catalog
 * @description Modelo para catálogos de marcas y modelos
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para modelos de autos
 * @interface ICarModel
 */
interface ICarModel {
  nombre: string;
  isActive: boolean;
}

/**
 * Interface para el documento de Catálogo
 * @interface ICatalog
 * @extends {Document}
 */
export interface ICatalog extends Document {
  marca: string;
  modelos: ICarModel[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema de Modelo de Auto
 * @type {Schema}
 */
const carModelSchema = new Schema<ICarModel>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/**
 * Schema de Catálogo
 * @type {Schema}
 */
const catalogSchema = new Schema<ICatalog>(
  {
    marca: {
      type: String,
      required: [true, 'La marca es requerida'],
      unique: true,
      trim: true,
      index: true,
    },
    modelos: {
      type: [carModelSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Índices para optimización
 */
catalogSchema.index({ marca: 1, isActive: 1 });

export default mongoose.model<ICatalog>('Catalog', catalogSchema);
