// src/adicionales/adicionales.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AdicionalesService } from './adicionales.service';
import { CreateAdicionalDto } from './dto/create-adicional.dto';
import { UpdateAdicionalDto } from './dto/update-adicional.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

@ApiTags('Adicionales')
@Controller('adicionales')
@UseGuards(JwtAuthGuard) 
@ApiBearerAuth('JWT-auth') 
export class AdicionalesController {
  constructor(private readonly adicionalesService: AdicionalesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo adicional' })
  @ApiResponse({ status: 201, description: 'Adicional creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createAdicionalDto: CreateAdicionalDto) {
    return this.adicionalesService.create(createAdicionalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los adicionales con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de adicionales.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página', example: 50 })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
    return this.adicionalesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un adicional por su ID' })
  @ApiResponse({ status: 200, description: 'Adicional encontrado.' })
  @ApiResponse({ status: 404, description: 'Adicional no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.adicionalesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un adicional por su ID' })
  @ApiResponse({ status: 200, description: 'Adicional actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Adicional no encontrado.' })
  update(@Param('id') id: string, @Body() updateAdicionalDto: UpdateAdicionalDto) {
    return this.adicionalesService.update(+id, updateAdicionalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  @ApiOperation({ summary: 'Elimina un adicional por su ID' })
  @ApiResponse({ status: 204, description: 'Adicional eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Adicional no encontrado.' })
  remove(@Param('id') id: string) {
    return this.adicionalesService.remove(+id);
  }
}