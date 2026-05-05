// src/ventas/ventas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from './entities/venta.entity';
import { VentaServicio } from './entities/venta-servicio.entity';
import { VentaServicioAdicional } from './entities/venta-servicio-adicional.entity';
import { VentaPago } from './entities/venta-pago.entity';
import { ClientesModule } from '../clientes/clientes.module';
import { ServiciosModule } from 'src/servicios/servicios.module';
import { AdicionalesModule } from '../adicionales/adicionales.module';
import { MetodosPagoModule } from 'src/metodosPago/metodos-pago.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, VentaServicio, VentaServicioAdicional, VentaPago]),
    ClientesModule,
    ServiciosModule,
    AdicionalesModule,
    MetodosPagoModule,
    UsersModule,
  ],
  providers: [VentasService],
  controllers: [VentasController],
  exports: [VentasService], 
})
export class VentasModule {}