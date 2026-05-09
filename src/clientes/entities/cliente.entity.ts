import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne, Index } from 'typeorm';
import { Venta } from '../../ventas/entities/venta.entity';
import { User } from '../../users/entities/user.entity'; 
@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 20, unique: true })
  documento: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Index()
  @Column({ length: 255, nullable: true })
  correo: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToOne(() => User, user => user.cliente, { nullable: true }) 
  user: User;

  @OneToMany(() => Venta, venta => venta.cliente)
  ventas: Venta[];
}