import { IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTecnicoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  radioCoberturaKm?: number;
}

export class UpdateUbicacionDto {
  @ApiProperty({ example: 4.598 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @ApiProperty({ example: -74.082 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;
}

export class UpdateDisponibilidadDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  disponibilidad: boolean;
}