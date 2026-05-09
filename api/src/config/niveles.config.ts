import { NivelTecnico } from '@prisma/client';

export interface NivelConfig {
  umbral: number;
  tiempoEspera: number;
  label: string;
}

export const NIVELES_CONFIG: Record<NivelTecnico, NivelConfig> = {
  [NivelTecnico.ORO]:    { umbral: 4.2, tiempoEspera: 0,   label: 'Oro' },
  [NivelTecnico.PLATA]:  { umbral: 3.5, tiempoEspera: 1,  label: 'Plata' },
  [NivelTecnico.BRONCE]: { umbral: 2.8, tiempoEspera: 2,  label: 'Bronce' },
  [NivelTecnico.MADERA]: { umbral: 1.0, tiempoEspera: 3,  label: 'Madera' },
};

export function determinarNivel(promedio: number): NivelTecnico {
  if (promedio >= NIVELES_CONFIG[NivelTecnico.ORO].umbral) return NivelTecnico.ORO;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.PLATA].umbral) return NivelTecnico.PLATA;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.BRONCE].umbral) return NivelTecnico.BRONCE;
  return NivelTecnico.MADERA;
}

// export const NIVELES_CONFIG: Record<NivelTecnico, NivelConfig> = {
//   [NivelTecnico.ORO]:    { umbral: 4.2, tiempoEspera: 0,   label: 'Oro' },
//   [NivelTecnico.PLATA]:  { umbral: 3.5, tiempoEspera: 10,  label: 'Plata' },
//   [NivelTecnico.BRONCE]: { umbral: 2.8, tiempoEspera: 30,  label: 'Bronce' },
//   [NivelTecnico.MADERA]: { umbral: 1.0, tiempoEspera: 60,  label: 'Madera' },
// };