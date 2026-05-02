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
import { CreateServicioDto, UpdateEstadoServicioDto, CompletarServicioDto, CalificarServicioDto } from './dto/solicitudes.dto';

interface UserPayload {
  id: string;
  esCliente: boolean;
  esTecnico: boolean;
}

@ApiTags('servicios')
@Controller('servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SolicitudesController {
  constructor(private solicitudesService: SolicitudesService) {}

  @Post()
  @Roles('cliente')
  @ApiOperation({ summary: 'Crear servicio' })
  async crearSolicitud(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateServicioDto,
  ) {
    return this.solicitudesService.crearSolicitud(user.id, dto);
  }

  @Get('disponibles')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Ver servicios disponibles (polling fallback)' })
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
  @ApiOperation({ summary: 'Ver todos los servicios nuevos' })
  async getTodasNuevas() {
    return this.solicitudesService.getTodasNuevas();
  }

  @Get('mis-servicios')
  @ApiOperation({ summary: 'Ver mis servicios (como cliente o técnico)' })
  async getMisSolicitudes(
    @CurrentUser() user: UserPayload,
    @Query('tipo') tipo: 'cliente' | 'tecnico',
  ) {
    const tipoReal = user.esCliente && tipo === 'cliente' ? 'cliente' : 'tecnico';
    return this.solicitudesService.getMisSolicitudes(user.id, tipoReal);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver servicio por ID' })
  async getSolicitud(@Param('id') id: string) {
    return this.solicitudesService.getSolicitudById(id);
  }

  @Post(':id/aceptar')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Aceptar servicio' })
  async aceptarSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.solicitudesService.aceptarSolicitud(id, user.id);
  }

  @Patch(':id/terminar')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Marcar servicio como terminado' })
  async terminateSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.solicitudesService.terminarSolicitud(id, user.id);
  }

  @Patch(':id/completar')
  @Roles('tecnico')
  @ApiOperation({ summary: 'Completar servicio con detalles e imágenes' })
  async completarSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: CompletarServicioDto,
  ) {
    return this.solicitudesService.completarSolicitud(id, user.id, dto);
  }

  @Patch(':id/calificar')
  @Roles('cliente')
  @ApiOperation({ summary: 'Calificar servicio (1-5 estrellas)' })
  async calificarSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: CalificarServicioDto,
  ) {
    return this.solicitudesService.calificarSolicitud(id, user.id, dto);
  }

  @Delete(':id')
  @Roles('cliente')
  @ApiOperation({ summary: 'Eliminar servicio (solo nuevos)' })
  async eliminarSolicitud(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.solicitudesService.eliminarSolicitud(id, user.id);
  }
}
