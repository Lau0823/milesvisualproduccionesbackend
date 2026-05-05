// src/ventas/dto/create-venta.dto.ts
import { IsDateString, IsInt, IsNotEmpty, IsArray, IsNumber, Min, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVentaServicioDto {
  @ApiProperty({ description: 'ID del servicio', example: 1 })
  @IsInt({ message: 'El ID del servicio debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID del servicio no puede estar vacío.' })
  servicioId: number;

  @ApiProperty({ description: 'Lista de IDs de adicionales aplicados al servicio', example: [1, 2], required: false })
  @IsArray({ message: 'Los adicionales deben ser un array.' })
  @IsInt({ each: true, message: 'Cada adicional debe ser un ID entero.' })
  @IsOptional()
  adicionales: number[];

  @ApiProperty({ description: 'Subtotal calculado para este servicio (incluye adicionales)', example: 55000 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El subtotal debe ser un número válido con hasta 2 decimales.' })
  @Min(0, { message: 'El subtotal no puede ser negativo.' })
  subtotal: number;
}

export class CreateVentaPagoDto {
  @ApiProperty({ description: 'ID del método de pago', example: 1 })
  @IsInt({ message: 'El ID del método de pago debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID del método de pago no puede estar vacío.' })
  metodoId: number;

  @ApiProperty({ description: 'Monto pagado con este método', example: 145000 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número válido con hasta 2 decimales.' })
  @Min(0, { message: 'El monto no puede ser negativo.' })
  monto: number;
}

export class CreateVentaDto {
  @ApiProperty({ description: 'Fecha y hora de la venta (formato ISO 8601)', example: '2025-08-14T10:30:00.000Z' })
  @IsDateString({}, { message: 'La fecha y hora deben tener un formato de fecha válido (ISO 8601).' })
  @IsNotEmpty({ message: 'La fecha no puede estar vacía.' })
  fecha: string;

  @ApiProperty({ description: 'ID del cliente asociado a la venta', example: 1 })
  @IsInt({ message: 'El ID del cliente debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID del cliente no puede estar vacío.' })
  clienteId: number;

  @ApiProperty({ description: 'Lista de métodos de pago y montos', type: [CreateVentaPagoDto] })
  @IsArray({ message: 'Los métodos de pago deben ser un array.' })
  @ValidateNested({ each: true }) // Valida cada elemento del array
  @Type(() => CreateVentaPagoDto) // Transforma los objetos planos a instancias de DTO
  metodosPago: CreateVentaPagoDto[];

  @ApiProperty({ description: 'Lista de servicios incluidos en la venta', type: [CreateVentaServicioDto] })
  @IsArray({ message: 'Los servicios deben ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => CreateVentaServicioDto)
  servicios: CreateVentaServicioDto[];

  @ApiProperty({ description: 'Valor total de la venta', example: 145000 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor total debe ser un número válido con hasta 2 decimales.' })
  @Min(0, { message: 'El valor total no puede ser negativo.' })
  total: number;
}