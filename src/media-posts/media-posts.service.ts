import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaPost } from './entities/media-post.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class MediaPostsService {
  constructor(
    @InjectRepository(MediaPost)
    private readonly mediaPostRepository: Repository<MediaPost>,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(createMediaPostDto: any, file?: Express.Multer.File) {
    let cloudinaryUrl = createMediaPostDto.cloudinaryUrl || '';
    let cloudinaryPublicId = createMediaPostDto.cloudinaryPublicId || '';

    if (file) {
      // Si el archivo es video o imagen lo subimos
      const isVideo = file.mimetype.includes('video');
      const uploadResult = isVideo 
        ? await this.cloudinaryService.uploadVideo(file)
        : await this.cloudinaryService.uploadImage(file);
        
      cloudinaryUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
    }

    const post = this.mediaPostRepository.create({
      ...createMediaPostDto,
      cloudinaryUrl,
      cloudinaryPublicId
    });

    return await this.mediaPostRepository.save(post);
  }

  async findAll() {
    return await this.mediaPostRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const post = await this.mediaPostRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException(`MediaPost with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, updateMediaPostDto: any, file?: Express.Multer.File) {
    const post = await this.findOne(id);

    if (file) {
      const isVideo = file.mimetype.includes('video');
      const uploadResult = isVideo 
        ? await this.cloudinaryService.uploadVideo(file)
        : await this.cloudinaryService.uploadImage(file);
        
      updateMediaPostDto.cloudinaryUrl = uploadResult.secure_url;
      updateMediaPostDto.cloudinaryPublicId = uploadResult.public_id;
    }

    this.mediaPostRepository.merge(post, updateMediaPostDto);
    return await this.mediaPostRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    return await this.mediaPostRepository.remove(post);
  }
}
