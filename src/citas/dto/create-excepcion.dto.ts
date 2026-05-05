import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { TipoExcepcion } from '../entities/excepcion.entity';

export class CreateExcepcionDto {
    @IsNotEmpty()
    @IsDateString()
    fecha: string;

    @IsNotEmpty()
    @IsEnum(TipoExcepcion)
    tipo: TipoExcepcion;

    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'hora_inicio debe tener formato HH:mm' })
    hora_inicio?: string;

    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'hora_fin debe tener formato HH:mm' })
    hora_fin?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsNotEmpty()
    @IsInt()
    empleado_id: number;
}
