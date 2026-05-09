import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiciosService } from './servicios.service';
import { Servicio } from './entities/servicio.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ServiciosService', () => {
  let service: ServiciosService;
  let repository: Repository<Servicio>;

  const mockServicio = {
    id: 1,
    nombre: 'Plan Boda Oro',
    precio_base: 1500,
    duracion: 60,
    descripcion: 'Un plan excelente',
    activo: true,
    destacado: false,
  } as Servicio;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((servicio) => Promise.resolve({ id: 1, ...servicio })),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        {
          provide: getRepositoryToken(Servicio),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
    repository = module.get<Repository<Servicio>>(getRepositoryToken(Servicio));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un nuevo servicio exitosamente', async () => {
      const dto = { nombre: 'Nuevo Plan', precio_base: 100, duracion: 30 };
      mockRepository.findOne.mockResolvedValue(null);
      
      const result = await service.create(dto as any);
      
      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result.nombre).toBe(dto.nombre);
    });

    it('debería lanzar BadRequestException si el nombre ya existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockServicio);
      await expect(service.create({ nombre: 'Plan Boda Oro' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('debería retornar una lista paginada de servicios', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockServicio], 1]);
      
      const result = await service.findAll(1, 10);
      
      expect(result.data).toEqual([mockServicio]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('debería retornar un servicio si existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockServicio);
      const result = await service.findOne(1);
      expect(result).toEqual(mockServicio);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar un servicio exitosamente', async () => {
      const updateDto = { nombre: 'Nombre Actualizado' };
      mockRepository.findOne.mockResolvedValueOnce(mockServicio); // First check existence
      mockRepository.findOne.mockResolvedValueOnce(null); // Check duplicate name
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce({ ...mockServicio, ...updateDto }); // findOne in return

      const result = await service.update(1, updateDto as any);
      
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.nombre).toBe('Nombre Actualizado');
    });

    it('debería lanzar BadRequestException si el nuevo nombre ya está en uso por otro servicio', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockServicio);
      mockRepository.findOne.mockResolvedValueOnce({ id: 2, nombre: 'Otro' });
      await expect(service.update(1, { nombre: 'Otro' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un servicio exitosamente', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si el servicio a eliminar no existe', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
