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
    // Forzar conversión de booleanos en la creación
    if (createServicioDto.activo !== undefined) {
      createServicioDto.activo = String(createServicioDto.activo) === 'true';
    }
    if (createServicioDto.destacado !== undefined) {
      createServicioDto.destacado = String(createServicioDto.destacado) === 'true';
    }

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
        categoria: { type: 'string' },
        subtitulo: { type: 'string' },
        activo: { type: 'boolean' },
        destacado: { type: 'boolean' },
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
    console.log('--- INICIO UPDATE SERVICIO ---');
    console.log('ID recibido:', id);
    console.log('Body recibido (Raw):', updateServicioDto);
    console.log('Archivos recibidos:', files ? Object.keys(files) : 'Ninguno');

    if (files?.file?.[0]) {
      console.log('Subiendo nueva imagen...');
      const result = await this.cloudinaryService.uploadImage(files.file[0]);
      updateServicioDto.imagen_url = result.secure_url;
      console.log('Nueva imagen URL:', result.secure_url);
    }
    if (files?.video?.[0]) {
      console.log('Subiendo nuevo video...');
      const result = await this.cloudinaryService.uploadVideo(files.video[0]);
      updateServicioDto.video_url = result.secure_url;
      console.log('Nuevo video URL:', result.secure_url);
    }

    // Conversión ultra-estricta para evitar el bug de Boolean("false") === true
    if (updateServicioDto.activo !== undefined) {
      console.log('Validando ACTIVO. Recibido:', updateServicioDto.activo);
      updateServicioDto.activo = (updateServicioDto.activo === 'true' || updateServicioDto.activo === true);
      console.log('Resultado ACTIVO:', updateServicioDto.activo);
    }
    if (updateServicioDto.destacado !== undefined) {
      console.log('Validando DESTACADO. Recibido:', updateServicioDto.destacado);
      updateServicioDto.destacado = (updateServicioDto.destacado === 'true' || updateServicioDto.destacado === true);
      console.log('Resultado DESTACADO:', updateServicioDto.destacado);
    }

    console.log('Objeto final a guardar:', updateServicioDto);
    console.log('--- FIN UPDATE SERVICIO ---');

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