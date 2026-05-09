import { NivelTecnico } from '@prisma/client';

export interface NivelConfig {
  umbral: number;
  tiempoEspera: number;
  label: string;
}

function envNivel(nivel: string, key: string, defaultValue: number): number {
  const val = process.env[`NIVEL_${nivel}_${key}`];
  return val ? parseFloat(val) : defaultValue;
}

export const NIVELES_CONFIG: Record<NivelTecnico, NivelConfig> = {
  [NivelTecnico.ORO]:    { umbral: envNivel('ORO', 'UMBRAL', 4.2),    tiempoEspera: envNivel('ORO', 'TIEMPO_ESPERA', 0),   label: 'Oro' },
  [NivelTecnico.PLATA]:  { umbral: envNivel('PLATA', 'UMBRAL', 3.5),  tiempoEspera: envNivel('PLATA', 'TIEMPO_ESPERA', 1),  label: 'Plata' },
  [NivelTecnico.BRONCE]: { umbral: envNivel('BRONCE', 'UMBRAL', 2.8), tiempoEspera: envNivel('BRONCE', 'TIEMPO_ESPERA', 2),  label: 'Bronce' },
  [NivelTecnico.MADERA]: { umbral: envNivel('MADERA', 'UMBRAL', 1.0), tiempoEspera: envNivel('MADERA', 'TIEMPO_ESPERA', 3),  label: 'Madera' },
};

export function determinarNivel(promedio: number): NivelTecnico {
  if (promedio >= NIVELES_CONFIG[NivelTecnico.ORO].umbral) return NivelTecnico.ORO;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.PLATA].umbral) return NivelTecnico.PLATA;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.BRONCE].umbral) return NivelTecnico.BRONCE;
  return NivelTecnico.MADERA;
}