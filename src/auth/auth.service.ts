// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales del usuario por email y contraseña.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(pass, user.password_hash);

    if (isPasswordValid) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Inicia sesión de un usuario y genera un token JWT.
   */
  async login(loginUserDto: LoginUserDto): Promise<{ user: any; accessToken: string }> {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    const payload = { username: user.username, sub: user.id, rol: user.rol };
    const signedToken = this.jwtService.sign(payload); 

    return {
      accessToken: signedToken, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        username: user.username, 
        email: user.email,
        rol: user.rol,
        foto_perfil_url: user.foto_perfil_url,
        cliente_id: user.cliente_id 
      },
    };
  }
}