import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Cita, EstadoCita } from './entities/cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { Servicio } from '../servicios/entities/servicio.entity';
import { HorariosService } from './horarios.service';

@Injectable()
export class CitasService {
    constructor(
        @InjectRepository(Cita)
        private readonly citaRepository: Repository<Cita>,
        @InjectRepository(Servicio)
        private readonly servicioRepository: Repository<Servicio>,
        private readonly horariosService: HorariosService,
    ) { }

    async create(createCitaDto: CreateCitaDto) {
        const { fecha_inicio, empleado_id, servicio_id } = createCitaDto;
        const fechaInicio = new Date(fecha_inicio);

        // 1. Obtener duración del servicio
        const servicio = await this.servicioRepository.findOneBy({ id: servicio_id });
        if (!servicio) throw new NotFoundException('Servicio no encontrado');

        const fechaFin = new Date(fechaInicio.getTime() + servicio.duracion * 60000);

        // 2. Validar disponibilidad (Horario y Excepciones)
        const esValido = await this.horariosService.validarDisponibilidad(empleado_id, fechaInicio, fechaFin);
        if (!esValido) {
            throw new BadRequestException('El empleado no está disponible en este horario');
        }

        // 3. Validar solapamiento de citas
        const solapamiento = await this.citaRepository.findOne({
            where: [
                {
                    empleado_id,
                    fecha_inicio: LessThanOrEqual(fechaFin),
                    fecha_fin: MoreThanOrEqual(fechaInicio),
                    estado: EstadoCita.CONFIRMADA, // Solo validamos con citas confirmadas? O pendientes también? Mejor ambas si bloquean.
                },
                {
                    empleado_id,
                    fecha_inicio: LessThanOrEqual(fechaFin),
                    fecha_fin: MoreThanOrEqual(fechaInicio),
                    estado: EstadoCita.PENDIENTE,
                }
            ],
        });

        if (solapamiento) {
            throw new BadRequestException('El empleado ya tiene una cita en este horario');
        }

        const cita = this.citaRepository.create({
            ...createCitaDto,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
        });

        return this.citaRepository.save(cita);
    }

    async findAll(
        startDate?: string,
        endDate?: string,
        page: number = 1,
        limit: number = 100,
    ) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (startDate && endDate) {
            where.fecha_inicio = Between(new Date(startDate), new Date(endDate + 'T23:59:59.999'));
        } else if (startDate) {
            where.fecha_inicio = MoreThanOrEqual(new Date(startDate));
        } else if (endDate) {
            where.fecha_inicio = LessThanOrEqual(new Date(endDate + 'T23:59:59.999'));
        }

        const [result, total] = await this.citaRepository.findAndCount({
            where,
            relations: ['empleado', 'cliente', 'servicio'],
            order: { fecha_inicio: 'ASC' },
            take: limit,
            skip: skip,
        });

        return {
            data: result,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const cita = await this.citaRepository.findOne({
            where: { id },
            relations: ['empleado', 'cliente', 'servicio'],
        });
        if (!cita) throw new NotFoundException('Cita no encontrada');
        return cita;
    }

    async update(id: number, updateCitaDto: UpdateCitaDto) {
        const cita = await this.findOne(id);
        Object.assign(cita, updateCitaDto);
        return this.citaRepository.save(cita);
    }

    async remove(id: number) {
        const cita = await this.findOne(id);
        return this.citaRepository.remove(cita);
    }
}
