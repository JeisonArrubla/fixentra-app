import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categorias = await Promise.all([
    prisma.categoriaServicio.upsert({
      where: { slug: 'plomeria' },
      update: {},
      create: { nombre: 'Plomería', slug: 'plomeria' },
    }),
    prisma.categoriaServicio.upsert({
      where: { slug: 'gas' },
      update: {},
      create: { nombre: 'Gas', slug: 'gas' },
    }),
    prisma.categoriaServicio.upsert({
      where: { slug: 'electrodomesticos' },
      update: {},
      create: { nombre: 'Electrodomésticos', slug: 'electrodomesticos' },
    }),
  ]);

  const producto = await prisma.productoServicio.upsert({
    where: { slug: 'instalacion-calentador-agua' },
    update: {},
    create: {
      nombre: 'Instalación de calentador de agua',
      descripcion:
        'Instalación profesional de calentador de agua a gas o eléctrico. Incluye conexiones de plomería, instalación eléctrica y prueba de funcionamiento.',
      slug: 'instalacion-calentador-agua',
      precioBase: 150000,
      imagenUrl: '/uploads/placeholder-calentador.jpg',
      soportaCantidad: true,
      incluye:
        'Instalación de plomería\nInstalación eléctrica\nInstalación de gas\nPrueba de funcionamiento',
      noIncluye:
        'Calderas\nMateriales adicionales\nPreparación del espacio',
      notaInformativa:
        'El precio incluye la instalación estándar. Si requiere materiales adicionales o preparación del espacio, el técnico le informará el costo adicional antes de iniciar.',
      reglasPrecio: {
        create: [
          {
            tipo: 'boolean_extra',
            clave: 'retirar_elemento',
            etiqueta: 'Retirar elemento existente',
            precioAdicional: 30000,
          },
        ],
      },
      categorias: {
        create: categorias.map((c) => ({ categoriaId: c.id })),
      },
    },
  });

  console.log('Seed completado:');
  console.log(`  ${categorias.length} categorías creadas`);
  console.log(`  1 producto creado: ${producto.nombre}`);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
