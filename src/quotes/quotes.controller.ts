import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Public()
  @Post()
  create(@Body() createQuoteDto: any, @Req() req: Request) {
    // Capturar la IP y el UserAgent automáticamente si no vienen en el DTO
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.quotesService.create({
      ...createQuoteDto,
      ipAddress: ipAddress ? ipAddress.toString() : null,
      userAgent: userAgent ? userAgent.toString() : null,
    });
  }

  @Public()
  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: any) {
    return this.quotesService.update(+id, updateQuoteDto);
  }

  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }
}
