import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('citas')
@Controller('citas')
export class CitasController {
    constructor(private readonly citasService: CitasService) { }

    @Post()
    create(@Body() createCitaDto: CreateCitaDto) {
        return this.citasService.create(createCitaDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtiene todas las citas con soporte para filtros de fecha y paginación' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de elementos por página' })
    findAll(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 100,
    ) {
        return this.citasService.findAll(startDate, endDate, +page, +limit);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.citasService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto) {
        return this.citasService.update(+id, updateCitaDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.citasService.remove(+id);
    }
}
