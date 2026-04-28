import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, MaxLength, IsInt, Min, Max } from 'class-validator';
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

export class CompletarSolicitudDto {
  @ApiProperty({ description: 'Detalles del servicio prestado', example: 'Se reparó el lavaplatos, se cambió el sable y se verificó el funcionamiento' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  detalles: string;

  @ApiProperty({ type: [String], description: 'URLs de imágenes del resultado (mínimo 1, máximo 2)' })
  @IsArray()
  @IsNotEmpty()
  imagenes: string[];
}

export class UpdateEstadoSolicitudDto {
  @ApiProperty({ enum: EstadoSolicitud })
  @IsEnum(EstadoSolicitud)
  estado: EstadoSolicitud;
}

export class CalificarSolicitudDto {
  @ApiProperty({ description: 'Calificación de 1 a 5 estrellas', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion: number;

  @ApiPropertyOptional({ description: 'Comentario opcional sobre el servicio' })
  @IsString()
  @IsOptional()
  comentario?: string;
}