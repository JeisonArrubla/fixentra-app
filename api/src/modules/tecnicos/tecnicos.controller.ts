import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TecnicosService } from './tecnicos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateTecnicoDto,
  UpdateUbicacionDto,
  UpdateDisponibilidadDto,
} from './dto/tecnicos.dto';

interface UserPayload {
  id: string;
  esTecnico: boolean;
}

@ApiTags('tecnicos')
@Controller('tecnicos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TecnicosController {
  constructor(private tecnicosService: TecnicosService) {}

  @Post('perfil')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Crear perfil de técnico' })
  async crearPerfil(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateTecnicoDto,
  ) {
    return this.tecnicosService.crearPerfil(user.id, dto);
  }

  @Get('perfil')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Ver perfil de técnico con estadísticas' })
  async getPerfilCompleto(@CurrentUser() user: UserPayload) {
    return this.tecnicosService.getPerfilCompleto(user.id);
  }

  @Patch('ubicacion')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Actualizar ubicación' })
  async actualizarUbicacion(
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateUbicacionDto,
  ) {
    return this.tecnicosService.actualizarUbicacion(user.id, dto);
  }

  @Patch('disponibilidad')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Cambiar disponibilidad' })
  async toggleDisponibilidad(
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateDisponibilidadDto,
  ) {
    return this.tecnicosService.toggleDisponibilidad(user.id, dto);
  }
}