import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { NotFoundException } from '@nestjs/common';

describe('SettingsService', () => {
  let service: SettingsService;
  let repository: Repository<Setting>;
  let cloudinaryService: CloudinaryService;

  const mockSetting = {
    id: 1,
    key: 'site_title',
    value: 'Miles Visual',
    description: 'Título del sitio',
  } as Setting;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((setting) => Promise.resolve({ id: 1, ...setting })),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn().mockResolvedValue({ secure_url: 'http://img.jpg' }),
    uploadVideo: jest.fn().mockResolvedValue({ secure_url: 'http://vid.mp4' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getRepositoryToken(Setting),
          useValue: mockRepository,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    repository = module.get<Repository<Setting>>(getRepositoryToken(Setting));
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('debería retornar un setting por clave', async () => {
      mockRepository.findOne.mockResolvedValue(mockSetting);
      const result = await service.findOne('site_title');
      expect(result).toEqual(mockSetting);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('non_existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('debería actualizar un setting si ya existe', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockSetting });
      const result = await service.upsert('site_title', 'Nuevo Valor');
      expect(result.value).toBe('Nuevo Valor');
      expect(repository.save).toHaveBeenCalled();
    });

    it('debería crear un setting si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.upsert('new_key', 'value');
      expect(repository.create).toHaveBeenCalled();
      expect(result.key).toBe('new_key');
    });
  });

  describe('upsertMany', () => {
    it('debería procesar múltiples settings', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const settings = [
        { key: 'key1', value: 'val1' },
        { key: 'key2', value: 'val2' },
      ];
      const results = await service.upsertMany(settings);
      expect(results.length).toBe(2);
      expect(repository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('uploadFile', () => {
    it('debería subir un archivo y guardarlo como setting', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const file = { mimetype: 'image/jpeg' } as any;
      const result = await service.uploadFile('hero_image', file);
      
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(result.value).toBe('http://img.jpg');
    });
  });
});
