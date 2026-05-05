// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Venta } from '../../ventas/entities/venta.entity';
import { Cliente } from '../../clientes/entities/cliente.entity'; 

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 500, nullable: true })
  foto_perfil_url: string;

  @Column({ length: 50, default: 'employee' }) 
  rol: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToOne(() => Cliente, cliente => cliente.user, { nullable: true }) 
  @JoinColumn({ name: 'cliente_id' }) 
  cliente: Cliente;

  @Column({ type: 'int', nullable: true }) 
  cliente_id: number | null; 

  @OneToMany(() => Venta, venta => venta.usuario)
  ventas: Venta[];
}