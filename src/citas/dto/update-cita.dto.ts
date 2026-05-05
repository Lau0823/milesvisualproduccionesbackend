import { PartialType } from '@nestjs/swagger';
import { CreateCitaDto } from './create-cita.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoCita } from '../entities/cita.entity';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
    @IsOptional()
    @IsEnum(EstadoCita)
    estado?: EstadoCita;

    @IsOptional()
    @IsString()
    google_event_id?: string;
}
