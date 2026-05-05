// src/metodos-pago/dto/create-metodo-pago.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMetodoPagoDto {
  @ApiProperty({ description: 'Nombre del método de pago (ej. Nequi, Efectivo)', example: 'Nequi' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres.' })
  nombre: string;

  @ApiProperty({ description: 'Descripción opcional', example: 'Transferencia inmediata', required: false })
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @ApiProperty({ description: 'Estado del método de pago', example: true, required: false })
  activo?: boolean;
}