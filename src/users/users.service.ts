import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@milesvisual.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123*';

    const existingAdmin = await this.usersRepository.findOne({ where: { username: adminUsername } });
    
    if (!existingAdmin) {
      console.log('🌱 Seeding default admin user...');
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash(adminPassword, salt);

      const admin = this.usersRepository.create({
        nombre: 'Administrador Miles Visual',
        username: adminUsername,
        email: adminEmail,
        password_hash,
        rol: 'admin',
      });

      await this.usersRepository.save(admin);
      console.log(`✅ Admin user created: ${adminUsername}`);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ Admin user already exists.');
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.usersRepository.findOne({ where: { username: createUserDto.username } });
    if (existingUser) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password_hash,
      rol: createUserDto.rol || 'employee',
    });
    const savedUser = await this.usersRepository.save(newUser);
    const { password_hash: _, ...result } = savedUser;
    return result;
  }

  async findByUsername(username: string): Promise<User | null> { 
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> { 
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(page: number = 1, limit: number = 50): Promise<{ data: Omit<User, 'password_hash'>[], total: number, page: number, lastPage: number }> {
    const skip = (page - 1) * limit;
    const [result, total] = await this.usersRepository.findAndCount({
      skip: skip,
      take: limit,
      order: { created_at: 'DESC' },
      select: ['id', 'nombre', 'username', 'email', 'rol', 'telefono', 'foto_perfil_url', 'created_at'] 
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: result,
      total,
      page,
      lastPage
    };
  }

  async findOne(id: number): Promise<Omit<User, 'password_hash'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'username', 'email', 'rol', 'telefono', 'foto_perfil_url', 'created_at'] 
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password_hash'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUserByUsername = await this.usersRepository.findOne({ where: { username: updateUserDto.username } });
      if (existingUserByUsername && existingUserByUsername.id !== id) {
        throw new BadRequestException('El nombre de usuario ya está en uso por otro usuario.');
      }
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.password_hash = await bcrypt.hash(updateUserDto.password, salt);
    }

    const { password, ...restOfDto } = updateUserDto;
    Object.assign(user, restOfDto);

    const updatedUser = await this.usersRepository.save(user);
    const { password_hash: _, ...result } = updatedUser;
    return result;
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    const salt = await bcrypt.genSalt();
    user.password_hash = await bcrypt.hash(changePasswordDto.newPassword, salt);
    await this.usersRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async uploadAvatar(id: number, file: Express.Multer.File): Promise<{ foto_perfil_url: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file);
    user.foto_perfil_url = uploadResult.secure_url;
    await this.usersRepository.save(user);

    return { foto_perfil_url: uploadResult.secure_url };
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado para eliminar.`);
    }
  }
}