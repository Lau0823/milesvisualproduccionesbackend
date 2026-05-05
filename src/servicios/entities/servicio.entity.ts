// src/servicios/entities/servicio.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { VentaServicio } from '../../ventas/entities/venta-servicio.entity';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 255, unique: true, nullable: true })
  slug: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_base: number;

  @Column({ type: 'int', default: 60 })
  duracion: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  video_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoria: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ default: false })
  destacado: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => VentaServicio, ventaServicio => ventaServicio.servicio)
  ventasServicios: VentaServicio[];
}