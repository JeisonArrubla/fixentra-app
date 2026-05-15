import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { CalcularPrecioDto } from './dto/catalogos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('catalogos')
@Controller('catalogos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CatalogosController {
  constructor(private catalogosService: CatalogosService) {}

  @Get('productos')
  @Roles('cliente', 'tecnico')
  @ApiOperation({ summary: 'Listar productos de servicio activos' })
  async listarProductos() {
    return this.catalogosService.listarProductos();
  }

  @Get('productos/:slug')
  @Roles('cliente', 'tecnico')
  @ApiOperation({ summary: 'Obtener detalle de producto por slug' })
  async getProducto(@Param('slug') slug: string) {
    return this.catalogosService.getProductoBySlug(slug);
  }

  @Post('productos/calcular')
  @Roles('cliente')
  @ApiOperation({ summary: 'Calcular precio de un servicio' })
  async calcularPrecio(@Body() dto: CalcularPrecioDto) {
    return this.catalogosService.calcularPrecio(dto);
  }

  @Get('categorias')
  @Roles('cliente', 'tecnico')
  @ApiOperation({ summary: 'Listar categorías con sus productos' })
  async listarCategorias() {
    return this.catalogosService.listarCategorias();
  }
}
