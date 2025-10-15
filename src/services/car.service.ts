/**
 * Car Service
 * @module services/car
 * @description Lógica de negocio para gestión de autos
 */

import Car, { ICar } from '../models/Car';
import { CreateCarDTO, UpdateCarDTO, CarFilters, PaginatedResponse } from '../types';
import { deleteFile } from '../middlewares/upload.middleware';

/**
 * Clase para manejar la lógica de autos
 * @class CarService
 */
class CarService {
  /**
   * Obtener todos los autos con filtros y paginación
   * @param {CarFilters} filters - Filtros de búsqueda
   * @returns {Promise<PaginatedResponse<ICar>>} Autos paginados
   * @example
   * const result = await carService.getAllCars({ marca: 'Ford', page: 1 });
   */
  async getAllCars(filters: CarFilters): Promise<PaginatedResponse<ICar>> {
    const {
      marca,
      modelo,
      año,
      minPrecio,
      maxPrecio,
      color,
      page = 1,
      limit = 10,
      sortBy = 'fechaAlta',
      sortOrder = 'desc',
    } = filters;

    // Construir query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isDeleted: false };

    if (marca) {
      query.marca = { $regex: marca, $options: 'i' };
    }

    if (modelo) {
      query.modelo = { $regex: modelo, $options: 'i' };
    }

    if (año) {
      query.año = año;
    }

    if (minPrecio !== undefined || maxPrecio !== undefined) {
      query.precio = {};
      if (minPrecio !== undefined) {
        query.precio.$gte = minPrecio;
      }
      if (maxPrecio !== undefined) {
        query.precio.$lte = maxPrecio;
      }
    }

    if (color) {
      query.color = { $regex: color, $options: 'i' };
    }

    // Calcular skip y limit
    const skip = (page - 1) * limit;

    // Construir sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Ejecutar query con paginación
    const [cars, total] = await Promise.all([
      Car.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Car.countDocuments(query),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: cars as any[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener auto por ID
   * @param {string} id - ID del auto
   * @returns {Promise<ICar | null>} Auto encontrado
   * @throws {Error} Si el auto no existe o está eliminado
   * @example
   * const car = await carService.getCarById('123abc');
   */
  async getCarById(id: string): Promise<ICar | null> {
    const car = await Car.findOne({ _id: id, isDeleted: false });

    if (!car) {
      throw new Error('Auto no encontrado');
    }

    return car;
  }

  /**
   * Crear un nuevo auto
   * @param {CreateCarDTO} data - Datos del auto
   * @param {string} userId - ID del usuario que crea el auto
   * @returns {Promise<ICar>} Auto creado
   * @example
   * const car = await carService.createCar(carData, userId);
   */
  async createCar(data: CreateCarDTO, userId?: string): Promise<ICar> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carData: any = {
      ...data,
      fechaAlta: new Date(),
      fechaModificacion: new Date(),
      isDeleted: false,
    };

    if (userId) {
      carData.createdBy = userId;
    }

    const car = new Car(carData);
    await car.save();

    return car;
  }

  /**
   * Actualizar un auto existente
   * @param {string} id - ID del auto
   * @param {UpdateCarDTO} data - Datos a actualizar
   * @returns {Promise<ICar | null>} Auto actualizado
   * @throws {Error} Si el auto no existe o está eliminado
   * @example
   * const car = await carService.updateCar('123abc', { precio: 300000 });
   */
  async updateCar(id: string, data: UpdateCarDTO): Promise<ICar | null> {
    const car = await Car.findOne({ _id: id, isDeleted: false });

    if (!car) {
      throw new Error('Auto no encontrado');
    }

    // Si hay una nueva foto y el auto tenía foto anterior, eliminar la anterior
    if (data.foto && car.foto && data.foto !== car.foto) {
      try {
        await deleteFile(car.foto);
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    }

    // Actualizar campos
    Object.assign(car, data);
    car.fechaModificacion = new Date();

    await car.save();

    return car;
  }

  /**
   * Eliminar un auto (soft delete)
   * @param {string} id - ID del auto
   * @returns {Promise<ICar | null>} Auto eliminado
   * @throws {Error} Si el auto no existe o ya está eliminado
   * @example
   * const car = await carService.deleteCar('123abc');
   */
  async deleteCar(id: string): Promise<ICar | null> {
    const car = await Car.findOne({ _id: id, isDeleted: false });

    if (!car) {
      throw new Error('Auto no encontrado');
    }

    // Soft delete
    car.isDeleted = true;
    car.fechaEliminacion = new Date();
    car.fechaModificacion = new Date();

    await car.save();

    return car;
  }

  /**
   * Eliminar permanentemente un auto (hard delete)
   * @param {string} id - ID del auto
   * @returns {Promise<void>}
   * @throws {Error} Si el auto no existe
   * @example
   * await carService.hardDeleteCar('123abc');
   */
  async hardDeleteCar(id: string): Promise<void> {
    const car = await Car.findById(id);

    if (!car) {
      throw new Error('Auto no encontrado');
    }

    // Eliminar foto si existe
    if (car.foto) {
      try {
        await deleteFile(car.foto);
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }

    await Car.findByIdAndDelete(id);
  }

  /**
   * Obtener estadísticas de autos
   * @returns {Promise<object>} Estadísticas
   * @example
   * const stats = await carService.getStats();
   */
  async getStats(): Promise<{
    total: number;
    deleted: number;
    active: number;
    averagePrice: number;
    averageKm: number;
  }> {
    const [total, deleted, stats] = await Promise.all([
      Car.countDocuments({}),
      Car.countDocuments({ isDeleted: true }),
      Car.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$precio' },
            avgKm: { $avg: '$kilometraje' },
          },
        },
      ]),
    ]);

    return {
      total,
      deleted,
      active: total - deleted,
      averagePrice: stats[0]?.avgPrice || 0,
      averageKm: stats[0]?.avgKm || 0,
    };
  }

  /**
   * Buscar autos por texto
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<any[]>} Autos encontrados
   * @example
   * const cars = await carService.searchCars('Honda Civic');
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async searchCars(searchTerm: string): Promise<any[]> {
    const regex = new RegExp(searchTerm, 'i');

    return Car.find({
      isDeleted: false,
      $or: [{ marca: regex }, { modelo: regex }, { color: regex }],
    })
      .sort({ fechaAlta: -1 })
      .limit(20)
      .lean();
  }
}

export default new CarService();
