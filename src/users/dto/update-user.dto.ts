// src/users/dto/update-user.dto.ts
import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre?: string;

  @ApiProperty({ description: 'Nombre de usuario único', example: 'juanperez123', required: false })
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres.' })
  @MaxLength(50, { message: 'El nombre de usuario no debe exceder los 50 caracteres.' })
  username?: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'juan.perez@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  email?: string;

  @ApiProperty({ description: 'Nueva contraseña del usuario', example: 'new_password', required: false })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password?: string;

  @ApiProperty({ description: 'Número de teléfono', example: '1234567890', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @MaxLength(15, { message: 'El teléfono no debe exceder los 15 caracteres.' })
  telefono?: string;

  @ApiProperty({ description: 'URL de la foto de perfil', required: false })
  @IsOptional()
  @IsString()
  foto_perfil_url?: string;
}