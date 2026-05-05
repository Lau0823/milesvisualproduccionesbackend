import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Setting } from './entities/setting.entity';

import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting]),
    CloudinaryModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
