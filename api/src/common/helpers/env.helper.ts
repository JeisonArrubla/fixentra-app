export function floatEnv(key: string): number {
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
