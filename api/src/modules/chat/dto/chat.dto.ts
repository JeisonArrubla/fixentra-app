import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearMensajeDto {
  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsString()
  @IsNotEmpty()
  contenido: string;
}
