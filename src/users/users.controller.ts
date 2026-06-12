import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipeBuilder } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
    rol: string;
    cliente_id?: number;
  };
}

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('profile')
  @ApiOperation({ summary: 'Obtiene el perfil del usuario autenticado' })
  getProfile(@Req() req: RequestWithUser) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Actualiza el perfil del usuario autenticado' })
  updateProfile(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    // Forzar que solo se actualice el ID del usuario logueado
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Post('profile/change-password')
  @ApiOperation({ summary: 'Cambia la contraseña del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta o datos inválidos.' })
  changePassword(@Req() req: RequestWithUser, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('profile/upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Sube una foto de perfil para el usuario autenticado' })
  uploadAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5242880, message: 'El archivo supera el límite de 5 MB' })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    ) file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(req.user.id, file);
  }

  @Post()
  @Roles(Role.SuperAdmin, Role.Admin, Role.Supervisor)
  @ApiOperation({ summary: 'Crea un nuevo usuario (requiere rol SuperAdmin o Admin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.SuperAdmin, Role.Admin, Role.Supervisor, Role.Employee) 
  @ApiOperation({ summary: 'Obtiene todos los usuarios con paginación (requiere rol de personal)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página', example: 50 })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(Role.SuperAdmin, Role.Admin, Role.Supervisor, Role.Employee) 
  @ApiOperation({ summary: 'Obtiene un usuario por su ID (requiere rol de personal)' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SuperAdmin, Role.Admin) 
  @ApiOperation({ summary: 'Actualiza un usuario por su ID (requiere rol SuperAdmin o Admin)' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.SuperAdmin) 
  @ApiOperation({ summary: 'Elimina un usuario por su ID (requiere rol SuperAdmin)' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}



// // src/users/users.controller.ts
// import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// @ApiTags('Usuarios') 
// @Controller('users')
// @UseGuards(JwtAuthGuard) 
// @ApiBearerAuth('JWT-auth') 
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post()
//   @ApiOperation({ summary: 'Crea un nuevo usuario' })
//   @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
//   @ApiResponse({ status: 400, description: 'Datos inválidos.' })
//   create(@Body() createUserDto: CreateUserDto) {
//     return this.usersService.create(createUserDto);
//   }

//   @Get()
//   @ApiOperation({ summary: 'Obtiene todos los usuarios con paginación' })
//   @ApiResponse({ status: 200, description: 'Lista de usuarios.' })
//   @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
//   @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página', example: 50 })
//   findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
//     return this.usersService.findAll(page, limit);
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Obtiene un usuario por su ID' })
//   @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
//   @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
//   findOne(@Param('id') id: string) {
//     return this.usersService.findOne(+id);
//   }

//   @Patch(':id')
//   @ApiOperation({ summary: 'Actualiza un usuario por su ID' })
//   @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.' })
//   @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
//   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
//     return this.usersService.update(+id, updateUserDto);
//   }

//   @Delete(':id')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @ApiOperation({ summary: 'Elimina un usuario por su ID' })
//   @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente.' })
//   @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(+id);
//   }
// }