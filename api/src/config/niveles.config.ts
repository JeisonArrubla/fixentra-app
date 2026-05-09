import { NivelTecnico } from '@prisma/client';

export interface NivelConfig {
  umbral: number;
  tiempoEspera: number;
  label: string;
}

function floatEnv(key: string): number {
  const raw = process.env[key];

  if (raw === undefined || raw === null || raw.trim() === '') {
    throw new Error(`Falta la variable de entorno: ${key}`);
  }

  const val = parseFloat(raw);

  if (isNaN(val)) {
    throw new Error(`La variable de entorno ${key} no es un número válido. Valor recibido: "${raw}"`);
  }

  return val;
}

export const NIVELES_CONFIG: Record<NivelTecnico, NivelConfig> = {
  [NivelTecnico.ORO]: {
    label: 'Oro',
    umbral: floatEnv('NIVEL_ORO_UMBRAL'),
    tiempoEspera: floatEnv('NIVEL_ORO_TIEMPO_ESPERA'),
  },
  [NivelTecnico.PLATA]: {
    label: 'Plata',
    umbral: floatEnv('NIVEL_PLATA_UMBRAL'),
    tiempoEspera: floatEnv('NIVEL_PLATA_TIEMPO_ESPERA'),
  },
  [NivelTecnico.BRONCE]: {
    label: 'Bronce',
    umbral: floatEnv('NIVEL_BRONCE_UMBRAL'),
    tiempoEspera: floatEnv('NIVEL_BRONCE_TIEMPO_ESPERA'),
  },
  [NivelTecnico.MADERA]: {
    label: 'Madera',
    umbral: floatEnv('NIVEL_MADERA_UMBRAL'),
    tiempoEspera: floatEnv('NIVEL_MADERA_TIEMPO_ESPERA'),
  },
};

export function determinarNivel(promedio: number): NivelTecnico {
  if (promedio >= NIVELES_CONFIG[NivelTecnico.ORO].umbral) return NivelTecnico.ORO;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.PLATA].umbral) return NivelTecnico.PLATA;
  if (promedio >= NIVELES_CONFIG[NivelTecnico.BRONCE].umbral) return NivelTecnico.BRONCE;
  return NivelTecnico.MADERA;
}