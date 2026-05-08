import { Injectable } from '@nestjs/common';
import { NivelTecnico } from '@prisma/client';
import { PrismaService } from '../../shared/prisma.service';
import { NIVELES_CONFIG, determinarNivel } from '../../config/niveles.config';

@Injectable()
export class NivelesService {
  constructor(private prisma: PrismaService) {}

  obtenerTiempoEspera(nivel: NivelTecnico): number {
    return NIVELES_CONFIG[nivel].tiempoEspera;
  }

  async recalcularNivel(tecnicoId: string): Promise<NivelTecnico> {
    const stats = await this.prisma.servicio.aggregate({
      where: {
        tecnicoId,
        estado: 'CERRADO',
        calificacion: { not: null },
      },
      _avg: { calificacion: true },
    });

    const promedio = stats._avg.calificacion ?? 0;
    const nivel = determinarNivel(promedio);

    await this.prisma.tecnico.update({
      where: { id: tecnicoId },
      data: { nivel },
    });

    return nivel;
  }
}
