// src/auth/dto/login-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'admin@milesvisual.com' })
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'password123' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;
}