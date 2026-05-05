import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(key: string, file: Express.Multer.File) {
    const isVideo = file.mimetype.includes('video');
    const uploadResult = isVideo 
      ? await this.cloudinaryService.uploadVideo(file)
      : await this.cloudinaryService.uploadImage(file);
    return await this.upsert(key, uploadResult.secure_url, `Archivo para ${key}`);
  }

  async findAll() {
    return await this.settingRepository.find();
  }

  async findOne(key: string) {
    const setting = await this.settingRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }
    return setting;
  }

  async upsert(key: string, value: string, description?: string) {
    let setting = await this.settingRepository.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      return await this.settingRepository.save(setting);
    } else {
      setting = this.settingRepository.create({ key, value, description });
      return await this.settingRepository.save(setting);
    }
  }

  // Permite actualizar múltiples a la vez
  async upsertMany(settings: { key: string; value: string; description?: string }[]) {
    const results: Setting[] = [];
    for (const s of settings) {
      results.push(await this.upsert(s.key, s.value, s.description));
    }
    return results;
  }
}
