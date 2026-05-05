// src/adicionales/adicionales.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdicionalesService } from './adicionales.service';
import { AdicionalesController } from './adicionales.controller';
import { Adicional } from './entities/adicional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Adicional])],
  providers: [AdicionalesService],
  controllers: [AdicionalesController],
  exports: [AdicionalesService, TypeOrmModule], // Exporta para su uso en otros módulos como Ventas
})
export class AdicionalesModule {}