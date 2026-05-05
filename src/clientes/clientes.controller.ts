// src/clientes/clientes.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards, Req } from '@nestjs/common'; // Importa Req
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ForbiddenException } from '@nestjs/common'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
    rol: string;
    cliente_id?: number;
  };
}

@ApiTags('Clientes')
@Controller('clientes')
@ApiBearerAuth('JWT-auth')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra un nuevo cliente y crea una cuenta de usuario asociada' })
  @ApiResponse({ status: 201, description: 'Cliente y usuario registrados exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o documento/usuario/correo ya existen.' })
  async registerClient(@Body() registerClientDto: RegisterClientDto) {
    return this.clientesService.registerClient(registerClientDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Supervisor, Role.Employee) 
  @ApiOperation({ summary: 'Crea un nuevo cliente (registro manual por personal, sin cuenta de usuario)' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Supervisor, Role.Employee) 
  @ApiOperation({ summary: 'Obtiene todos los clientes con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de clientes.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página', example: 50 })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50, @Query('search') search?: string,) {
    return this.clientesService.findAll(page, limit, search);
  }

  @Get('reportes/nuevos-clientes')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Supervisor, Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Obtiene el conteo de clientes nuevos en un rango de fechas.' })
  @ApiResponse({ status: 200, description: 'Conteo de clientes nuevos obtenido.' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  async getNewClientsCount(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.clientesService.countNewClients(fechaInicio, fechaFin);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Supervisor, Role.Employee, Role.AuthenticatedClient) // Todos los roles de personal y el cliente autenticado
  @ApiOperation({ summary: 'Obtiene un cliente por su ID (cliente autenticado solo puede ver su perfil)' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (req.user.rol === Role.AuthenticatedClient && req.user.cliente_id !== +id) {
      throw new ForbiddenException('No tienes permiso para ver este perfil de cliente.');
    }
    return this.clientesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Supervisor) 
  @ApiOperation({ summary: 'Actualiza un cliente por su ID' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin, Role.SuperAdmin) 
  @ApiOperation({ summary: 'Elimina un cliente por su ID' })
  @ApiResponse({ status: 204, description: 'Cliente eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}