// src/ventas/entities/venta.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { User } from '../../users/entities/user.entity';
import { VentaServicio } from './venta-servicio.entity';
import { VentaPago } from './venta-pago.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor_total: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Cliente, cliente => cliente.ventas)
  @JoinColumn({ name: 'cliente_id' }) 
  cliente: Cliente;

  @ManyToOne(() => User, user => user.ventas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @OneToMany(() => VentaServicio, ventaServicio => ventaServicio.venta, { cascade: true }) 
  ventasServicios: VentaServicio[];

  @OneToMany(() => VentaPago, ventaPago => ventaPago.venta, { cascade: true }) 
  ventaPagos: VentaPago[];
}