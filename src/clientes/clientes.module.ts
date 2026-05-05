// src/clientes/clientes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Cliente } from './entities/cliente.entity';
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    UsersModule, 
  ],
  providers: [ClientesService],
  controllers: [ClientesController],
  exports: [ClientesService, TypeOrmModule],
})
export class ClientesModule {}