import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'tu_cliente_id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'tu_secreto',
      callbackURL: 'http://localhost:3002/google-calendar/auth/callback',
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
      accessType: 'offline', // Importante para obtener el refresh_token
      prompt: 'consent',
    } as any);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      picture: profile.photos[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
