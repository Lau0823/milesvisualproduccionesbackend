// src/metodos-pago/metodos-pago.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from './entities/metodo-pago.entity';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';

@Injectable()
export class MetodosPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private metodosPagoRepository: Repository<MetodoPago>,
  ) {}

  /**
   * Crea un nuevo método de pago.
   * @param createMetodoPagoDto Datos para crear el método de pago.
   * @returns El método de pago creado.
   */
  async create(createMetodoPagoDto: CreateMetodoPagoDto): Promise<MetodoPago> {
    const existingMetodo = await this.metodosPagoRepository.findOne({ where: { nombre: createMetodoPagoDto.nombre } });
    if (existingMetodo) {
      throw new BadRequestException('Ya existe un método de pago con este nombre.');
    }
    const newMetodoPago = this.metodosPagoRepository.create(createMetodoPagoDto);
    return this.metodosPagoRepository.save(newMetodoPago);
  }

  /**
   * Obtiene todos los métodos de pago con paginación.
   * @param page Número de página.
   * @param limit Cantidad de elementos por página.
   * @returns Objeto con la lista de métodos de pago, total, página actual y última página.
   */
  async findAll(page: number = 1, limit: number = 50): Promise<{ data: MetodoPago[], total: number, page: number, lastPage: number }> {
    const skip = (page - 1) * limit;
    const [result, total] = await this.metodosPagoRepository.findAndCount({
      skip: skip,
      take: limit,
      order: { nombre: 'ASC' }
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: result,
      total,
      page,
      lastPage
    };
  }

  /**
   * Obtiene un método de pago por su ID.
   * @param id ID del método de pago.
   * @returns El método de pago encontrado.
   */
  async findOne(id: number): Promise<MetodoPago> {
    const metodoPago = await this.metodosPagoRepository.findOne({ where: { id } });
    if (!metodoPago) {
      throw new NotFoundException(`Método de pago con ID ${id} no encontrado.`);
    }
    return metodoPago;
  }

  /**
   * Actualiza un método de pago.
   * @param id ID del método de pago a actualizar.
   * @param updateMetodoPagoDto Datos para actualizar el método de pago.
   * @returns El método de pago actualizado.
   */
  async update(id: number, updateMetodoPagoDto: UpdateMetodoPagoDto): Promise<MetodoPago> {
    const metodoPago = await this.metodosPagoRepository.findOne({ where: { id } });
    if (!metodoPago) {
      throw new NotFoundException(`Método de pago con ID ${id} no encontrado.`);
    }

    if (updateMetodoPagoDto.nombre && updateMetodoPagoDto.nombre !== metodoPago.nombre) {
      const existingMetodo = await this.metodosPagoRepository.findOne({ where: { nombre: updateMetodoPagoDto.nombre } });
      if (existingMetodo && existingMetodo.id !== id) {
        throw new BadRequestException('Ya existe otro método de pago con este nombre.');
      }
    }

    Object.assign(metodoPago, updateMetodoPagoDto);
    return this.metodosPagoRepository.save(metodoPago);
  }

  /**
   * Elimina un método de pago por su ID.
   * @param id ID del método de pago a eliminar.
   */
  async remove(id: number): Promise<void> {
    const result = await this.metodosPagoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Método de pago con ID ${id} no encontrado para eliminar.`);
    }
  }
}