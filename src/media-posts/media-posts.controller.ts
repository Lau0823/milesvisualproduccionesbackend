import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { MediaPostsService } from './media-posts.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Media Posts')
@Controller('media-posts')
@UseGuards(JwtAuthGuard)
export class MediaPostsController {
  constructor(private readonly mediaPostsService: MediaPostsService) {}

  @ApiBearerAuth('JWT-auth')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crea un nuevo post de media (Requiere Auth)' })
  create(@Body() createMediaPostDto: any, @UploadedFile() file: Express.Multer.File) {
    return this.mediaPostsService.create(createMediaPostDto, file);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obtiene todos los posts de media (Público)' })
  findAll() {
    return this.mediaPostsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un post por ID (Público)' })
  findOne(@Param('id') id: string) {
    return this.mediaPostsService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualiza un post de media (Requiere Auth)' })
  update(@Param('id') id: string, @Body() updateMediaPostDto: any, @UploadedFile() file: Express.Multer.File) {
    return this.mediaPostsService.update(+id, updateMediaPostDto, file);
  }

  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un post de media (Requiere Auth)' })
  remove(@Param('id') id: string) {
    return this.mediaPostsService.remove(+id);
  }
}
