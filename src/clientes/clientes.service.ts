// src/clientes/clientes.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like} from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity'; 

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  /**
   * Crea un nuevo cliente. Este método es para uso del personal (ej. recepcionista)
   * para clientes que NO tendrán una cuenta de usuario asociada inicialmente.
   * @param createClienteDto Datos para crear el cliente.
   * @returns El cliente creado.
   */
  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const existingClienteByDoc = await this.clientesRepository.findOne({ where: { documento: createClienteDto.documento } });
    if (existingClienteByDoc) {
      throw new BadRequestException('El documento ya está registrado para otro cliente.');
    }
    if (createClienteDto.correo) {
      const existingClienteByEmail = await this.clientesRepository.findOne({ where: { correo: createClienteDto.correo } });
      if (existingClienteByEmail) {
        throw new BadRequestException('El correo electrónico ya está registrado para otro cliente.');
      }
    }
    const newCliente = this.clientesRepository.create(createClienteDto);
    return this.clientesRepository.save(newCliente);
  }

  /**
   * Permite que un cliente se registre (auto-registro), creando un registro de Cliente
   * y una cuenta de Usuario asociada para el login.
   * @param registerClientDto Datos del cliente y credenciales de usuario.
   * @returns El cliente registrado con su usuario asociado.
   */
  async registerClient(registerClientDto: RegisterClientDto): Promise<Cliente> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingClientByDoc = await queryRunner.manager.findOne(Cliente, { where: { documento: registerClientDto.documento } });
      if (existingClientByDoc) {
        throw new BadRequestException('Ya existe un cliente registrado con este documento.');
      }
      const existingUserByUsername = await this.usersService.findByUsername(registerClientDto.username);
      if (existingUserByUsername) {
        throw new BadRequestException('El nombre de usuario ya está en uso. Por favor, elige otro.');
      }
      if (registerClientDto.correo) {
        const existingClientByEmail = await queryRunner.manager.findOne(Cliente, { where: { correo: registerClientDto.correo } });
        if (existingClientByEmail) {
          throw new BadRequestException('El correo electrónico ya está registrado para otro cliente.');
        }
      }
      const newClient = queryRunner.manager.create(Cliente, {
        nombre: registerClientDto.nombre,
        documento: registerClientDto.documento,
        telefono: registerClientDto.telefono,
        correo: registerClientDto.correo,
      });
      const savedClient = await queryRunner.manager.save(newClient);
      const newUserWithoutHash = await this.usersService.create({
        nombre: registerClientDto.nombre,
        username: registerClientDto.username,
        password: registerClientDto.password,
        rol: Role.AuthenticatedClient,
        email: registerClientDto.correo,
        telefono: registerClientDto.telefono,
      });

      const userToUpdate = await queryRunner.manager.findOne(User, { where: { id: newUserWithoutHash.id } });
      if (userToUpdate) {
        userToUpdate.cliente = savedClient; 
        userToUpdate.cliente_id = savedClient.id; 
        await queryRunner.manager.save(userToUpdate);
      } else {
        throw new Error('Error interno: Usuario no encontrado después de la creación para vincular al cliente.');
      }

      await queryRunner.commitTransaction();
      savedClient.user = userToUpdate; 
      return savedClient;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


async findAll(
    page: number = 1,
    limit: number = 50,
    search?: string,
  ): Promise<{ data: Cliente[]; total: number; page: number; lastPage: number }> {
    const skip = (page - 1) * limit;
    let findOptions: any = {
      skip: skip,
      take: limit,
      order: { nombre: 'ASC' },
    };

    if (search) {
      findOptions.where = [
        { nombre: Like(`%${search}%`) },
        { documento: Like(`%${search}%`) },
        { correo: Like(`%${search}%`) },
      ];
    }
    
      const [result, total] = await this.clientesRepository.findAndCount(findOptions); 
      const lastPage = Math.ceil(total / limit);
      return {
        data: result,
        total,
        page,
        lastPage,
      };
 
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({ where: { id }, relations: ['user'] }); 
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }

    if (updateClienteDto.documento && updateClienteDto.documento !== cliente.documento) {
      const existingDocumento = await this.clientesRepository.findOne({ where: { documento: updateClienteDto.documento } });
      if (existingDocumento && existingDocumento.id !== id) {
        throw new BadRequestException('El documento ya está registrado para otro cliente.');
      }
    }
    if (updateClienteDto.correo && updateClienteDto.correo !== cliente.correo) {
      const existingEmail = await this.clientesRepository.findOne({ where: { correo: updateClienteDto.correo } });
      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('El correo electrónico ya está registrado para otro cliente.');
      }
    }

    Object.assign(cliente, updateClienteDto);
    return this.clientesRepository.save(cliente);
  }

  async remove(id: number): Promise<void> {
    const result = await this.clientesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado para eliminar.`);
    }
  }

  async countNewClients(fechaInicio: string, fechaFin: string): Promise<number> {
    const count = await this.clientesRepository.createQueryBuilder('cliente')
      .where('cliente.created_at >= :fechaInicio', { fechaInicio: new Date(fechaInicio) })
      .andWhere('cliente.created_at <= :fechaFin', { fechaFin: new Date(fechaFin + 'T23:59:59.999') })
      .getCount();
    
    return count;
  }
}