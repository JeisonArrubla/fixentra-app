import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import {
  CreateTecnicoDto,
  UpdateUbicacionDto,
  UpdateDisponibilidadDto,
} from './dto/tecnicos.dto';

@Injectable()
export class TecnicosService {
  constructor(private prisma: PrismaService) {}

  async crearPerfil(usuarioId: string, dto: CreateTecnicoDto): Promise<any> {
    const existente = await this.prisma.tecnico.findUnique({
      where: { id: usuarioId },
    });

    if (existente) {
      throw new ConflictException('El perfil de técnico ya existe');
    }

    const tecnico = await this.prisma.tecnico.create({
      data: {
        id: usuarioId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        radioCoberturaKm: dto.radioCoberturaKm || 10,
      },
    });

    return tecnico;
  }

  async getPerfil(usuarioId: string): Promise<any> {
    const tecnico = await this.prisma.tecnico.findUnique({
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
      },
    });

    if (!tecnico) {
      throw new NotFoundException('Perfil de técnico no encontrado');
    }

    return tecnico;
  }

  async getPerfilCompleto(usuarioId: string): Promise<any> {
    const tecnico = await this.prisma.tecnico.findUnique({
      where: { id: usuarioId },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            correo: true,
            celular: true,
            tipoDocumento: true,
            numDocumento: true,
          },
        },
      },
    });

    if (!tecnico) {
      throw new NotFoundException('Perfil de técnico no encontrado');
    }

    const estadisticas = await this.prisma.solicitudServicio.aggregate({
      where: {
        tecnicoId: usuarioId,
        estado: 'COMPLETADO',
        calificacion: { not: null },
      },
      _avg: { calificacion: true },
      _count: { calificacion: true },
    });

    const totalServiciosCompletados = await this.prisma.solicitudServicio.count({
      where: { tecnicoId: usuarioId, estado: 'COMPLETADO' },
    });

    return {
      ...tecnico,
      usuario: tecnico.usuario,
      promedioCalificacion: estadisticas._avg.calificacion || 0,
      totalCalificaciones: estadisticas._count.calificacion || 0,
      totalServiciosCompletados,
    };
  }

  async actualizarUbicacion(
    usuarioId: string,
    dto: UpdateUbicacionDto,
  ): Promise<any> {
    const tecnico = await this.prisma.tecnico.findUnique({
      where: { id: usuarioId },
    });

    if (!tecnico) {
      throw new NotFoundException('Perfil de técnico no encontrado');
    }

    return this.prisma.tecnico.update({
      where: { id: usuarioId },
      data: {
        latitud: dto.latitud,
        longitud: dto.longitud,
      },
    });
  }

  async toggleDisponibilidad(
    usuarioId: string,
    dto: UpdateDisponibilidadDto,
  ): Promise<any> {
    const tecnico = await this.prisma.tecnico.findUnique({
      where: { id: usuarioId },
    });

    if (!tecnico) {
      throw new NotFoundException('Perfil de técnico no encontrado');
    }

    return this.prisma.tecnico.update({
      where: { id: usuarioId },
      data: {
        disponibilidad: dto.disponibilidad,
      },
    });
  }

  async getTecnicosDisponibles(
    latitud: number,
    longitud: number,
    radioKm: number = 10,
  ): Promise<any[]> {
    const tecnicos = await this.prisma.tecnico.findMany({
      where: {
        disponibilidad: true,
        latitud: { not: null },
        longitud: { not: null },
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            celular: true,
          },
        },
      },
    });

    return tecnicos.filter((t) => {
      if (t.latitud === null || t.longitud === null) return false;
      const distancia = this.haversine(
        latitud,
        longitud,
        t.latitud,
        t.longitud,
      );
      return distancia <= (t.radioCoberturaKm || radioKm);
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}