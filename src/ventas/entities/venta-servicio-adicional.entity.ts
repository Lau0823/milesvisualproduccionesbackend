import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { VentaServicio } from './venta-servicio.entity';
import { Adicional } from '../../adicionales/entities/adicional.entity';

@Entity('venta_servicio_adicionales')
export class VentaServicioAdicional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_aplicado: number;

  @ManyToOne(() => VentaServicio, ventaServicio => ventaServicio.ventaServicioAdicionales, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'venta_servicio_id' })
  ventaServicio: VentaServicio;

  @ManyToOne(() => Adicional, adicional => adicional.ventaServicioAdicionales)
  @JoinColumn({ name: 'adicional_id' })
  adicional: Adicional;
}
