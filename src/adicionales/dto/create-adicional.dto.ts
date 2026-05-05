// src/adicionales/dto/create-adicional.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdicionalDto {
  @ApiProperty({ description: 'Nombre del adicional (ej. Secado rápido)', example: 'Secado rápido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(255, { message: 'El nombre no debe exceder los 255 caracteres.' })
  nombre: string;

  @ApiProperty({ description: 'Precio del adicional', example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con hasta 2 decimales.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  precio: number;
}