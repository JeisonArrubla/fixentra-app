import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateDireccionDto,
  UpdateDireccionDto,
} from './dto/clientes.dto';

interface UserPayload {
  id: string;
  esCliente: boolean;
}

@ApiTags('clientes')
@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientesController {
  private logger = new Logger(ClientesController.name);

  constructor(private clientesService: ClientesService) {}

  @Get('direcciones')
  @Roles('cliente')
  @ApiOperation({ summary: 'Listar direcciones del cliente' })
  async getDirecciones(@CurrentUser() user: UserPayload) {
    this.logger.log(`[getDirecciones] usuarioId: ${user.id}, esCliente: ${user.esCliente}`);
    return this.clientesService.listarDirecciones(user.id);
  }

  @Get('perfil')
  @Roles('cliente')
  @ApiOperation({ summary: 'Obtener perfil de cliente' })
  async getPerfil(@CurrentUser() user: UserPayload) {
    return this.clientesService.getPerfil(user.id);
  }

  @Post('direcciones')
  @Roles('cliente')
  @ApiOperation({ summary: 'Crear dirección' })
  async crearDireccion(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateDireccionDto,
  ) {
    return this.clientesService.crearDireccion(user.id, dto);
  }

  @Get('direcciones')
  @Roles('cliente')
  @ApiOperation({ summary: 'Listar direcciones' })
  async listarDirecciones(@CurrentUser() user: UserPayload) {
    return this.clientesService.listarDirecciones(user.id);
  }

  @Put('direcciones/:id')
  @Roles('cliente')
  @ApiOperation({ summary: 'Actualizar dirección' })
  async actualizarDireccion(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateDireccionDto,
  ) {
    return this.clientesService.actualizarDireccion(id, user.id, dto);
  }

  @Delete('direcciones/:id')
  @Roles('cliente')
  @ApiOperation({ summary: 'Eliminar dirección' })
  async eliminarDireccion(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.clientesService.eliminarDireccion(id, user.id);
  }

  @Patch('direcciones/:id/principal')
  @Roles('cliente')
  @ApiOperation({ summary: 'Marcar dirección como principal' })
  async setPrincipal(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.clientesService.setDireccionPrincipal(id, user.id);
  }
}