import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Servicio } from '../../servicios/entities/servicio.entity';

export enum EstadoCita {
    PENDIENTE = 'PENDIENTE',
    CONFIRMADA = 'CONFIRMADA',
    CANCELADA = 'CANCELADA',
    COMPLETADA = 'COMPLETADA',
}

@Entity('citas')
export class Cita {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ type: 'timestamp' })
    fecha_inicio: Date;

    @Column({ type: 'timestamp' })
    fecha_fin: Date;

    @Index()
    @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.PENDIENTE })
    estado: EstadoCita;

    @Column({ type: 'text', nullable: true })
    nota: string;

    @Column({ length: 255, nullable: true })
    google_event_id: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'empleado_id' })
    empleado: User;

    @Index()
    @Column()
    empleado_id: number;

    @ManyToOne(() => Cliente, { nullable: false })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @Index()
    @Column()
    cliente_id: number;

    @ManyToOne(() => Servicio, { nullable: false })
    @JoinColumn({ name: 'servicio_id' })
    servicio: Servicio;

    @Column()
    servicio_id: number;
}
