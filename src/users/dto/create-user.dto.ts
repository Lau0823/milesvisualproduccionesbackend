// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;

  @ApiProperty({ description: 'Nombre de usuario único para iniciar sesión', example: 'juanperez123' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío.' })
  @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres.' })
  @MaxLength(50, { message: 'El nombre de usuario no debe exceder los 50 caracteres.' })
  username: string; // Nuevo campo

  @ApiProperty({ description: 'Correo electrónico del usuario (opcional)', example: 'juan.perez@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  email?: string; // Ahora es opcional y no único

  @ApiProperty({ description: 'Contraseña del usuario (mínimo 6 caracteres)', example: 'password123' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @ApiProperty({ description: 'Rol del usuario (admin, empleado)', example: 'empleado', required: false })
  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto.' })
  rol?: string;

  @ApiProperty({ description: 'Número de teléfono del usuario', example: '1234567890', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 caracteres.' })
  @MaxLength(15, { message: 'El teléfono no debe exceder los 15 caracteres.' })
  telefono?: string;

  @ApiProperty({ description: 'URL de la foto de perfil', required: false })
  @IsOptional()
  @IsString()
  foto_perfil_url?: string;
}