import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obtiene todos los ajustes del sitio (Público)' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Obtiene un ajuste por su clave (Público)' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @ApiBearerAuth('JWT-auth')
  @Post('batch')
  @ApiOperation({ summary: 'Actualiza múltiples ajustes (Requiere Auth)' })
  upsertMany(@Body() body: { settings: { key: string; value: string; description?: string }[] }) {
    return this.settingsService.upsertMany(body.settings);
  }

  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: 'Actualiza un ajuste (Requiere Auth)' })
  upsert(@Body() body: { key: string; value: string; description?: string }) {
    return this.settingsService.upsert(body.key, body.value, body.description);
  }
}
