import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Venta } from './venta.entity';
import { Servicio } from '../../servicios/entities/servicio.entity';
import { VentaServicioAdicional } from './venta-servicio-adicional.entity';

@Entity('ventas_servicios')
export class VentaServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_aplicado: number;

  @ManyToOne(() => Venta, venta => venta.ventasServicios, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ManyToOne(() => Servicio, servicio => servicio.ventasServicios)
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @OneToMany(() => VentaServicioAdicional, vsa => vsa.ventaServicio, { cascade: true }) 
  ventaServicioAdicionales: VentaServicioAdicional[];
}