import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ReservationStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PARTIAL = 'partial',
    PAID = 'paid',
}

@Entity('reservations')
export class Reservation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clientName: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column()
    serviceType: string;

    @Column({ type: 'date', nullable: true })
    eventDate: string;

    @Column({ type: 'jsonb', nullable: true })
    paymentSchedule: any;

    @Column()
    time: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    value: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    anticipo: number;

    @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.PENDING })
    status: ReservationStatus;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    paymentStatus: PaymentStatus;

    @Column({ nullable: true })
    googleEventId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
