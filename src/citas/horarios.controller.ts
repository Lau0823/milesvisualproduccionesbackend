import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { CreateExcepcionDto } from './dto/create-excepcion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('horarios')
@Controller('horarios')
export class HorariosController {
    constructor(private readonly horariosService: HorariosService) { }

    @Post()
    createHorario(@Body() createHorarioDto: CreateHorarioDto) {
        return this.horariosService.createHorario(createHorarioDto);
    }

    @Post('excepciones')
    createExcepcion(@Body() createExcepcionDto: CreateExcepcionDto) {
        return this.horariosService.createExcepcion(createExcepcionDto);
    }

    @Get('empleado/:id')
    findAll(@Param('id') id: string) {
        return this.horariosService.findAllHorarios(+id);
    }

    @Get('excepciones/empleado/:id')
    findAllExcepciones(@Param('id') id: string) {
        return this.horariosService.findAllExcepciones(+id);
    }
}
