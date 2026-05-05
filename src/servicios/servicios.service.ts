// src/servicios/servicios.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private serviciosRepository: Repository<Servicio>,
  ) { }

  /**
   * Crea un nuevo servicio.
   * @param createServicioDto Datos para crear el servicio.
   * @returns El servicio creado.
   */
  async create(createServicioDto: CreateServicioDto): Promise<Servicio> {
    const existingServicio = await this.serviciosRepository.findOne({ where: { nombre: createServicioDto.nombre } });
    if (existingServicio) {
      throw new BadRequestException('Ya existe un servicio con este nombre.');
    }
    const newServicio = this.serviciosRepository.create(createServicioDto);
    return this.serviciosRepository.save(newServicio);
  }

  /**
   * Obtiene todos los servicios con paginación.
   * @param page Número de página.
   * @param limit Cantidad de elementos por página.
   * @returns Objeto con la lista de servicios, total, página actual y última página.
   */
  async findAll(page: number = 1, limit: number = 50): Promise<{ data: Servicio[], total: number, page: number, lastPage: number }> {
    const skip = (page - 1) * limit;
    const [result, total] = await this.serviciosRepository.findAndCount({
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
   * Obtiene el catálogo de servicios activos (Público).
   * @returns Lista de servicios activos.
   */
  async findCatalogo(): Promise<Servicio[]> {
    return this.serviciosRepository.find({
      where: { activo: true },
      order: { precio_base: 'ASC' },
    });
  }

  /**
   * Obtiene un servicio por su ID.
   * @param id ID del servicio.
   * @returns El servicio encontrado.
   */
  async findOne(id: number): Promise<Servicio> {
    const servicio = await this.serviciosRepository.findOne({ where: { id } });
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado.`);
    }
    return servicio;
  }

  /**
   * Actualiza un servicio.
   * @param id ID del servicio a actualizar.
   * @param updateServicioDto Datos para actualizar el servicio.
   * @returns El servicio actualizado.
   */
  async update(id: number, updateServicioDto: UpdateServicioDto): Promise<Servicio> {
    const servicio = await this.serviciosRepository.findOne({ where: { id } });
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado.`);
    }

    if (updateServicioDto.nombre && updateServicioDto.nombre !== servicio.nombre) {
      const existingServicio = await this.serviciosRepository.findOne({ where: { nombre: updateServicioDto.nombre } });
      if (existingServicio && existingServicio.id !== id) {
        throw new BadRequestException('Ya existe otro servicio con este nombre.');
      }
    }

    Object.assign(servicio, updateServicioDto);
    return this.serviciosRepository.save(servicio);
  }

  /**
   * Elimina un servicio por su ID.
   * @param id ID del servicio a eliminar.
   */
  async remove(id: number): Promise<void> {
    const result = await this.serviciosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado para eliminar.`);
    }
  }
}