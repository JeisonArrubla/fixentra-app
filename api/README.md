# Fixentra API - Backend

API RESTful para el marketplace de servicios del hogar construida con NestJS.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Base de Datos**: PostgreSQL 14+
- **Autenticación**: Passport (JWT + Local)
- **WebSockets**: Socket.IO (chat + notificaciones de solicitudes)
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger (OpenAPI 3)

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Iniciar en desarrollo con watch |
| `npm run start:prod` | Iniciar en producción |
| `npm run build` | Compilar TypeScript |
| `npm run prisma:generate` | Generar cliente Prisma |
| `npm run prisma:migrate` | Ejecutar migraciones |
| `npm run prisma:push` | Sincronizar schema con DB |
| `npm run lint` | Lint y fix |
| `npm run test` | Ejecutar tests |

## Estructura

```
api/src/
├── main.ts                 # Entry point (NestFactory, Swagger, CORS)
├── app.module.ts           # Módulo raíz (8 módulos funcionales + Config + ServeStatic)
├── config/
│   └── niveles.config.ts   # Config niveles técnicos desde env vars
├── shared/
│   └── prisma.service.ts   # Singleton PrismaClient (injectable)
├── common/                 # Código compartido
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── decorators/         # CurrentUser, Roles
│   ├── filters/            # Filtros de excepciones (vacíos - preparado)
│   ├── interceptors/       # Interceptores (vacíos - preparado)
│   ├── helpers/            # floatEnv, stringEnv (fail-fast)
│   └── validators/         # IsDocumento (validación tipo documento)
└── modules/                # Módulos funcionales
    ├── auth/               # Autenticación JWT (Passport strategies)
    ├── catalogos/          # Catálogo de productos y categorías
    ├── chat/               # Chat (Socket.IO gateway + REST)
    ├── clientes/           # Gestión clientes y direcciones
    ├── niveles/            # Lógica de niveles y reputación
    ├── solicitudes/        # Servicios (CRUD + Socket.IO gateway)
    ├── tecnicos/           # Perfiles, disponibilidad, ubicación
    ├── upload/             # Subida de imágenes (Strategy Pattern)
    └── usuarios/           # Servicios internos de usuario
```

## Variables de Entorno

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fixentra"
JWT_SECRET="secret"
JWT_REFRESH_SECRET="refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"

# Niveles técnicos - umbrales y tiempos de espera
NIVEL_ORO_UMBRAL=4.2
NIVEL_ORO_TIEMPO_ESPERA=0
NIVEL_PLATA_UMBRAL=3.5
NIVEL_PLATA_TIEMPO_ESPERA=10
NIVEL_BRONCE_UMBRAL=2.8
NIVEL_BRONCE_TIEMPO_ESPERA=30
NIVEL_MADERA_UMBRAL=1.0
NIVEL_MADERA_TIEMPO_ESPERA=60
```

## Endpoints Principales

Prefix: `/api` (configurado en `main.ts`)

### Auth
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil

### Auth
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión con JWT
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil del usuario autenticado

### Clientes
- `GET /clientes/perfil` - Perfil del cliente
- CRUD de direcciones (`/clientes/direcciones`)
- `PATCH /clientes/direcciones/:id/principal` - Marcar como principal
- Soft delete con validación (no eliminar si tiene servicios activos)

### Técnicos
- `POST /tecnicos/perfil` - Crear/completar perfil técnico
- `GET /tecnicos/perfil` - Perfil con estadísticas (promedio, reseñas, completados)
- `PATCH /tecnicos/ubicacion` - Actualizar ubicación GPS
- `PATCH /tecnicos/disponibilidad` - Toggle disponibilidad

### Catálogos
- `GET /catalogos/productos` - Listar productos activos del catálogo
- `GET /catalogos/productos/:slug` - Detalle de producto con reglas de precio
- `POST /catalogos/productos/calcular` - Calcular precio (desglose: subtotal, tarifa 8%, total)
- `GET /catalogos/categorias` - Listar categorías con productos asociados

### Servicios
- CRUD de servicios con filtros por estado
- Aceptar, terminar, completar (con detalles e imágenes), calificar
- Geolocalización para búsqueda de servicios disponibles
- Asociación con productos del catálogo (ProductoServicio)
- WebSocket (Socket.IO) para notificaciones en tiempo real de nuevos servicios
- Precio calculado con desglose (precioBase, cantidad, opciones, subtotal, tarifaServicio, total)

### Chat
- Mensajería REST + Socket.IO en tiempo real
- Marcar mensajes como leídos

### Upload
- Subida de imágenes (single y múltiple, máx 2 simultáneas)
- Strategy Pattern (actualmente LocalStorage, preparado para S3)

## Modelos (Prisma) — 10 modelos, 4 enums

### Enums
- `TipoDocumento`: CC, CE, PASAPORTE, NIT
- `EstadoServicio`: NUEVO, ASIGNADO, TERMINADO, CERRADO
- `EstadoPago`: PENDIENTE, PAGADO, FALLIDO
- `NivelTecnico`: MADERA, BRONCE, PLATA, ORO

### Modelos
- **Usuario** — Registro base: nombre, apellido, documento, correo, celular, contraseña. Relaciona 1:1 con Cliente y Tecnico.
- **RefreshToken** — Tokens JWT de refresco con expiración.
- **Cliente** — Perfil de cliente. Tiene muchas direcciones.
- **Direccion** — Dirección georreferenciada con latitud/longitud, soft delete (`eliminadoEn`).
- **Tecnico** — Perfil de técnico: disponibilidad, ubicación GPS, radio de cobertura, nivel (enum NivelTecnico).
- **CategoriaServicio** — Categorías del catálogo (ej: Jardinería, Plomería).
- **ProductoServicio** — Productos del catálogo: nombre, slug, precioBase, imagen, incluye/noIncluye, soportaCantidad, activo.
- **ProductoServicioCategoria** — Join table N:M entre productos y categorías.
- **ReglaPrecio** — Reglas de precio por producto (tipo: cantidad | boolean_extra).
- **Servicio** — Solicitud: asociada a producto del catálogo, cantidad, opciones (JSON), desglose de precio (precioBase, subtotal, tarifaServicio, total), estados, calificación con comentario y fecha.
- **Imagen** — URLs de imágenes asociadas a servicios.
- **Pago** — Pago 1:1 con servicio, monto, estado, método de pago.
- **Mensaje** — Chat por servicio, con emisor, contenido, leído.

### Relaciones clave
- Usuario → Cliente (1:1, PK compartida) | Tecnico (1:1, PK compartida)
- Cliente → Direcciones (1:N)
- ProductoServicio ↔ CategoriaServicio (N:M via ProductoServicioCategoria)
- ProductoServicio → ReglaPrecio (1:N)
- ProductoServicio → Servicio (1:N)
- Servicio → Imagen (1:N), Pago (1:1), Mensaje (1:N)

El schema completo está en `prisma/schema.prisma`.
