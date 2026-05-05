import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaPostsService } from './media-posts.service';
import { MediaPostsController } from './media-posts.controller';
import { MediaPost } from './entities/media-post.entity';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaPost]),
    CloudinaryModule
  ],
  controllers: [MediaPostsController],
  providers: [MediaPostsService],
})
export class MediaPostsModule {}
