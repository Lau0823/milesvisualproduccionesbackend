// src/metodos-pago/metodos-pago.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodosPagoService } from './metodos-pago.service';
import { MetodosPagoController } from './metodos-pago.controller';
import { MetodoPago } from './entities/metodo-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoPago])],
  providers: [MetodosPagoService],
  controllers: [MetodosPagoController],
  exports: [MetodosPagoService, TypeOrmModule], // Exporta para su uso en otros módulos como Ventas
})
export class MetodosPagoModule {}