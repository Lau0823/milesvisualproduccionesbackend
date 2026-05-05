// src/ventas/ventas.controller.ts
import { Controller, Post, Body, Get, Param, ParseIntPipe, Query, UseGuards, Req, Res, HttpCode, HttpStatus, UploadedFile, UseInterceptors, BadRequestException, ForbiddenException } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { Request, type Response } from 'express';
import * as xlsx from 'xlsx';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator'; 
import { Role } from '../common/enums/role.enum'; 

interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string; 
    rol: string;
    cliente_id?: number; 
  };
}

@ApiTags('Ventas')
@Controller('ventas')
@ApiBearerAuth('JWT-auth') 
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}



  @Post()
  @UseGuards(JwtAuthGuard) 
  @Roles(Role.Employee, Role.Supervisor, Role.Admin, Role.SuperAdmin) 
  @ApiOperation({ summary: 'Registrar una nueva venta (requiere rol de personal)' })
  @ApiResponse({ status: 201, description: 'Venta registrada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de la venta inválidos.' })
  async create(@Body() createVentaDto: CreateVentaDto, @Req() req: RequestWithUser) {
    const userId = req.user.id;
    const nuevaVenta = await this.ventasService.create(createVentaDto, userId);
    return { message: 'Venta registrada con éxito', data: nuevaVenta };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) 
  @Roles(Role.Employee, Role.Supervisor, Role.Admin, Role.SuperAdmin, Role.AuthenticatedClient)
  @ApiOperation({ summary: 'Obtener los detalles de una venta específica (cliente solo puede ver las suyas)' })
  @ApiResponse({ status: 200, description: 'Detalles de la venta obtenidos.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const venta = await this.ventasService.findOne(id);
    if (req.user.rol === Role.AuthenticatedClient && venta.cliente.id !== req.user.cliente_id) {
        throw new ForbiddenException('No tienes permiso para ver esta venta.');
    }
    return venta;
  }

  @Get()
  @UseGuards(JwtAuthGuard) 
  @Roles(Role.Employee, Role.Supervisor, Role.Admin, Role.SuperAdmin) 
  @ApiOperation({ summary: 'Obtiene todas las ventas con paginación (requiere rol de personal)' })
  @ApiResponse({ status: 200, description: 'Lista de ventas.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página', example: 50 })
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
    return this.ventasService.findAll(page, limit);
  }

  @Get('reportes/medios-pago')
  @UseGuards(JwtAuthGuard) 
  @Roles(Role.Supervisor, Role.Admin, Role.SuperAdmin) 
  @ApiOperation({ summary: 'Generar reporte de ingresos por método de pago para un rango de fechas (requiere rol Supervisor/Admin)' })
  @ApiResponse({ status: 200, description: 'Reporte generado con éxito.' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  async getReporteMediosPago(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.ventasService.getIngresosPorMedioDePago(fechaInicio, fechaFin);
  }

  @Get('reportes/servicios')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Supervisor, Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Genera un reporte de los servicios más vendidos y sus ingresos.' })
  @ApiResponse({ status: 200, description: 'Reporte de servicios generado con éxito.' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  async getReporteServicios(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.ventasService.getReporteServicios(fechaInicio, fechaFin);
  }

   @Get('reportes/ingresos-periodo')
    @UseGuards(JwtAuthGuard)
    @Roles(Role.Supervisor, Role.Admin, Role.SuperAdmin)
    @ApiOperation({ summary: 'Genera un reporte de ingresos agrupados por periodo de tiempo (día, mes, año).' })
    @ApiResponse({ status: 200, description: 'Reporte generado con éxito.' })
    @ApiQuery({ name: 'periodo', required: true, type: String, description: 'Tipo de agrupación ("day", "month", "year")', example: 'month' })
    @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiQuery({ name: 'metodoPagoId', required: false, type: Number, description: 'ID del método de pago para filtrar. Opcional.', example: 1 })
    async getReporteIngresosPorPeriodo(
      @Query('periodo') periodo: 'day' | 'month' | 'year',
      @Query('fechaInicio') fechaInicio: string,
      @Query('fechaFin') fechaFin: string,
      @Query('metodoPagoId') metodoPagoId?: string,
    ) {
      const parsedMetodoPagoId = metodoPagoId ? parseInt(metodoPagoId, 10) : undefined;
        return this.ventasService.getIngresosAgregadosPorPeriodo(
        periodo,
        fechaInicio,
        fechaFin,
        parsedMetodoPagoId,
      );
    }


      @Get('reportes/detalle')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Supervisor, Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Obtiene un reporte detallado de ventas por transacción para un rango de fechas.' })
  @ApiResponse({ status: 200, description: 'Reporte detallado de ventas generado con éxito.' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  async getReporteVentasDetalle(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.ventasService.getVentasDetalladas(fechaInicio, fechaFin);
  }


  @Post('import/excel')
  @UseGuards(JwtAuthGuard) 
  @Roles(Role.Admin, Role.SuperAdmin) 
  @ApiOperation({ summary: 'Importa ventas de forma masiva desde un archivo Excel (requiere rol Admin/SuperAdmin)' })
  @ApiResponse({ status: 200, description: 'Proceso de importación iniciado.' })
  @ApiResponse({ status: 400, description: 'Archivo inválido o error en la importación.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo.');
    }
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const result = await this.ventasService.importVentasFromExcel(data);
    return { message: 'Archivo procesado. Verifique los resultados.', result };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard) 
  @Roles(Role.Supervisor, Role.Admin, Role.SuperAdmin) 
  @ApiOperation({ summary: 'Exporta ventas a un archivo Excel (requiere rol Supervisor/Admin)' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado y descargado.' })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  async exportExcel(
    @Res({ passthrough: true }) res: Response,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const data = await this.ventasService.exportVentasToExcel(fechaInicio, fechaFin);

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Ventas');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ventas_reporte_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    });
    return buffer;
  }
}