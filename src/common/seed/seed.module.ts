import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Servicio } from '../../servicios/entities/servicio.entity';
import { MetodoPago } from '../../metodosPago/entities/metodo-pago.entity';
import { Setting } from '../../settings/entities/setting.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { MediaPost } from '../../media-posts/entities/media-post.entity';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Servicio, 
      MetodoPago, 
      Setting, 
      Reservation, 
      MediaPost,
      User
    ])
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
