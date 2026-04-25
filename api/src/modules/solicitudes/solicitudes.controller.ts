import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SolicitudesService } from './solicitudes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSolicitudDto, UpdateEstadoSolicitudDto } from './dto/solicitudes.dto';

interface UserPayload {
  id: string;
  esCliente: boolean;
  esTecnico: boolean;
}

@ApiTags('solicitudes')
@Controller('solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SolicitudesController {
  constructor(private solicitudesService: SolicitudesService) {}

  @Post()
  @Roles('cliente')
  @ApiOperation({ summary: 'Crear solicitud de servicio' })
  async crearSolicitud(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateSolicitudDto,
  ) {
    return this.solicitudesService.crearSolicitud(user.id, dto);
  }

  @Get('disponibles')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Ver solicitudes disponibles (polling fallback)' })
  async getDisponibles(
    @Query('latitud') latitud: number,
    @Query('longitud') longitud: number,
    @Query('radioKm') radioKm?: number,
  ) {
    return this.solicitudesService.getSolicitudesDisponibles(
      latitud,
      longitud,
      radioKm,
    );
  }

  @Get('todas')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Ver todas las solicitudes nuevas' })
  async getTodasNuevas() {
    return this.solicitudesService.getTodasNuevas();
  }

  @Get('mis-solicitudes')
  @ApiOperation({ summary: 'Ver mis solicitudes (como cliente o técnico)' })
  async getMisSolicitudes(
    @CurrentUser() user: UserPayload,
    @Query('tipo') tipo: 'cliente' | 'tecnico',
  ) {
    const tipoReal = user.esCliente && tipo === 'cliente' ? 'cliente' : 'tecnico';
    return this.solicitudesService.getMisSolicitudes(user.id, tipoReal);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver solicitud por ID' })
  async getSolicitud(@Param('id') id: string) {
    return this.solicitudesService.getSolicitudById(id);
  }

  @Post(':id/aceptar')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Aceptar solicitud' })
  async aceptarSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.solicitudesService.aceptarSolicitud(id, user.id);
  }

  @Patch(':id/terminar')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Marcar solicitud como terminada' })
  async terminateSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.solicitudesService.terminarSolicitud(id, user.id);
  }

  @Delete(':id')
  @Roles('cliente')
  @ApiOperation({ summary: 'Eliminar solicitud (solo nuevas)' })
  async eliminarSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.solicitudesService.eliminarSolicitud(id, user.id);
  }
}