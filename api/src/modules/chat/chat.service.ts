import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async validarParticipante(servicioId: string, usuarioId: string): Promise<void> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (servicio.clienteId !== usuarioId && servicio.tecnicoId !== usuarioId) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }
  }

  async obtenerMensajes(servicioId: string, usuarioId: string): Promise<any[]> {
    await this.validarParticipante(servicioId, usuarioId);

    const mensajes = await this.prisma.mensaje.findMany({
      where: { servicioId },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return mensajes;
  }

  async crearMensaje(
    servicioId: string,
    emisorId: string,
    contenido: string,
  ): Promise<any> {
    await this.validarParticipante(servicioId, emisorId);

    const mensaje = await this.prisma.mensaje.create({
      data: {
        servicioId,
        emisorId,
        contenido,
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return mensaje;
  }

  async marcarComoLeidos(servicioId: string, usuarioId: string): Promise<void> {
    await this.validarParticipante(servicioId, usuarioId);

    await this.prisma.mensaje.updateMany({
      where: {
        servicioId,
        emisorId: { not: usuarioId },
        leido: false,
      },
      data: {
        leido: true,
      },
    });
  }
}
