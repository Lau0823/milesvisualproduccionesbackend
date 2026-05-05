import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TipoExcepcion {
    VACACIONES = 'VACACIONES',
    EXTRA = 'EXTRA',
    DESCANSO = 'DESCANSO',
    CAMBIO_HORARIO = 'CAMBIO_HORARIO',
}

@Entity('excepciones')
export class Excepcion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    fecha: string;

    @Column({ type: 'enum', enum: TipoExcepcion })
    tipo: TipoExcepcion;

    @Column({ type: 'time', nullable: true })
    hora_inicio: string;

    @Column({ type: 'time', nullable: true })
    hora_fin: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'empleado_id' })
    empleado: User;

    @Column()
    empleado_id: number;
}
