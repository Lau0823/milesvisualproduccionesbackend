// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno.');
    }
    super({
      // Soportar tanto cookie como header Authorization: Bearer
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['jwt'] || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Valida el payload (contenido) del JWT.
   * Se ejecuta si el token es válido y no ha expirado.
   */
  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      this.logger.warn(`Usuario con ID ${payload.sub} no encontrado`);
      throw new UnauthorizedException('Usuario no encontrado o dado de baja.');
    }

    if (user.rol !== payload.rol) {
      this.logger.warn(`Inconsistencia de rol para "${(user as any).username}". DB: "${user.rol}", Token: "${payload.rol}"`);
      throw new UnauthorizedException('Token desactualizado. Vuelve a iniciar sesión.');
    }

    return { id: user.id, username: (user as any).username, rol: user.rol, cliente_id: (user as any).cliente_id };
  }
}