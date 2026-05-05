import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { User } from './users/entities/user.entity';
import { Cliente } from './clientes/entities/cliente.entity';
import { Servicio } from './servicios/entities/servicio.entity';
import { Adicional } from './adicionales/entities/adicional.entity';
import { Venta } from './ventas/entities/venta.entity';
import { VentaServicio } from './ventas/entities/venta-servicio.entity';
import { VentaServicioAdicional } from './ventas/entities/venta-servicio-adicional.entity';
import { VentaPago } from './ventas/entities/venta-pago.entity';
import { MetodoPago } from './metodosPago/entities/metodo-pago.entity';
import { Cita } from './citas/entities/cita.entity';
import { Horario } from './citas/entities/horario.entity';
import { Excepcion } from './citas/entities/excepcion.entity';
import { Reservation } from './reservations/entities/reservation.entity';
import { MediaPost } from './media-posts/entities/media-post.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientesModule } from './clientes/clientes.module';
import { MetodosPagoModule } from './metodosPago/metodos-pago.module';
import { ServiciosModule } from './servicios/servicios.module';
import { AdicionalesModule } from './adicionales/adicionales.module';
import { VentasModule } from './ventas/ventas.module';
import { CitasModule } from './citas/citas.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { SeedModule } from './common/seed/seed.module';
import { ReservationsModule } from './reservations/reservations.module';
import { MediaPostsModule } from './media-posts/media-posts.module';
import { QuoteRequest } from './quotes/entities/quote.entity';
import { QuotesModule } from './quotes/quotes.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { SettingsModule } from './settings/settings.module';
import { Setting } from './settings/entities/setting.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        const entities = [
          User,
          Cliente,
          MetodoPago,
          Servicio,
          Adicional,
          Venta,
          VentaServicio,
          VentaServicioAdicional,
          VentaPago,
          Cita,
          Horario,
          Excepcion,
          Reservation,
          MediaPost,
          QuoteRequest,
          Setting,
        ];

        const isProduction = config.get<string>('NODE_ENV') === 'production';

        if (databaseUrl) {
          // Caso Railway o Render
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: entities,
            autoLoadEntities: true,
            synchronize: true, // Forzamos true para asegurar que las tablas se creen en el VPS
            migrationsRun: false,
          };
        }

        // Caso local (sin DATABASE_URL)
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: entities,
          autoLoadEntities: true,
          synchronize: true, // Forzamos true para desarrollo y despliegue inicial
          migrationsRun: false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    ClientesModule,
    MetodosPagoModule,
    ServiciosModule,
    AdicionalesModule,
    VentasModule,
    CitasModule,
    CloudinaryModule,
    SeedModule,
    ReservationsModule,
    MediaPostsModule,
    QuotesModule,
    GoogleCalendarModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }