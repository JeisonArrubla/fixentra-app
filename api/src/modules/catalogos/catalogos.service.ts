import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { CalcularPrecioDto } from './dto/catalogos.dto';

const TARIFA_SERVICIO = 0.08;

@Injectable()
export class CatalogosService {
  constructor(private prisma: PrismaService) {}

  async listarProductos() {
    return this.prisma.productoServicio.findMany({
      where: { activo: true },
      include: {
        categorias: {
          include: { categoria: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductoBySlug(slug: string) {
    const producto = await this.prisma.productoServicio.findUnique({
      where: { slug, activo: true },
      include: {
        categorias: {
          include: { categoria: true },
        },
        reglasPrecio: true,
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async calcularPrecio(dto: CalcularPrecioDto) {
    const producto = await this.prisma.productoServicio.findUnique({
      where: { slug: dto.slug, activo: true },
      include: { reglasPrecio: true },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const cantidad = dto.cantidad ?? 1;
    const retirarElemento = dto.retirarElemento ?? false;

    const subtotal = producto.precioBase * cantidad;

    const reglaRetiro = producto.reglasPrecio.find(
      (r) => r.clave === 'retirar_elemento',
    );
    const extraRetiro = retirarElemento && reglaRetiro ? reglaRetiro.precioAdicional! : 0;

    const baseCalculo = subtotal + extraRetiro;
    const tarifaServicio = baseCalculo * TARIFA_SERVICIO;
    const total = baseCalculo + tarifaServicio;

    return {
      productoId: producto.id,
      slug: producto.slug,
      nombre: producto.nombre,
      precioBase: producto.precioBase,
      cantidad,
      retirarElemento,
      subtotal: Math.round(subtotal),
      tarifaServicio: Math.round(tarifaServicio),
      total: Math.round(total),
      notaInformativa: producto.notaInformativa,
    };
  }

  async listarCategorias() {
    return this.prisma.categoriaServicio.findMany({
      include: {
        productos: {
          include: {
            producto: {
              select: { id: true, nombre: true, slug: true, precioBase: true, imagenUrl: true },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }
}
