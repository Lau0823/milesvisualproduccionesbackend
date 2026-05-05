import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { MetodoPago } from 'src/metodosPago/entities/metodo-pago.entity';

@Entity('venta_pagos')
export class VentaPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @ManyToOne(() => Venta, venta => venta.ventaPagos, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ManyToOne(() => MetodoPago, metodoPago => metodoPago.ventaPagos)
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago: MetodoPago;
}