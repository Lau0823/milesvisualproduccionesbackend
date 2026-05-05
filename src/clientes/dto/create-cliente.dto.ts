// src/clientes/dto/create-cliente.dto.ts
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({ description: 'Nombre completo del cliente', example: 'Tatiana Silva' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;

  @ApiProperty({ description: 'Número de documento del cliente (ej. CC, TI)', example: '1234567890' })
  @IsString({ message: 'El documento debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El documento no puede estar vacío.' })
  @MinLength(6, { message: 'El documento debe tener al menos 6 caracteres.' })
  @MaxLength(20, { message: 'El documento no debe exceder los 20 caracteres.' })
  documento: string;

  @ApiProperty({ description: 'Número de teléfono del cliente', example: '3101234567', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 caracteres.' })
  @MaxLength(15, { message: 'El teléfono no debe exceder los 15 caracteres.' })
  telefono?: string;

  @ApiProperty({ description: 'Correo electrónico del cliente', example: 'tatiana.silva@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  correo?: string;
}