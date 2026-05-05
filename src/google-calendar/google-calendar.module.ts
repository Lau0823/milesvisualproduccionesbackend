import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { GoogleStrategy } from './google.strategy';
import { PassportModule } from '@nestjs/passport';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    SettingsModule,
  ],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService, GoogleStrategy],
  exports: [GoogleCalendarService], // Exportamos para que ReservationsModule pueda usarlo
})
export class GoogleCalendarModule {}
