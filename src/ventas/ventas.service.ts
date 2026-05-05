// src/ventas/ventas.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { VentaServicio } from './entities/venta-servicio.entity';
import { VentaServicioAdicional } from './entities/venta-servicio-adicional.entity';
import { VentaPago } from './entities/venta-pago.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { Adicional } from '../adicionales/entities/adicional.entity';
import { MetodoPago } from 'src/metodosPago/entities/metodo-pago.entity';
import { User } from '../users/entities/user.entity';
import * as xlsx from 'xlsx';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    @InjectRepository(VentaServicio)
    private ventasServiciosRepository: Repository<VentaServicio>,
    @InjectRepository(VentaServicioAdicional)
    private ventaServicioAdicionalesRepository: Repository<VentaServicioAdicional>,
    @InjectRepository(VentaPago)
    private ventaPagosRepository: Repository<VentaPago>,
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    @InjectRepository(Servicio)
    private serviciosRepository: Repository<Servicio>,
    @InjectRepository(Adicional)
    private adicionalesRepository: Repository<Adicional>,
    @InjectRepository(MetodoPago)
    private metodosPagoRepository: Repository<MetodoPago>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource, 
  ) {}

  /**
   * Registra una nueva venta, incluyendo sus servicios, adicionales y métodos de pago.
   * La operación se realiza dentro de una transacción para garantizar que todos los
   * datos se guarden correctamente o que ninguno se guarde en caso de error.
   * @param createVentaDto Datos de la venta a crear.
   * @param userId ID del usuario que registra la venta (obtenido del token JWT).
   * @returns La venta creada con todas sus relaciones cargadas.
   */
  async create(createVentaDto: CreateVentaDto, userId: number): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cliente = await queryRunner.manager.findOne(Cliente, { where: { id: createVentaDto.clienteId } });
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${createVentaDto.clienteId} no encontrado.`);
      }
      const usuario = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
      }
      const nuevaVenta = queryRunner.manager.create(Venta, {
        fecha: new Date(createVentaDto.fecha),
        valor_total: createVentaDto.total,
        cliente: cliente, 
        usuario: usuario, 
      });
      const savedVenta = await queryRunner.manager.save(nuevaVenta);
      for (const formService of createVentaDto.servicios) {
        const servicioDb = await queryRunner.manager.findOne(Servicio, { where: { id: formService.servicioId } });
        if (!servicioDb) {
          throw new BadRequestException(`Servicio con ID ${formService.servicioId} no encontrado.`);
        }
        let calculatedSubtotal = servicioDb.precio_base;
        const adicionalesDb = await queryRunner.manager.findByIds(Adicional, formService.adicionales);
        for (const adicionalId of formService.adicionales) {
          const adicional = adicionalesDb.find(ad => ad.id === adicionalId);
          if (!adicional) { 
            throw new BadRequestException(`Adicional con ID ${adicionalId} no encontrado para el servicio ${servicioDb.nombre}.`);
          }
          calculatedSubtotal += adicional.precio;
        }
        if (Math.abs(calculatedSubtotal - formService.subtotal) > 0.01) { 
          throw new BadRequestException(`El subtotal del servicio "${servicioDb.nombre}" no coincide con el cálculo del backend. Esperado: ${calculatedSubtotal}, Recibido: ${formService.subtotal}.`);
        }
        const nuevaVentaServicio = queryRunner.manager.create(VentaServicio, {
          venta: savedVenta,
          servicio: servicioDb,
          precio_aplicado: formService.subtotal, 
        });
        const savedVentaServicio = await queryRunner.manager.save(nuevaVentaServicio);

        for (const adicionalId of formService.adicionales) {
          const adicionalDb = adicionalesDb.find(ad => ad.id === adicionalId);
          if (!adicionalDb) { 
            throw new BadRequestException(`Adicional con ID ${adicionalId} no encontrado durante el guardado de adicionales.`);
          }
          const nuevaVentaServicioAdicional = queryRunner.manager.create(VentaServicioAdicional, {
            ventaServicio: savedVentaServicio,
            adicional: adicionalDb,
            precio_aplicado: adicionalDb.precio, 
          });
          await queryRunner.manager.save(nuevaVentaServicioAdicional);
        }
      }
      if (!createVentaDto.metodosPago || createVentaDto.metodosPago.length === 0) {
        throw new BadRequestException('Debe especificar al menos un método de pago para la venta.');
      }
      const totalPagadoFrontend = createVentaDto.metodosPago.reduce((acc, p) => acc + p.monto, 0);
      if (Math.abs(totalPagadoFrontend - createVentaDto.total) > 0.01) {
          throw new BadRequestException('El total pagado por los métodos de pago no coincide con el total de la venta.');
      }

      for (const pago of createVentaDto.metodosPago) {
        const metodoPagoDb = await queryRunner.manager.findOne(MetodoPago, { where: { id: pago.metodoId } });
        if (!metodoPagoDb) {
          throw new BadRequestException(`Método de pago con ID ${pago.metodoId} no encontrado.`);
        }
        const nuevaVentaPago = queryRunner.manager.create(VentaPago, {
          venta: savedVenta,
          metodoPago: metodoPagoDb,
          monto: pago.monto,
        });
        await queryRunner.manager.save(nuevaVentaPago);
      }
      await queryRunner.commitTransaction(); 
      const fetchedVenta = await this.ventasRepository.findOne({
        where: { id: savedVenta.id },
        relations: [
          'cliente',
          'usuario',
          'ventaPagos',
          'ventaPagos.metodoPago',
          'ventasServicios',
          'ventasServicios.servicio',
          'ventasServicios.ventaServicioAdicionales',
          'ventasServicios.ventaServicioAdicionales.adicional',
        ],
      });

      if (!fetchedVenta) {
        throw new NotFoundException(`Venta con ID ${savedVenta.id} no encontrada después del guardado. Error interno.`);
      }
      return fetchedVenta; 
    } catch (err) {
      await queryRunner.rollbackTransaction(); 
      throw err; 
    } finally {
      await queryRunner.release(); 
    }
  }

  /**
   * Obtiene una venta por su ID con todos sus detalles (servicios, adicionales, pagos).
   * @param id ID de la venta.
   * @returns La venta encontrada.
   */
  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventasRepository.findOne({
      where: { id },
      relations: [
        'cliente',
        'usuario',
        'ventaPagos',
        'ventaPagos.metodoPago',
        'ventasServicios',
        'ventasServicios.servicio',
        'ventasServicios.ventaServicioAdicionales',
        'ventasServicios.ventaServicioAdicionales.adicional',
      ],
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada.`);
    }
    return venta;
  }

  /**
   * Obtiene todas las ventas con paginación.
   * @param page Número de página.
   * @param limit Cantidad de elementos por página.
   * @returns Objeto con la lista de ventas, total, página actual y última página.
   */
  async findAll(page: number = 1, limit: number = 50): Promise<{ data: Venta[], total: number, page: number, lastPage: number }> {
    const skip = (page - 1) * limit;
    const [result, total] = await this.ventasRepository.findAndCount({
      skip: skip,
      take: limit,
      relations: ['cliente', 'usuario', 'ventaPagos.metodoPago'],
      order: { fecha: 'DESC', created_at: 'DESC' } 
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: result,
      total,
      page,
      lastPage
    };
  }

  /**
   * Genera un reporte de ingresos agrupados por método de pago para un rango de fechas.
   * @param fechaInicio Fecha de inicio (YYYY-MM-DD).
   * @param fechaFin Fecha de fin (YYYY-MM-DD).
   * @returns Un array de objetos con el nombre del método de pago y el total de ingresos.
   */
  async getIngresosPorMedioDePago(fechaInicio: string, fechaFin: string): Promise<any[]> {
    const query = this.ventaPagosRepository
      .createQueryBuilder('vp')
      .select('metodo_pago.nombre', 'metodo_pago')
      .addSelect('SUM(vp.monto)', 'total_ingresos')
      .innerJoin('vp.venta', 'venta')
      .innerJoin('vp.metodoPago', 'metodo_pago')
      .where('venta.fecha >= :fechaInicio', { fechaInicio: new Date(fechaInicio) })
      .andWhere('venta.fecha <= :fechaFin', { fechaFin: new Date(fechaFin + 'T23:59:59.999') }) 
      .groupBy('metodo_pago.nombre')
      .orderBy('total_ingresos', 'DESC');

    return query.getRawMany();
  }

  /**
   * Importa datos de ventas masivamente desde un array de objetos.
   * Este método es una simulación. En una implementación real,
   * recibirías un archivo Excel, lo parsearías y luego procesarías
   * los datos con lógica de validación y creación/actualización de entidades.
   * @param data Array de objetos con la estructura de venta.
   * @returns Un resumen del proceso de importación.
   */
  async importVentasFromExcel(data: any[]): Promise<{ message: string, imported: number, errors: { row: any; error: string }[] }> { 
    let importedCount = 0;
    const errors: { row: any; error: string }[] = []; 

    console.warn('Implementación de importación masiva simplificada. NO apta para producción directa.');

    for (const row of data) {
      try {
        const client = await this.clientesRepository.findOne({ where: { documento: row.clienteDocumento } });
        if (!client) {
            errors.push({ row, error: 'Cliente no encontrado por documento.' });
            continue;
        }

        const metodosPago = await Promise.all(row.metodosPago.map(async (mp: any) => {
            const metodo = await this.metodosPagoRepository.findOne({ where: { nombre: mp.nombre } });
            if (!metodo) throw new Error(`Método de pago '${mp.nombre}' no encontrado.`);
            return { metodoId: metodo.id, monto: mp.monto };
        }));

        const servicios = await Promise.all(row.servicios.map(async (s: any) => {
            const servicio = await this.serviciosRepository.findOne({ where: { nombre: s.nombreServicio } });
            if (!servicio) throw new Error(`Servicio '${s.nombreServicio}' no encontrado.`);
            const adicionales = await Promise.all(s.adicionales.map(async (adName: string) => {
                const adicional = await this.adicionalesRepository.findOne({ where: { nombre: adName } });
                if (!adicional) throw new Error(`Adicional '${adName}' no encontrado.`);
                return adicional.id;
            }));
            return { servicioId: servicio.id, adicionales, subtotal: s.subtotal };
        }));
        const createDto: CreateVentaDto = {
          fecha: row.fecha,
          clienteId: client.id,
          metodosPago: metodosPago,
          servicios: servicios,
          total: row.total,
        };
        importedCount++;
      } catch (e: any) { 
        errors.push({ row, error: e.message || 'Error desconocido' });
      }
    }
    return { message: `Proceso de importación finalizado.`, imported: importedCount, errors: errors };
  }

  /**
   * Exporta datos de ventas a un formato de array para generar Excel.
   * Filtra por rango de fechas si se proporciona.
   * @param fechaInicio Fecha de inicio (opcional, YYYY-MM-DD).
   * @param fechaFin Fecha de fin (opcional, YYYY-MM-DD).
   * @returns Un array de objetos listos para ser convertidos a Excel.
   */
  async exportVentasToExcel(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
    let query = this.ventasRepository.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.usuario', 'usuario')
      .leftJoinAndSelect('venta.ventaPagos', 'ventaPagos')
      .leftJoinAndSelect('ventaPagos.metodoPago', 'metodoPago')
      .leftJoinAndSelect('venta.ventasServicios', 'ventasServicios')
      .leftJoinAndSelect('ventasServicios.servicio', 'servicio')
      .leftJoinAndSelect('ventasServicios.ventaServicioAdicionales', 'ventaServicioAdicionales')
      .leftJoinAndSelect('ventaServicioAdicionales.adicional', 'adicional')
      .orderBy('venta.fecha', 'DESC')
      .addOrderBy('venta.created_at', 'DESC');

    if (fechaInicio) {
      query = query.andWhere('venta.fecha >= :fechaInicio', { fechaInicio: new Date(fechaInicio) });
    }
    if (fechaFin) {
      query = query.andWhere('venta.fecha <= :fechaFin', { fechaFin: new Date(fechaFin + 'T23:59:59.999') });
    }

    const ventas = await query.getMany();

    const dataForExcel = ventas.map(venta => {
      const serviciosDetalle = venta.ventasServicios.map(vs => {
        const adicionalesDetalle = vs.ventaServicioAdicionales.map(vsa => `${vsa.adicional.nombre} ($${vsa.precio_aplicado})`).join(', ');
        return `${vs.servicio.nombre} ($${vs.precio_aplicado}) [${adicionalesDetalle || 'Ninguno'}]`;
      }).join('; ');

      const pagosDetalle = venta.ventaPagos.map(vp => `${vp.metodoPago.nombre}: $${vp.monto}`).join(', ');

      return {
        'ID Venta': venta.id,
        'Fecha': venta.fecha.toLocaleString('es-CO'),
        'Cliente Nombre': venta.cliente ? venta.cliente.nombre : 'N/A',
        'Cliente Documento': venta.cliente ? venta.cliente.documento : 'N/A',
        'Cliente Telefono': venta.cliente ? venta.cliente.telefono : 'N/A', 
        'Cliente Correo': venta.cliente ? venta.cliente.correo : 'N/A', 
        'Registrado Por': venta.usuario ? venta.usuario.nombre : 'N/A',
        'Servicios (Precio Aplicado) [Adicionales]': serviciosDetalle,
        'Métodos de Pago (Monto)': pagosDetalle,
        'Valor Total': venta.valor_total,
      };
    });

    return dataForExcel;
  }
  



  async getVentasDetalladas(fechaInicio: string, fechaFin: string): Promise<any[]> {
    const ventas = await this.ventasRepository.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.ventaPagos', 'ventaPagos')
      .leftJoinAndSelect('ventaPagos.metodoPago', 'metodoPago')
      .leftJoinAndSelect('venta.ventasServicios', 'ventasServicios')
      .leftJoinAndSelect('ventasServicios.servicio', 'servicio')
      .where('venta.fecha >= :fechaInicio', { fechaInicio: new Date(fechaInicio) })
      .andWhere('venta.fecha <= :fechaFin', { fechaFin: new Date(fechaFin + 'T23:59:59.999') })
      .orderBy('venta.fecha', 'DESC')
      .getMany();
    return ventas.map(venta => {
      const serviciosDetalle = venta.ventasServicios.map(vs => vs.servicio.nombre).join(', ');
      const metodosPagoDetalle = venta.ventaPagos.map(vp => vp.metodoPago.nombre).join(', ');
      return {
        id: venta.id,
        fecha_venta: venta.fecha.toISOString().split('T')[0],
        cliente_nombre: venta.cliente ? venta.cliente.nombre : 'Cliente Eliminado',
        total_venta: venta.valor_total.toString(),
        metodo_pago: metodosPagoDetalle,
        servicios_detalle: serviciosDetalle,
      };
    });
  }


  /**
   * Genera un reporte de ingresos agregados por periodo (día, mes, año),
   * con filtro opcional por método de pago.
   * @param periodo Tipo de agrupación ('day', 'month', 'year').
   * @param fechaInicio Fecha de inicio (YYYY-MM-DD).
   * @param fechaFin Fecha de fin (YYYY-MM-DD).
   * @param metodoPagoId ID opcional del método de pago para filtrar.
   * @returns Un array de objetos con la fecha y el total de ingresos para cada periodo.
   */
  async getIngresosAgregadosPorPeriodo(
    periodo: 'day' | 'month' | 'year',
    fechaInicio: string,
    fechaFin: string,
    metodoPagoId?: number,
  ): Promise<any[]> {
    let formatString: string;
    const dbType = this.dataSource.options.type;

    switch (dbType) {
      case 'mysql':
      case 'mariadb':
        formatString = { day: '%Y-%m-%d', month: '%Y-%m', year: '%Y' }[periodo];
        break;
      case 'postgres':
        formatString = { day: 'YYYY-MM-DD', month: 'YYYY-MM', year: 'YYYY' }[periodo];
        break;
      case 'sqlite':
        formatString = { day: '%Y-%m-%d', month: '%Y-%m', year: '%Y' }[periodo];
        break;
      default:
        throw new BadRequestException(`Base de datos no soportada: ${dbType}.`);
    }

    const dateFunction = () => {
      switch (dbType) {
        case 'postgres':
          return `TO_CHAR(venta.fecha, '${formatString}')`;
        case 'sqlite':
          return `strftime('${formatString}', venta.fecha)`;
        case 'mysql':
        case 'mariadb':
        default:
          return `DATE_FORMAT(venta.fecha, '${formatString}')`;
      }
    };

    const query = this.ventaPagosRepository
      .createQueryBuilder('vp')
      .select(`${dateFunction()}`, 'fecha_agrupada')
      .addSelect('SUM(vp.monto)', 'total_ingresos')
      .innerJoin('vp.venta', 'venta')
      .where('venta.fecha >= :fechaInicio', { fechaInicio: new Date(fechaInicio) })
      .andWhere('venta.fecha <= :fechaFin', { fechaFin: new Date(fechaFin + 'T23:59:59.999') })
      .groupBy('fecha_agrupada')
      .orderBy('fecha_agrupada', 'ASC');

    if (metodoPagoId) {
        query.andWhere('vp.metodo_pago_id = :metodoPagoId', { metodoPagoId });
    }

    return query.getRawMany();
  }


  /**
   * Genera un reporte de servicios más vendidos y sus ingresos totales en un rango de fechas.
   * @param fechaInicio Fecha de inicio (YYYY-MM-DD).
   * @param fechaFin Fecha de fin (YYYY-MM-DD).
   * @returns Un array de objetos con el nombre del servicio, la cantidad de ventas y los ingresos totales.
   */
  async getReporteServicios(fechaInicio: string, fechaFin: string): Promise<any[]> {
    const query = this.ventasServiciosRepository
      .createQueryBuilder('vs')
      .select('servicio.nombre', 'servicio_nombre')
      .addSelect('COUNT(vs.servicio_id)', 'ventas_totales')
      .addSelect('SUM(vs.precio_aplicado)', 'ingresos_totales')
      .innerJoin('vs.venta', 'venta')
      .innerJoin('vs.servicio', 'servicio')
      .where('venta.fecha >= :fechaInicio', { fechaInicio: new Date(fechaInicio) })
      .andWhere('venta.fecha <= :fechaFin', { fechaFin: new Date(fechaFin + 'T23:59:59.999') })
      .groupBy('servicio.nombre')
      .orderBy('ventas_totales', 'DESC');

    return query.getRawMany();
  } 
}