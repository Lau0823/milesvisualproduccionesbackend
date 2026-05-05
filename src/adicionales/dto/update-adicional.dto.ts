// src/adicionales/dto/update-adicional.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateAdicionalDto } from './create-adicional.dto';

export class UpdateAdicionalDto extends PartialType(CreateAdicionalDto) {}