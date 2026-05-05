import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('horarios')
export class Horario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    dia_semana: number; // 0 (Domingo) - 6 (Sábado)

    @Column({ type: 'time' })
    hora_inicio: string;

    @Column({ type: 'time' })
    hora_fin: string;

    @Column({ type: 'boolean', default: false })
    es_descanso: boolean;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'empleado_id' })
    empleado: User;

    @Column()
    empleado_id: number;
}
