// src/clientes/dto/register-client.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientDto {
  @ApiProperty({ description: 'Nombre completo del cliente', example: 'Maria P. González' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;

  @ApiProperty({ description: 'Número de documento del cliente (único)', example: '1029384756' })
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

  @ApiProperty({ description: 'Correo electrónico del cliente (único, opcional)', example: 'maria.gonzalez@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  correo?: string;

  @ApiProperty({ description: 'Nombre de usuario para el cliente (único, para iniciar sesión)', example: 'maria_cliente' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío.' })
  @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres.' })
  @MaxLength(50, { message: 'El nombre de usuario no debe exceder los 50 caracteres.' })
  username: string;

  @ApiProperty({ description: 'Contraseña para la cuenta del cliente (mínimo 6 caracteres)', example: 'clientePass123' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;
}