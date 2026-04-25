import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({ description: 'ID del usuario (se toma del token)' })
  @IsOptional()
  @IsString()
  usuarioId?: string;
}

export class CreateDireccionDto {
  @ApiProperty({ example: 'Carrera 10 # 20-30' })
  @IsString()
  @IsNotEmpty()
  direccion: string;

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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}

export class UpdateDireccionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}