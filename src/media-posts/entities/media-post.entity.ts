import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

    @Column()
    category: string;

    @Column()
    cloudinaryUrl: string;

    @Column()
    cloudinaryPublicId: string;

    @Column({ type: 'enum', enum: PostStatus, default: PostStatus.PUBLISHED })
    status: PostStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
