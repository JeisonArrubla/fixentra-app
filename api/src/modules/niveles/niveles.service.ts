import { Injectable, Logger } from '@nestjs/common';
import { NivelTecnico } from '@prisma/client';
import { PrismaService } from '../../shared/prisma.service';
import { NIVELES_CONFIG, determinarNivel } from '../../config/niveles.config';

@Injectable()
export class NivelesService {
  private readonly logger = new Logger(NivelesService.name);

  constructor(private prisma: PrismaService) {}

  obtenerTiempoEspera(nivel: NivelTecnico): number {
    return NIVELES_CONFIG[nivel].tiempoEspera;
  }

  async recalcularNivel(tecnicoId: string): Promise<NivelTecnico> {
    this.logger.log(`Recalculando nivel para técnico ${tecnicoId}`);

    const stats = await this.prisma.servicio.aggregate({
      where: {
        tecnicoId,
        estado: 'CERRADO',
        calificacion: { not: null },
      },
      _avg: { calificacion: true },
    });

    const promedio = stats._avg.calificacion ?? 0;
    this.logger.log(`Promedio calificaciones: ${promedio}`);

    const nivel = determinarNivel(promedio);
    this.logger.log(`Nivel determinado: ${nivel}`);

    const result = await this.prisma.tecnico.update({
      where: { id: tecnicoId },
      data: { nivel },
    });

    this.logger.log(`Técnico actualizado, nivel ahora: ${result.nivel}`);

    return nivel;
  }
}
