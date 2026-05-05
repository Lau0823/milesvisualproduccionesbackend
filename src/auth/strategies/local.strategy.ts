// src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username', // Corrección: Asegura que el campo de usuario es 'username'
    });
  }

  /**
   * Valida las credenciales del usuario con el AuthService.
   * @param username Nombre de usuario.
   * @param password Contraseña.
   * @returns El usuario validado o lanza una excepción UnauthorizedException.
   */
  async validate(username: string, password_plain: string): Promise<any> {
    const user = await this.authService.validateUser(username, password_plain);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    return user;
  }
}