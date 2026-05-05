// src/servicios/dto/create-servicio.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength, IsNumber, Min, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServicioDto {
  @ApiProperty({ description: 'Nombre del servicio (ej. Manicure Semi)', example: 'Manicure Semi' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(255, { message: 'El nombre no debe exceder los 255 caracteres.' })
  nombre: string;

  @ApiProperty({ description: 'Precio base del servicio', example: 50000 })
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio base debe ser un número válido con hasta 2 decimales.' })
  @Min(0, { message: 'El precio base no puede ser negativo.' })
  precio_base: number;

  @ApiProperty({ description: 'Duración del servicio en minutos', example: 60, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  @IsNumber()
  @Min(1)
  duracion?: number;

  @ApiProperty({ description: 'Descripción del servicio', example: 'Servicio completo de manicure...', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ description: 'URL de la imagen del servicio', required: false })
  @IsOptional()
  @IsString()
  imagen_url?: string;

  @ApiProperty({ description: 'URL del video del servicio', required: false })
  @IsOptional()
  @IsString()
  video_url?: string;

  @ApiProperty({ description: 'Categoría del servicio', example: 'Planes', required: false })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiProperty({ description: 'Subtítulo del servicio (ej. Fotografía)', example: 'Fotografía', required: false })
  @IsOptional()
  @IsString()
  subtitulo?: string;

  @ApiProperty({ description: 'Si el servicio está activo y visible', default: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ description: 'Si el servicio es destacado (Más elegido)', default: false, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  created_at?: any;

  @IsOptional()
  updated_at?: any;
}