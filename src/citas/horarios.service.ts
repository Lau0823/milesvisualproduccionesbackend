import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from './entities/horario.entity';
import { Excepcion, TipoExcepcion } from './entities/excepcion.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { CreateExcepcionDto } from './dto/create-excepcion.dto';

@Injectable()
export class HorariosService {
    constructor(
        @InjectRepository(Horario)
        private readonly horarioRepository: Repository<Horario>,
        @InjectRepository(Excepcion)
        private readonly excepcionRepository: Repository<Excepcion>,
    ) { }

    async createHorario(createHorarioDto: CreateHorarioDto) {
        const horario = this.horarioRepository.create(createHorarioDto);
        return this.horarioRepository.save(horario);
    }

    async createExcepcion(createExcepcionDto: CreateExcepcionDto) {
        const excepcion = this.excepcionRepository.create(createExcepcionDto);
        return this.excepcionRepository.save(excepcion);
    }

    async validarDisponibilidad(empleadoId: number, inicio: Date, fin: Date): Promise<boolean> {
        // 1. Verificar excepciones (Vacaciones, Descanso)
        const fechaStr = inicio.toISOString().split('T')[0];
        const excepcion = await this.excepcionRepository.findOne({
            where: { empleado_id: empleadoId, fecha: fechaStr },
        });

        if (excepcion) {
            if (excepcion.tipo === TipoExcepcion.VACACIONES || excepcion.tipo === TipoExcepcion.DESCANSO) {
                return false; // No disponible todo el día
            }
            // Si es EXTRA o CAMBIO_HORARIO, habría que validar las horas específicas, 
            // pero por simplicidad inicial asumiremos que si hay excepción de tipo EXTRA, 
            // se usa ese horario en lugar del base.
            if (excepcion.tipo === TipoExcepcion.EXTRA || excepcion.tipo === TipoExcepcion.CAMBIO_HORARIO) {
                // Lógica simplificada: verificar si cae dentro del rango de la excepción
                // TODO: Implementar lógica detallada de horas para excepciones
                return true;
            }
        }

        // 2. Verificar horario base
        const diaSemana = inicio.getDay();
        const horario = await this.horarioRepository.findOne({
            where: { empleado_id: empleadoId, dia_semana: diaSemana },
        });

        if (!horario || horario.es_descanso) return false;

        // Validar horas
        const horaInicioCita = inicio.toTimeString().slice(0, 5);
        const horaFinCita = fin.toTimeString().slice(0, 5);

        if (horaInicioCita >= horario.hora_inicio && horaFinCita <= horario.hora_fin) {
            return true;
        }

        return false;
    }

    async findAllHorarios(empleadoId: number) {
        return this.horarioRepository.find({ where: { empleado_id: empleadoId } });
    }

    async findAllExcepciones(empleadoId: number) {
        return this.excepcionRepository.find({ where: { empleado_id: empleadoId } });
    }
}
