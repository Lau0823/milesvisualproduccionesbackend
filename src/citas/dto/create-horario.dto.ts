import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateHorarioDto {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(6)
    dia_semana: number;

    @IsNotEmpty()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'hora_inicio debe tener formato HH:mm' })
    hora_inicio: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'hora_fin debe tener formato HH:mm' })
    hora_fin: string;

    @IsOptional()
    @IsBoolean()
    es_descanso?: boolean;

    @IsNotEmpty()
    @IsInt()
    empleado_id: number;
}
