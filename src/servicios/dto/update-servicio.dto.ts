// src/servicios/dto/update-servicio.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateServicioDto } from './create-servicio.dto';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {}