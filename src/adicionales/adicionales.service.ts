// src/adicionales/adicionales.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Adicional } from './entities/adicional.entity';
import { CreateAdicionalDto } from './dto/create-adicional.dto';
import { UpdateAdicionalDto } from './dto/update-adicional.dto';

@Injectable()
export class AdicionalesService {
  constructor(
    @InjectRepository(Adicional)
    private adicionalesRepository: Repository<Adicional>,
  ) {}

  /**
   * Crea un nuevo adicional.
   * @param createAdicionalDto Datos para crear el adicional.
   * @returns El adicional creado.
   */
  async create(createAdicionalDto: CreateAdicionalDto): Promise<Adicional> {
    const existingAdicional = await this.adicionalesRepository.findOne({ where: { nombre: createAdicionalDto.nombre } });
    if (existingAdicional) {
      throw new BadRequestException('Ya existe un adicional con este nombre.');
    }
    const newAdicional = this.adicionalesRepository.create(createAdicionalDto);
    return this.adicionalesRepository.save(newAdicional);
  }

  /**
   * Obtiene todos los adicionales con paginación.
   * @param page Número de página.
   * @param limit Cantidad de elementos por página.
   * @returns Objeto con la lista de adicionales, total, página actual y última página.
   */
  async findAll(page: number = 1, limit: number = 50): Promise<{ data: Adicional[], total: number, page: number, lastPage: number }> {
    const skip = (page - 1) * limit;
    const [result, total] = await this.adicionalesRepository.findAndCount({
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
   * Obtiene un adicional por su ID.
   * @param id ID del adicional.
   * @returns El adicional encontrado.
   */
  async findOne(id: number): Promise<Adicional> {
    const adicional = await this.adicionalesRepository.findOne({ where: { id } });
    if (!adicional) {
      throw new NotFoundException(`Adicional con ID ${id} no encontrado.`);
    }
    return adicional;
  }

  /**
   * Actualiza un adicional.
   * @param id ID del adicional a actualizar.
   * @param updateAdicionalDto Datos para actualizar el adicional.
   * @returns El adicional actualizado.
   */
  async update(id: number, updateAdicionalDto: UpdateAdicionalDto): Promise<Adicional> {
    const adicional = await this.adicionalesRepository.findOne({ where: { id } });
    if (!adicional) {
      throw new NotFoundException(`Adicional con ID ${id} no encontrado.`);
    }

    if (updateAdicionalDto.nombre && updateAdicionalDto.nombre !== adicional.nombre) {
      const existingAdicional = await this.adicionalesRepository.findOne({ where: { nombre: updateAdicionalDto.nombre } });
      if (existingAdicional && existingAdicional.id !== id) {
        throw new BadRequestException('Ya existe otro adicional con este nombre.');
      }
    }

    Object.assign(adicional, updateAdicionalDto);
    return this.adicionalesRepository.save(adicional);
  }

  /**
   * Elimina un adicional por su ID.
   * @param id ID del adicional a eliminar.
   */
  async remove(id: number): Promise<void> {
    const result = await this.adicionalesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Adicional con ID ${id} no encontrado para eliminar.`);
    }
  }
}