import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum QuoteStatus {
    NEW = 'new',
    CONTACTED = 'contacted',
    CONVERTED = 'converted', // Se volvió reserva
    DISCARDED = 'discarded'
}

@Entity('quote_requests')
export class QuoteRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    clientName: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    serviceInterested: string; // Ej: Boda, Preboda, Plan Premium

    @Column({ nullable: true })
    message: string;

    // Metadatos de seguimiento
    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    sourceUrl: string; // Desde qué página de la web vino

    @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.NEW })
    status: QuoteStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
