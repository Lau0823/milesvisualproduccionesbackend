import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { Cita } from './entities/cita.entity';
import { Horario } from './entities/horario.entity';
import { Excepcion } from './entities/excepcion.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Cita, Horario, Excepcion, Servicio, User])],
    controllers: [CitasController, HorariosController],
    providers: [CitasService, HorariosService],
    exports: [CitasService],
})
export class CitasModule { }
