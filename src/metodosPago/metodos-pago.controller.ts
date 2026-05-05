// src/metodos-pago/metodos-pago.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { MetodosPagoService } from './metodos-pago.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';

import { Public } from '../auth/decorators/public.decorator'; 

@ApiTags('Métodos de Pago')
@Controller('metodos-pago')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth') 
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo método de pago' })
  @ApiResponse({ status: 201, description: 'Método de pago creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createMetodoPagoDto: CreateMetodoPagoDto) {
    return this.metodosPagoService.create(createMetodoPagoDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obtiene todos los métodos de pago con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de métodos de pago.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página', example: 50 })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
    return this.metodosPagoService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un método de pago por su ID' })
  @ApiResponse({ status: 200, description: 'Método de pago encontrado.' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.metodosPagoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un método de pago por su ID' })
  @ApiResponse({ status: 200, description: 'Método de pago actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado.' })
  update(@Param('id') id: string, @Body() updateMetodoPagoDto: UpdateMetodoPagoDto) {
    return this.metodosPagoService.update(+id, updateMetodoPagoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  @ApiOperation({ summary: 'Elimina un método de pago por su ID' })
  @ApiResponse({ status: 204, description: 'Método de pago eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado.' })
  remove(@Param('id') id: string) {
    return this.metodosPagoService.remove(+id);
  }
}