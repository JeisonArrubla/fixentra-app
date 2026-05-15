import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalcularPrecioDto {
  @ApiProperty({ description: 'Slug del producto' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: 'Cantidad', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  cantidad?: number;

  @ApiPropertyOptional({ description: 'Retirar elemento existente', default: false })
  @IsBoolean()
  @IsOptional()
  retirarElemento?: boolean;
}
