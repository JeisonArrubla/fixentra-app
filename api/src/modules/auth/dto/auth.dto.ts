import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ enum: TipoDocumento, example: 'CC' })
  @IsString()
  @IsNotEmpty()
  tipoDocumento: TipoDocumento;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  numDocumento: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @IsNotEmpty()
  celular: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  contrasena: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  crearPerfilCliente?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  crearPerfilTecnico?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disponibilidadTecnico?: boolean;
}

export class LoginDto {
  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  contrasena: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}