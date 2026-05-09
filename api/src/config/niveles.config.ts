import { NivelTecnico } from '@prisma/client';

export interface NivelConfig {
  umbral: number;
  tiempoEspera: number;
  label: string;
}

function floatEnv(key: string, fallback: number): number {
  return parseFloat(process.env[key] ?? String(fallback));
}

export const NIVELES_CONFIG: Record<NivelTecnico, NivelConfig> = {
  [NivelTecnico.ORO]: {
    label: 'Oro',
    umbral: floatEnv('NIVEL_ORO_UMBRAL', 4.2),
    tiempoEspera: floatEnv('NIVEL_ORO_TIEMPO_ESPERA', 0),
  },
  [NivelTecnico.PLATA]: {
    label: 'Plata',
    umbral: floatEnv('NIVEL_PLATA_UMBRAL', 3.5),
    tiempoEspera: floatEnv('NIVEL_PLATA_TIEMPO_ESPERA', 1),
  },
  [NivelTecnico.BRONCE]: {
    label: 'Bronce',
    umbral: floatEnv('NIVEL_BRONCE_UMBRAL', 2.8),
    tiempoEspera: floatEnv('NIVEL_BRONCE_TIEMPO_ESPERA', 2),
  },
  [NivelTecnico.MADERA]: {
    label: 'Madera',
    umbral: floatEnv('NIVEL_MADERA_UMBRAL', 1.0),
    tiempoEspera: floatEnv('NIVEL_MADERA_TIEMPO_ESPERA', 3),
  },
};

export function determinarNivel(promedio: number): NivelTecnico {
  if (promedio >= NIVELES_CONFIG[NivelTecnico.ORO].umbral) return NivelTecnico.ORO;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.PLATA].umbral) return NivelTecnico.PLATA;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.BRONCE].umbral) return NivelTecnico.BRONCE;
  return NivelTecnico.MADERA;
}