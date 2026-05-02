import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import {
  CreateServicioDto,
  UpdateEstadoServicioDto,
  CompletarServicioDto,
  CalificarServicioDto,
} from './dto/solicitudes.dto';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  async eliminarSolicitud(
    solicitudId: string,
    clienteId: string,
  ): Promise<void> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: solicitudId },
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (servicio.clienteId !== clienteId) {
      throw new ForbiddenException('No tienes autorización para eliminar este servicio');
    }

    if (servicio.estado !== 'NUEVO') {
      throw new BadRequestException('Solo puedes eliminar servicios nuevos');
    }

    await this.prisma.servicio.delete({
      where: { id: solicitudId },
    });
  }

  async crearSolicitud(
    clienteId: string,
    dto: CreateServicioDto,
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

    const servicio = await this.prisma.servicio.create({
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

    return servicio;
  }

  async getSolicitudesDisponibles(
    latitud: number,
    longitud: number,
    radioKm: number = 10,
  ): Promise<any[]> {
    const servicios = await this.prisma.servicio.findMany({
      where: { estado: 'NUEVO' },
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

    return servicios.filter((s) => {
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
    servicioId: string,
    tecnicoId: string,
  ): Promise<any> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (servicio.estado !== 'NUEVO') {
      throw new BadRequestException(
        'El servicio ya no está disponible',
      );
    }

    if (servicio.clienteId === tecnicoId) {
      throw new ForbiddenException(
        'No puedes aceptar tu propio servicio',
      );
    }

    const result = await this.prisma.servicio.updateMany({
      where: {
        id: servicioId,
        estado: 'NUEVO',
      },
      data: {
        estado: 'ASIGNADO',
        tecnicoId,
      },
    });

    if (result.count === 0) {
      throw new BadRequestException(
        'El servicio fue tomado por otro técnico',
      );
    }

    return this.prisma.servicio.findUnique({
      where: { id: servicioId },
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
    servicioId: string,
    tecnicoId: string,
  ): Promise<any> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (servicio.tecnicoId !== tecnicoId) {
      throw new ForbiddenException(
        'No tienes autorización para terminar este servicio',
      );
    }

    if (servicio.estado !== 'ASIGNADO') {
      throw new BadRequestException(
        'El servicio no está en estado asignado',
      );
    }

    return this.prisma.servicio.update({
      where: { id: servicioId },
      data: { estado: 'TERMINADO' },
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

    return this.prisma.servicio.findMany({
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
    servicioId: string,
    tecnicoId: string,
    dto: CompletarServicioDto,
  ): Promise<any> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (servicio.tecnicoId !== tecnicoId) {
      throw new ForbiddenException(
        'No tienes autorización para completar este servicio',
      );
    }

    if (servicio.estado !== 'ASIGNADO') {
      throw new BadRequestException(
        'El servicio no está en estado asignado',
      );
    }

    if (dto.imagenes.length < 1 || dto.imagenes.length > 2) {
      throw new BadRequestException(
        'Debes cargar entre 1 y 2 imágenes',
      );
    }

    return this.prisma.servicio.update({
      where: { id: servicioId },
      data: {
        estado: 'TERMINADO',
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
    return this.prisma.servicio.findMany({
      where: { estado: 'NUEVO' },
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

  async getSolicitudById(servicioId: string): Promise<any> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
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

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    return servicio;
  }

  async calificarSolicitud(
    servicioId: string,
    clienteId: string,
    dto: CalificarServicioDto,
  ): Promise<any> {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (servicio.clienteId !== clienteId) {
      throw new ForbiddenException(
        'No tienes autorización para calificar este servicio',
      );
    }

    if (servicio.estado !== 'TERMINADO') {
      throw new BadRequestException(
        'Solo puedes calificar servicios terminados',
      );
    }

    if (servicio.calificacion !== null) {
      throw new BadRequestException(
        'Este servicio ya fue calificado',
      );
    }

    return this.prisma.servicio.update({
      where: { id: servicioId },
      data: {
        calificacion: dto.calificacion,
        comentarioCalificacion: dto.comentario,
        fechaCalificacion: new Date(),
        estado: 'CERRADO',
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
