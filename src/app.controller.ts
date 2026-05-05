import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Verifica el estado de salud de la API' })
  @ApiResponse({ status: 200, description: 'La API está funcionando correctamente.' })
  checkHealth() {
    return {
      status: 'ok',
      message: 'La API de Miles Visual está funcionando correctamente.',
      timestamp: new Date().toISOString(),
    };
  }
}
