// src/adicionales/entities/adicional.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { VentaServicioAdicional } from '../../ventas/entities/venta-servicio-adicional.entity'; 

@Entity('adicionales')
export class Adicional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => VentaServicioAdicional, vsa => vsa.adicional)
  ventaServicioAdicionales: VentaServicioAdicional[];
}