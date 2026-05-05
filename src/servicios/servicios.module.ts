// src/servicios/servicios.module.ts
// src/servicios/servicios.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { Servicio } from './entities/servicio.entity';

import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio]), CloudinaryModule],
  providers: [ServiciosService],
  controllers: [ServiciosController],
  exports: [ServiciosService, TypeOrmModule], // Exporta para su uso en otros módulos como Ventas
})
export class ServiciosModule { }