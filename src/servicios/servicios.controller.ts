// src/servicios/servicios.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseGuards, UseInterceptors, UploadedFiles, Header } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@ApiTags('Servicios')
@Controller('servicios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ServiciosController {
  constructor(
    private readonly serviciosService: ServiciosService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crea un nuevo servicio' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        precio_base: { type: 'number' },
        duracion: { type: 'number' },
        descripcion: { type: 'string' },
        activo: { type: 'boolean' },
        file: { type: 'string', format: 'binary' },
        video: { type: 'string', format: 'binary' },
      },
    },
  })
  async create(
    @Body() createServicioDto: CreateServicioDto,
    @UploadedFiles() files: { file?: Express.Multer.File[], video?: Express.Multer.File[] },
  ) {
    if (files?.file?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.file[0]);
      createServicioDto.imagen_url = result.secure_url;
    }
    if (files?.video?.[0]) {
      const result = await this.cloudinaryService.uploadVideo(files.video[0]);
      createServicioDto.video_url = result.secure_url;
    }
    // La conversión de tipos ahora la maneja @Transform en el DTO.
    // Todo se maneja vía @Transform

    // Default duration to 30 minutes if not provided or invalid
    if (!createServicioDto.duracion) {
      createServicioDto.duracion = 30;
    }

    return this.serviciosService.create(createServicioDto);
  }

  @Public()
  @Get('catalogo')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600')
  @ApiOperation({ summary: 'Obtiene el catálogo de servicios activos (Público)' })
  @ApiResponse({ status: 200, description: 'Lista de servicios activos.' })
  findCatalogo() {
    return this.serviciosService.findCatalogo();
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los servicios con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de servicios.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página', example: 50 })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
    return this.serviciosService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un servicio por su ID' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualiza un servicio por su ID' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        precio_base: { type: 'number' },
        duracion: { type: 'number' },
        descripcion: { type: 'string' },
        activo: { type: 'boolean' },
        file: { type: 'string', format: 'binary' },
        video: { type: 'string', format: 'binary' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateServicioDto: UpdateServicioDto,
    @UploadedFiles() files: { file?: Express.Multer.File[], video?: Express.Multer.File[] },
  ) {
    if (files?.file?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.file[0]);
      updateServicioDto.imagen_url = result.secure_url;
    }
    if (files?.video?.[0]) {
      const result = await this.cloudinaryService.uploadVideo(files.video[0]);
      updateServicioDto.video_url = result.secure_url;
    }

    // La conversión de tipos ahora la maneja @Transform en el DTO.

    return this.serviciosService.update(+id, updateServicioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un servicio por su ID' })
  @ApiResponse({ status: 204, description: 'Servicio eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(+id);
  }
}