import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { CreateDireccionDto, UpdateDireccionDto } from './dto/clientes.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async crearPerfil(usuarioId: string): Promise<{ id: string; usuarioId: string }> {
    const existente = await this.prisma.cliente.findUnique({
      where: { id: usuarioId },
    });

    if (existente) {
      throw new ConflictException('El perfil de cliente ya existe');
    }

    const cliente = await this.prisma.cliente.create({
      data: { id: usuarioId },
    });

    return { id: cliente.id, usuarioId: cliente.id };
  }

  async getPerfil(usuarioId: string): Promise<any> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: usuarioId },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            correo: true,
            celular: true,
          },
        },
        direcciones: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente no encontrado');
    }

    return cliente;
  }

  async crearDireccion(
    usuarioId: string,
    dto: CreateDireccionDto,
  ): Promise<any> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException(
        'Primero debes crear tu perfil de cliente',
      );
    }

    if (dto.esPrincipal) {
      await this.prisma.direccion.updateMany({
        where: { clienteId: usuarioId },
        data: { esPrincipal: false },
      });
    }

    const direccion = await this.prisma.direccion.create({
      data: {
        clienteId: usuarioId,
        direccion: dto.direccion,
        latitud: dto.latitud,
        longitud: dto.longitud,
        esPrincipal: dto.esPrincipal || false,
      },
    });

    return direccion;
  }

  async listarDirecciones(usuarioId: string): Promise<any[]> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente no encontrado');
    }

    return this.prisma.direccion.findMany({
      where: { clienteId: usuarioId },
      orderBy: { esPrincipal: 'desc' },
    });
  }

  async actualizarDireccion(
    direccionId: string,
    usuarioId: string,
    dto: UpdateDireccionDto,
  ): Promise<any> {
    const existente = await this.prisma.direccion.findFirst({
      where: { id: direccionId, clienteId: usuarioId },
    });

    if (!existente) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (dto.esPrincipal) {
      await this.prisma.direccion.updateMany({
        where: { clienteId: usuarioId },
        data: { esPrincipal: false },
      });
    }

    return this.prisma.direccion.update({
      where: { id: direccionId },
      data: dto,
    });
  }

  async eliminarDireccion(
    direccionId: string,
    usuarioId: string,
  ): Promise<void> {
    const existente = await this.prisma.direccion.findFirst({
      where: { id: direccionId, clienteId: usuarioId },
    });

    if (!existente) {
      throw new NotFoundException('Dirección no encontrada');
    }

    const solicitudesActivas = await this.prisma.solicitudServicio.count({
      where: {
        direccionId,
        estado: { in: ['NUEVA', 'ASIGNADA'] },
      },
    });

    if (solicitudesActivas > 0) {
      throw new BadRequestException(
        'No puedes eliminar esta dirección porque tiene solicitudes activas',
      );
    }

    await this.prisma.direccion.delete({
      where: { id: direccionId },
    });
  }

  async setDireccionPrincipal(
    direccionId: string,
    usuarioId: string,
  ): Promise<any> {
    const existente = await this.prisma.direccion.findFirst({
      where: { id: direccionId, clienteId: usuarioId },
    });

    if (!existente) {
      throw new NotFoundException('Dirección no encontrada');
    }

    await this.prisma.direccion.updateMany({
      where: { clienteId: usuarioId },
      data: { esPrincipal: false },
    });

    return this.prisma.direccion.update({
      where: { id: direccionId },
      data: { esPrincipal: true },
    });
  }
}