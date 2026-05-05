// src/main.ts
import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UsersService } from './users/users.service';
import { SeedService } from './common/seed/seed.service';
import { Role } from './common/enums/role.enum';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  app.use(cookieParser());
  app.use(helmet());
  const usersService = app.get(UsersService);
  const existingUsers = await usersService.findAll(1, 1);

  if (existingUsers.total === 0) {
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    if (!defaultPassword && process.env.NODE_ENV === 'production') {
      console.error('ERROR CRÍTICO: DEFAULT_ADMIN_PASSWORD no está definido. No se puede crear superadmin en producción sin contraseña segura.');
    } else {
      console.log('No se encontraron usuarios. Creando usuario super_admin por defecto...');
      try {
        await usersService.create({
          nombre: 'Super Administrador Inicial',
          username: 'superadmin',
          password: defaultPassword || 'ChangeMeNow2026!',
          rol: Role.SuperAdmin,
          email: 'superadmin@milesvisual.com',
          telefono: '5551234567'
        });
        console.log('Usuario superadmin por defecto creado exitosamente.');
        if (!defaultPassword) {
          console.warn('⚠️ ADVERTENCIA: Se usó contraseña por defecto. Define DEFAULT_ADMIN_PASSWORD en .env para producción.');
        }
      } catch (error) {
        console.error('Error al crear el usuario superadmin por defecto:', error.message);
      }
    }
  }

  // Ejecutar Seeder solo en desarrollo, en producción se ejecuta manualmente
  if (process.env.NODE_ENV !== 'production') {
    const seedService = app.get(SeedService);
    // Descomentar la siguiente línea si quieres que corra automáticamente en desarrollo
    // await seedService.runSeed(); 
  }

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const corsMethods = configService.get<string>('CORS_METHODS')?.split(',');
  const corsCredentials = configService.get<string>('CORS_CREDENTIALS') === 'true';

  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin.split(',').map(s => s.trim()),
      methods: corsMethods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: corsCredentials,
      // allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], 
      // allowedHeaders: '*', 
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Credentials'
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    console.log(`CORS habilitado. Orígenes: ${corsOrigin}, Métodos: ${corsMethods ? corsMethods.join(', ') : 'Todos'}, Credenciales: ${corsCredentials}`);
  } else {
    console.warn('CORS_ORIGIN no está definido en .env. CORS no está configurado explícitamente.');
  }
  // ---------------------------

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Miles Visual')
    .setDescription('Documentación de la API de gestión para Invitaciones Digitales.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Introduce tu token JWT aquí para acceder a las rutas protegidas.',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`Documentación Swagger en: http://localhost:${port}/api`);
}
bootstrap();