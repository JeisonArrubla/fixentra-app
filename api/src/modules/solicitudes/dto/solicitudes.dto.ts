import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitud } from '@prisma/client';

export class CreateSolicitudDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  direccionId: string;

  @ApiProperty({ example: 'Necesito reparacion de tuberia' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiPropertyOptional({ type: [String], description: 'URLs de imágenes' })
  @IsArray()
  @IsOptional()
  imagenes?: string[];
}

export class AceptarSolicitudDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tecnicoId: string;
}

export class UpdateEstadoSolicitudDto {
  @ApiProperty({ enum: EstadoSolicitud })
  @IsEnum(EstadoSolicitud)
  estado: EstadoSolicitud;
}