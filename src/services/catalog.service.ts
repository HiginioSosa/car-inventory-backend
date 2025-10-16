/**
 * Catalog Service
 * @module services/catalog
 * @description Lógica de negocio para catálogos de marcas, modelos y años
 */

import Catalog, { ICatalog } from '../models/Catalog';

/**
 * Clase para manejar la lógica de catálogos
 * @class CatalogService
 */
class CatalogService {
  /**
   * Obtener todas las marcas activas
   * @returns {Promise<string[]>} Array de marcas
   */
  async getAllBrands(): Promise<string[]> {
    const catalogs = await Catalog.find({ isActive: true })
      .select('marca')
      .sort({ marca: 1 })
      .lean();

    return catalogs.map((c) => c.marca);
  }

  /**
   * Obtener modelos por marca
   * @param {string} marca - Nombre de la marca
   * @returns {Promise<string[]>} Array de modelos
   * @throws {Error} Si la marca no existe
   */
  async getModelsByBrand(marca: string): Promise<string[]> {
    const catalog = await Catalog.findOne({
      marca: { $regex: new RegExp(`^${marca}$`, 'i') },
      isActive: true,
    }).lean();

    if (!catalog) {
      throw new Error('Marca no encontrada');
    }

    return catalog.modelos
      .filter((m) => m.isActive)
      .map((m) => m.nombre)
      .sort();
  }

  /**
   * Obtener catálogo completo de años
   * @returns {Promise<number[]>} Array de años
   */
  async getYears(): Promise<number[]> {
    const currentYear = new Date().getFullYear();
    const startYear = 1990;
    const years: number[] = [];

    for (let year = currentYear + 1; year >= startYear; year--) {
      years.push(year);
    }

    return years;
  }

  /**
   * Obtener todo el catálogo (marcas con modelos)
   * @returns {Promise<ICatalog[]>} Array de catálogos
   */
  async getFullCatalog(): Promise<ICatalog[]> {
    const results = await Catalog.find({ isActive: true })
      .select('marca modelos')
      .sort({ marca: 1 })
      .lean();

    return results as unknown as ICatalog[];
  }

  /**
   * Crear o actualizar catálogo
   * @param {string} marca - Nombre de la marca
   * @param {string[]} modelos - Array de modelos
   * @returns {Promise<ICatalog>} Catálogo creado/actualizado
   */
  async upsertCatalog(marca: string, modelos: string[]): Promise<ICatalog> {
    const modelosArray = modelos.map((nombre) => ({
      nombre: nombre.trim(),
      isActive: true,
    }));

    const catalog = await Catalog.findOneAndUpdate(
      { marca: { $regex: new RegExp(`^${marca}$`, 'i') } },
      {
        marca: marca.trim(),
        modelos: modelosArray,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return catalog;
  }

  /**
   * Agregar modelo a una marca existente
   * @param {string} marca - Nombre de la marca
   * @param {string} modelo - Nombre del modelo
   * @returns {Promise<ICatalog | null>} Catálogo actualizado
   * @throws {Error} Si la marca no existe
   */
  async addModel(marca: string, modelo: string): Promise<ICatalog | null> {
    const catalog = await Catalog.findOne({
      marca: { $regex: new RegExp(`^${marca}$`, 'i') },
    });

    if (!catalog) {
      throw new Error('Marca no encontrada');
    }

    // Verificar si el modelo ya existe
    const modelExists = catalog.modelos.some(
      (m) => m.nombre.toLowerCase() === modelo.toLowerCase()
    );

    if (modelExists) {
      throw new Error('El modelo ya existe para esta marca');
    }

    catalog.modelos.push({
      nombre: modelo.trim(),
      isActive: true,
    });

    await catalog.save();

    return catalog;
  }

  /**
   * Inicializar catálogos con datos predeterminados
   * @returns {Promise<void>}
   */
  async initializeCatalogs(): Promise<void> {
    const defaultCatalogs = [
      {
        marca: 'Ford',
        modelos: ['Focus', 'Fusion', 'Mustang', 'Explorer', 'F-150', 'Escape'],
      },
      {
        marca: 'Honda',
        modelos: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'Odyssey'],
      },
      {
        marca: 'Toyota',
        modelos: ['Corolla', 'Camry', 'RAV4', 'Highlander', 'Tacoma', 'Prius'],
      },
      {
        marca: 'Chevrolet',
        modelos: ['Spark', 'Aveo', 'Cruze', 'Malibu', 'Equinox', 'Tahoe'],
      },
      {
        marca: 'Nissan',
        modelos: ['Versa', 'Sentra', 'Altima', 'Maxima', 'Rogue', 'Pathfinder'],
      },
      {
        marca: 'Volkswagen',
        modelos: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Beetle'],
      },
      {
        marca: 'Mazda',
        modelos: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9'],
      },
      {
        marca: 'BMW',
        modelos: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
      },
    ];

    for (const catalog of defaultCatalogs) {
      await this.upsertCatalog(catalog.marca, catalog.modelos);
    }
  }
}

export default new CatalogService();
