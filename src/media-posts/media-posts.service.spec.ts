import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaPostsService } from './media-posts.service';
import { MediaPost } from './entities/media-post.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { NotFoundException } from '@nestjs/common';

describe('MediaPostsService', () => {
  let service: MediaPostsService;
  let repository: Repository<MediaPost>;
  let cloudinaryService: CloudinaryService;

  const mockMediaPost = {
    id: 1,
    title: 'Foto Boda',
    category: 'Bodas',
    cloudinaryUrl: 'http://res.cloudinary.com/image.jpg',
    cloudinaryPublicId: 'public_id_123',
  } as MediaPost;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((post) => Promise.resolve({ id: 1, ...post })),
    find: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn().mockImplementation((post, dto) => Object.assign(post, dto)),
    remove: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn().mockResolvedValue({ secure_url: 'http://new-url.jpg', public_id: 'new_id' }),
    uploadVideo: jest.fn().mockResolvedValue({ secure_url: 'http://new-video.mp4', public_id: 'new_video_id' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaPostsService,
        {
          provide: getRepositoryToken(MediaPost),
          useValue: mockRepository,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<MediaPostsService>(MediaPostsService);
    repository = module.get<Repository<MediaPost>>(getRepositoryToken(MediaPost));
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un post sin archivo', async () => {
      const dto = { title: 'Test', category: 'General' };
      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe(dto.title);
    });

    it('debería subir imagen y crear un post si se provee un archivo de imagen', async () => {
      const dto = { title: 'Test' };
      const file = { mimetype: 'image/jpeg' } as any;

      const result = await service.create(dto, file);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(result.cloudinaryUrl).toBe('http://new-url.jpg');
    });

    it('debería subir video si el archivo es un video', async () => {
      const dto = { title: 'Video Test' };
      const file = { mimetype: 'video/mp4' } as any;

      const result = await service.create(dto, file);

      expect(cloudinaryService.uploadVideo).toHaveBeenCalledWith(file);
      expect(result.cloudinaryUrl).toBe('http://new-video.mp4');
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los posts ordenados por fecha', async () => {
      mockRepository.find.mockResolvedValue([mockMediaPost]);
      const result = await service.findAll();
      expect(result).toEqual([mockMediaPost]);
      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });
  });

  describe('update', () => {
    it('debería actualizar los datos de un post', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockMediaPost);
      const updateDto = { title: 'Nuevo Titulo' };

      const result = await service.update(1, updateDto);

      expect(repository.merge).toHaveBeenCalled();
      expect(result.title).toBe('Nuevo Titulo');
    });

    it('debería actualizar la imagen si se provee un nuevo archivo', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockMediaPost);
      const file = { mimetype: 'image/png' } as any;

      const result = await service.update(1, {}, file);

      expect(cloudinaryService.uploadImage).toHaveBeenCalled();
      expect(result.cloudinaryUrl).toBe('http://new-url.jpg');
    });
  });

  describe('remove', () => {
    it('debería eliminar un post existente', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockMediaPost);
      mockRepository.remove.mockResolvedValue(mockMediaPost);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockMediaPost);
    });

    it('debería lanzar NotFoundException si no existe el post a eliminar', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
