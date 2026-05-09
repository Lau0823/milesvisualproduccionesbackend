import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

@Entity('media_posts')
export class MediaPost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Index()
    @Column()
    category: string;

    @Column()
    cloudinaryUrl: string;

    @Column()
    cloudinaryPublicId: string;

    @Index()
    @Column({ type: 'enum', enum: PostStatus, default: PostStatus.PUBLISHED })
    status: PostStatus;

    @Index()
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
