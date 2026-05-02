import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, MaxLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoServicio } from '@prisma/client';

export class CreateServicioDto {
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

export class AceptarServicioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tecnicoId: string;
}

export class CompletarServicioDto {
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

export class UpdateEstadoServicioDto {
  @ApiProperty({ enum: EstadoServicio })
  @IsEnum(EstadoServicio)
  estado: EstadoServicio;
}

export class CalificarServicioDto {
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
