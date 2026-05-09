import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CitasService } from './citas.service';
import { Cita, EstadoCita } from './entities/cita.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { HorariosService } from './horarios.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CitasService', () => {
  let service: CitasService;
  let citaRepository: Repository<Cita>;
  let servicioRepository: Repository<Servicio>;
  let horariosService: HorariosService;

  const mockCita = {
    id: 1,
    fecha_inicio: new Date('2026-06-01T10:00:00Z'),
    fecha_fin: new Date('2026-06-01T11:00:00Z'),
    empleado_id: 1,
    cliente_id: 1,
    servicio_id: 1,
    estado: EstadoCita.PENDIENTE,
  } as Cita;

  const mockServicio = {
    id: 1,
    nombre: 'Servicio Test',
    duracion: 60,
    precio_base: 100,
  } as Servicio;

  const mockCitaRepository = {
    create: jest.fn().mockImplementation((dto) => ({ ...dto })),
    save: jest.fn().mockImplementation((cita) => Promise.resolve({ id: 1, ...cita })),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  const mockServicioRepository = {
    findOneBy: jest.fn(),
  };

  const mockHorariosService = {
    validarDisponibilidad: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        {
          provide: getRepositoryToken(Cita),
          useValue: mockCitaRepository,
        },
        {
          provide: getRepositoryToken(Servicio),
          useValue: mockServicioRepository,
        },
        {
          provide: HorariosService,
          useValue: mockHorariosService,
        },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    citaRepository = module.get<Repository<Cita>>(getRepositoryToken(Cita));
    servicioRepository = module.get<Repository<Servicio>>(getRepositoryToken(Servicio));
    horariosService = module.get<HorariosService>(HorariosService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debería retornar citas paginadas y con filtros', async () => {
      const citas = [mockCita];
      const total = 1;
      mockCitaRepository.findAndCount.mockResolvedValue([citas, total]);

      const result = await service.findAll('2026-06-01', '2026-06-30', 1, 10);

      expect(result.data).toEqual(citas);
      expect(result.total).toBe(total);
      expect(result.page).toBe(1);
      expect(result.lastPage).toBe(1);
      expect(mockCitaRepository.findAndCount).toHaveBeenCalled();
    });

    it('debería calcular correctamente la última página', async () => {
      mockCitaRepository.findAndCount.mockResolvedValue([[], 25]);
      const result = await service.findAll(undefined, undefined, 1, 10);
      expect(result.lastPage).toBe(3);
    });
  });

  describe('create', () => {
    it('debería crear una cita exitosamente', async () => {
      const createDto = {
        fecha_inicio: '2026-06-01T10:00:00Z',
        empleado_id: 1,
        cliente_id: 1,
        servicio_id: 1,
      };

      mockServicioRepository.findOneBy.mockResolvedValue(mockServicio);
      mockHorariosService.validarDisponibilidad.mockResolvedValue(true);
      mockCitaRepository.findOne.mockResolvedValue(null); // No hay solapamientos

      const result = await service.create(createDto as any);

      expect(result.id).toBeDefined();
      expect(mockCitaRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si hay solapamiento', async () => {
      const createDto = {
        fecha_inicio: '2026-06-01T10:00:00Z',
        empleado_id: 1,
        cliente_id: 1,
        servicio_id: 1,
      };

      mockServicioRepository.findOneBy.mockResolvedValue(mockServicio);
      mockHorariosService.validarDisponibilidad.mockResolvedValue(true);
      mockCitaRepository.findOne.mockResolvedValue(mockCita); // Simula solapamiento

      await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('debería retornar una cita si existe', async () => {
      mockCitaRepository.findOne.mockResolvedValue(mockCita);
      const result = await service.findOne(1);
      expect(result).toEqual(mockCita);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockCitaRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
