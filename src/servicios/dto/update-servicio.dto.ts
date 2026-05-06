import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateServicioDto } from './create-servicio.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1' || value === 1)
  activo?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1' || value === 1)
  destacado?: any;
}