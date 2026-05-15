import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cats = await Promise.all([
    prisma.categoriaServicio.upsert({
      where: { slug: 'instalaciones' },
      update: {},
      create: { nombre: 'Instalaciones', slug: 'instalaciones' },
    }),
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
    prisma.categoriaServicio.upsert({
      where: { slug: 'reparaciones' },
      update: {},
      create: { nombre: 'Reparaciones', slug: 'reparaciones' },
    }),
  ]);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const producto = await prisma.productoServicio.upsert({
    where: { slug: 'instalacion-calentador-agua' },
    update: {
      imagenUrl: '/images/calentador-card.jpg',
      categorias: {
        deleteMany: {},
        create: [
          { categoriaId: catMap.instalaciones },
          { categoriaId: catMap.plomeria },
          { categoriaId: catMap.gas },
          { categoriaId: catMap.electrodomesticos },
        ].filter(Boolean),
      },
      reglasPrecio: {
        deleteMany: {},
        create: [
          {
            tipo: 'boolean_extra',
            clave: 'retirar_elemento',
            etiqueta: 'Retirar elemento existente',
            precioAdicional: 30000,
          },
        ],
      },
    },
    create: {
      nombre: 'Instalación de calentador de agua',
      descripcion:
        'Instalación profesional de calentador de agua a gas o eléctrico. Incluye conexiones de plomería, instalación eléctrica y prueba de funcionamiento.',
      slug: 'instalacion-calentador-agua',
      precioBase: 150000,
      imagenUrl: '/images/calentador-card.jpg',
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
        create: [
          { categoriaId: catMap.instalaciones },
          { categoriaId: catMap.plomeria },
          { categoriaId: catMap.gas },
          { categoriaId: catMap.electrodomesticos },
        ].filter(Boolean),
      },
    },
  });

  const paramsLavadora = [
    catMap.reparaciones,
    catMap.electrodomesticos,
  ].map((id) => ({ categoriaId: id }));

  const producto2 = await prisma.productoServicio.upsert({
    where: { slug: 'reparacion-lavadora' },
    update: {},
    create: {
      nombre: 'Reparación de lavadora',
      descripcion:
        '¿Lavadora averiada? Diagnosticamos y reparamos para que todo vuelva a funcionar como antes.\n\nIdeal para:\n• La máquina no enciende\n• La máquina no drena agua\n• La puerta no abre o está rota\n• Sello de goma suelto o dañado\n• No centrifuga\n• Fuga de agua\n• El botón no funciona',
      slug: 'reparacion-lavadora',
      precioBase: 95000,
      imagenUrl: '/images/lavadora-card.jpg',
      soportaCantidad: true,
      incluye:
        'Diagnóstico\nReparación de la máquina\nPruebas funcionales',
      noIncluye:
        'Repuestos o piezas de reemplazo\nCompra de partes eléctricas o mecánicas\nDaños estructurales mayores del electrodoméstico no relacionados con reparación estándar\nInstalación de lavadoras nuevas o traslados del equipo',
      notaInformativa:
        'Si se requieren piezas o repuestos adicionales, siempre se te informará previamente y solo se procederá con tu aprobación.',
      categorias: {
        create: paramsLavadora,
      },
    },
  });

  console.log('Seed completado:');
  console.log(`  ${Object.keys(catMap).length} categorías: ${Object.keys(catMap).join(', ')}`);
  console.log(`  2 productos: ${producto.nombre}, ${producto2.nombre}`);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
