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

    async findAll() {
        return this.citaRepository.find({ relations: ['empleado', 'cliente', 'servicio'] });
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
