# Fixentra API - Backend

API RESTful para el marketplace de servicios del hogar construida con NestJS.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Base de Datos**: PostgreSQL 14+
- **Autenticación**: Passport (JWT + Local)
- **WebSockets**: Socket.IO
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger

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
├── main.ts                 # Entry point
├── app.module.ts           # Módulo raíz
├── config/                 # Configuración (entorno, validación)
├── common/                 # Código compartido
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── decorators/         # Decoradores (Roles, CurrentUser, etc.)
│   ├── filters/            # Filtros de excepciones
│   ├── interceptors/       # Interceptores
│   └── validators/         # Validadores personalizados
└── modules/                # Módulos funcionales
    ├── auth/               # Autenticación JWT
    ├── chat/               # Chat en tiempo real (Socket.IO gateway + REST)
    ├── clientes/           # Gestión de clientes y direcciones
    ├── niveles/            # Lógica de niveles y reputación
    ├── solicitudes/        # Servicios (CRUD, estados, geolocalización)
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
```

## Endpoints Principales

Prefix: `/api` (configurado en `main.ts`)

### Auth
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Obtener perfil

### Clientes
- `GET /clientes/perfil` - Perfil del cliente
- CRUD de direcciones (`/clientes/direcciones`)
- `PATCH /clientes/direcciones/:id/principal` - Dirección principal

### Técnicos
- `POST /tecnicos/perfil` - Crear perfil
- `GET /tecnicos/perfil` - Perfil con stats
- `PATCH /tecnicos/ubicacion` - Actualizar ubicación
- `PATCH /tecnicos/disponibilidad` - Toggle disponibilidad

### Servicios
- CRUD de servicios con filtros por estado
- Aceptar, terminar, completar, calificar
- Geolocalización para búsqueda de servicios disponibles

### Chat
- Mensajería REST + Socket.IO en tiempo real

### Upload
- Subida de imágenes (single y múltiple)

## Modelos (Prisma)

Usuario → Cliente | Tecnico → Direcciones → Servicio → Imagen, Pago, Mensaje

El schema completo está en `prisma/schema.prisma`.
