import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleCalendarService } from './google-calendar.service';
import type { Response } from 'express';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) { }

  @Get('auth')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Redirige a la pantalla de consentimiento de Google
  }

  @Get('auth/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    // El usuario se autenticó. Guardamos los tokens en el servicio.
    const { user } = req;

    // Aquí podrías vincularlo con tu usuario "Admin" real en la BD.
    this.googleCalendarService.saveTokens(user.accessToken, user.refreshToken);

    // Redirigir de vuelta al panel frontend.
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin?google=success`);
  }
}
