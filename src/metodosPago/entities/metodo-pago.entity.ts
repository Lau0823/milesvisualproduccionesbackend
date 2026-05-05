// src/metodos-pago/entities/metodo-pago.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { VentaPago } from '../../ventas/entities/venta-pago.entity'; 

@Entity('metodos_pago')
export class MetodoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => VentaPago, ventaPago => ventaPago.metodoPago)
  ventaPagos: VentaPago[];
}