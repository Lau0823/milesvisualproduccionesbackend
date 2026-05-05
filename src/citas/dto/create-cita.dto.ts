import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoCita } from '../entities/cita.entity';

export class CreateCitaDto {
    @IsNotEmpty()
    @IsDateString()
    fecha_inicio: string;

    @IsNotEmpty()
    @IsInt()
    empleado_id: number;

    @IsNotEmpty()
    @IsInt()
    cliente_id: number;

    @IsNotEmpty()
    @IsInt()
    servicio_id: number;

    @IsOptional()
    @IsString()
    nota?: string;
}
