import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly mailUser: string;

  constructor(private readonly configService: ConfigService) {
    this.mailUser = this.configService.get<string>('MAIL_USER') || '';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      secure: false,
      auth: {
        user: this.mailUser,
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    if (!this.mailUser) {
      this.logger.warn('MAIL_USER no está configurado. Los emails no se enviarán.');
    }
  }

  async sendReservationConfirmation(to: string, clientName: string, serviceType: string, date: string, time: string) {
    if (!to) {
      this.logger.warn('No se pudo enviar email: Destinatario vacío');
      return;
    }

    if (!this.mailUser) {
      this.logger.warn('Email no enviado: MAIL_USER no configurado');
      return;
    }

    const html = `
      <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; background-color: #fdfaf5; border: 1px solid #789894; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #789894; padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: 2px;">MILES VISUAL</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 12px; letter-spacing: 4px; text-transform: uppercase;">Confirmación de Reserva</p>
        </div>
        <div style="padding: 40px; color: #1a1a1a;">
          <h2 style="font-size: 24px; margin-bottom: 20px;">¡Hola, ${clientName}!</h2>
          <p style="line-height: 1.6; font-size: 16px;">Nos hace muy felices confirmar tu próxima sesión con nosotros. Aquí tienes los detalles de tu reserva:</p>
          
          <div style="background-color: white; padding: 25px; border-radius: 15px; margin: 30px 0; border: 1px solid rgba(0,0,0,0.05);">
            <p style="margin: 0 0 10px; font-size: 14px; color: #789894; font-weight: bold; text-transform: uppercase;">Servicio</p>
            <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold;">${serviceType}</p>
            
            <p style="margin: 0 0 10px; font-size: 14px; color: #789894; font-weight: bold; text-transform: uppercase;">Fecha y Hora</p>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${date} — ${time}</p>
          </div>
          
          <p style="line-height: 1.6; font-size: 14px; color: #666;">Si tienes alguna duda o necesitas reprogramar, no dudes en contactarnos respondiendo a este correo o vía WhatsApp.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #999; margin-top: 20px;">© 2026 Miles Visual | Fotografía Editorial</p>
          </div>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Miles Visual" <${this.mailUser}>`,
        to,
        subject: `Confirmación de tu reserva - ${serviceType}`,
        html,
      });
      this.logger.log(`Email enviado a ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error.message);
    }
  }
}
