import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client;
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI') || 'http://localhost:3002/google-calendar/auth/callback'
    );
  }

  async loadTokensFromDb() {
    try {
      const accessTokenSetting = await this.settingsService.findOne('google_access_token');
      const refreshTokenSetting = await this.settingsService.findOne('google_refresh_token');

      if (accessTokenSetting && accessTokenSetting.value) {
        this.oauth2Client.setCredentials({
          access_token: accessTokenSetting.value,
          refresh_token: refreshTokenSetting?.value || null,
        });
        return true;
      }
    } catch (error) {
      // Configuraciones pueden no existir aún
    }
    return false;
  }

  async saveTokens(accessToken: string, refreshToken: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    await this.settingsService.upsert('google_access_token', accessToken, 'Google Calendar Access Token');
    if (refreshToken) {
      await this.settingsService.upsert('google_refresh_token', refreshToken, 'Google Calendar Refresh Token');
    }
  }

  async createEvent(reservationDetails: any) {
    const hasTokens = await this.loadTokensFromDb();
    if (!hasTokens) {
      this.logger.warn('Google Calendar no está vinculado (no hay tokens en la BD).');
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const startDate = new Date(`${reservationDetails.eventDate}T${reservationDetails.time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); 

    const event = {
      summary: `Reserva Miles Visual: ${reservationDetails.serviceType} - ${reservationDetails.clientName}`,
      description: `Cliente: ${reservationDetails.clientName}\nTeléfono: ${reservationDetails.phone}\nCorreo: ${reservationDetails.email}\nValor: $${reservationDetails.value}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Bogota',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Bogota',
      },
      colorId: '2', 
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error creando evento en Google Calendar', error.message);
      throw error;
    }
  }
}
