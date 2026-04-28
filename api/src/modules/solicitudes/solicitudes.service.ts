import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import {
  CreateSolicitudDto,
  UpdateEstadoSolicitudDto,
  CompletarSolicitudDto,
  CalificarSolicitudDto,
} from './dto/solicitudes.dto';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  async eliminarSolicitud(
    solicitudId: string,
    clienteId: string,
  ): Promise<void> {
    const solicitud = await this.prisma.solicitudServicio.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.clienteId !== clienteId) {
      throw new ForbiddenException('No tienes autorización para eliminar esta solicitud');
    }

    if (solicitud.estado !== 'NUEVA') {
      throw new BadRequestException('Solo puedes eliminar solicitudes nuevas');
    }

    await this.prisma.solicitudServicio.delete({
      where: { id: solicitudId },
    });
  }

  async crearSolicitud(
    clienteId: string,
    dto: CreateSolicitudDto,
  ): Promise<any> {
    const direccion = await this.prisma.direccion.findUnique({
      where: { id: dto.direccionId },
      include: { cliente: true },
    });

    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (direccion.clienteId !== clienteId) {
      throw new ForbiddenException('La dirección no pertenece a este cliente');
    }

    const solicitud = await this.prisma.solicitudServicio.create({
      data: {
        clienteId,
        direccionId: dto.direccionId,
        descripcion: dto.descripcion,
        imagenes: dto.imagenes?.length
          ? {
              create: dto.imagenes.map((url) => ({ url })),
            }
          : undefined,
      },
      include: {
        direccion: true,
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            correo: true,
          },
        },
        imagenes: true,
      },
    });

    return solicitud;
  }

  async getSolicitudesDisponibles(
    latitud: number,
    longitud: number,
    radioKm: number = 10,
  ): Promise<any[]> {
    const solicitudes = await this.prisma.solicitudServicio.findMany({
      where: { estado: 'NUEVA' },
      include: {
        direccion: true,
        cliente: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return solicitudes.filter((s) => {
      const distancia = this.haversine(
        latitud,
        longitud,
        s.direccion.latitud,
        s.direccion.longitud,
      );
      return distancia <= radioKm;
    });
  }

  async aceptarSolicitud(
    solicitudId: string,
    tecnicoId: string,
  ): Promise<any> {
    const solicitud = await this.prisma.solicitudServicio.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado !== 'NUEVA') {
      throw new BadRequestException(
        'La solicitud ya no está disponible',
      );
    }

    if (solicitud.clienteId === tecnicoId) {
      throw new ForbiddenException(
        'No puedes aceptar tu propia solicitud',
      );
    }

    const result = await this.prisma.solicitudServicio.updateMany({
      where: {
        id: solicitudId,
        estado: 'NUEVA',
      },
      data: {
        estado: 'ASIGNADA',
        tecnicoId,
      },
    });

    if (result.count === 0) {
      throw new BadRequestException(
        'La solicitud fue tomada por otro técnico',
      );
    }

    return this.prisma.solicitudServicio.findUnique({
      where: { id: solicitudId },
      include: {
        direccion: true,
        cliente: {
          select: { nombre: true, apellido: true, correo: true },
        },
        tecnico: {
          select: { nombre: true, apellido: true, correo: true },
        },
      },
    });
  }

  async terminarSolicitud(
    solicitudId: string,
    tecnicoId: string,
  ): Promise<any> {
    const solicitud = await this.prisma.solicitudServicio.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.tecnicoId !== tecnicoId) {
      throw new ForbiddenException(
        'No tienes autorización para terminar esta solicitud',
      );
    }

    if (solicitud.estado !== 'ASIGNADA') {
      throw new BadRequestException(
        'La solicitud no está en estado asignada',
      );
    }

    return this.prisma.solicitudServicio.update({
      where: { id: solicitudId },
      data: { estado: 'TERMINADA' },
      include: {
        direccion: true,
        cliente: true,
        tecnico: true,
      },
    });
  }

  async getMisSolicitudes(
    usuarioId: string,
    tipo: 'cliente' | 'tecnico',
  ): Promise<any[]> {
    const where = tipo === 'cliente'
      ? { clienteId: usuarioId }
      : { tecnicoId: usuarioId };

    return this.prisma.solicitudServicio.findMany({
      where,
      include: {
        direccion: true,
        cliente: {
          select: { nombre: true, apellido: true, correo: true },
        },
        tecnico: {
          select: { nombre: true, apellido: true, correo: true },
        },
        imagenes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completarSolicitud(
    solicitudId: string,
    tecnicoId: string,
    dto: CompletarSolicitudDto,
  ): Promise<any> {
    const solicitud = await this.prisma.solicitudServicio.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.tecnicoId !== tecnicoId) {
      throw new ForbiddenException(
        'No tienes autorización para completar esta solicitud',
      );
    }

    if (solicitud.estado !== 'ASIGNADA') {
      throw new BadRequestException(
        'La solicitud no está en estado asignada',
      );
    }

    if (dto.imagenes.length < 1 || dto.imagenes.length > 2) {
      throw new BadRequestException(
        'Debes cargar entre 1 y 2 imágenes',
      );
    }

    return this.prisma.solicitudServicio.update({
      where: { id: solicitudId },
      data: {
        estado: 'COMPLETADO',
        detallesCompletado: dto.detalles,
        imagenes: {
          create: dto.imagenes.map((url) => ({ url })),
        },
      },
      include: {
        direccion: true,
        cliente: true,
        tecnico: true,
        imagenes: true,
      },
    });
  }

  async getTodasNuevas(): Promise<any[]> {
    return this.prisma.solicitudServicio.findMany({
      where: { estado: 'NUEVA' },
      include: {
        direccion: true,
        cliente: {
          select: { nombre: true, apellido: true, correo: true },
        },
        imagenes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSolicitudById(solicitudId: string): Promise<any> {
    const solicitud = await this.prisma.solicitudServicio.findUnique({
      where: { id: solicitudId },
      include: {
        direccion: true,
        cliente: {
          select: { nombre: true, apellido: true, correo: true },
        },
        tecnico: {
          select: { nombre: true, apellido: true, correo: true },
        },
        imagenes: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return solicitud;
  }

  async calificarSolicitud(
    solicitudId: string,
    clienteId: string,
    dto: CalificarSolicitudDto,
  ): Promise<any> {
    const solicitud = await this.prisma.solicitudServicio.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.clienteId !== clienteId) {
      throw new ForbiddenException(
        'No tienes autorización para calificar esta solicitud',
      );
    }

    if (solicitud.estado !== 'COMPLETADO' && solicitud.estado !== 'TERMINADA') {
      throw new BadRequestException(
        'Solo puedes calificar solicitudes completadas',
      );
    }

    if (solicitud.calificacion !== null) {
      throw new BadRequestException(
        'Esta solicitud ya fue calificada',
      );
    }

    return this.prisma.solicitudServicio.update({
      where: { id: solicitudId },
      data: {
        calificacion: dto.calificacion,
        comentarioCalificacion: dto.comentario,
        fechaCalificacion: new Date(),
      },
      include: {
        direccion: true,
        cliente: { select: { nombre: true, apellido: true, correo: true } },
        tecnico: { select: { nombre: true, apellido: true, correo: true } },
        imagenes: true,
      },
    });
  }

  private haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}