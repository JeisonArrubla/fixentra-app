# Backend Marketplace - Servicios del Hogar

API REST con NestJS, Prisma y PostgreSQL para marketplace de servicios técnicos.

## Requisitos

- Node.js 20+
- PostgreSQL 14+
- npm o yarn

## Instalación

```bash
cd api
npm install
```

## Configuración

1. Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Editar `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/marketplace?schema=public"
JWT_SECRET="tu-secret-super-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret-muy-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

## Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear migraciones
npx prisma migrate dev --name init

# O push directo a la DB
npx prisma db push
```

## Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Login (recibe tokens JWT) |
| POST | /api/auth/refresh | Refrescar access token |
| GET | /api/auth/profile | Perfil del usuario |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/clientes/perfil | Crear perfil cliente |
| GET | /api/clientes/perfil | Ver perfil |
| POST | /api/clientes/direcciones | Crear dirección |
| GET | /api/clientes/direcciones | Listar direcciones |
| PUT | /api/clientes/direcciones/:id | Actualizar |
| DELETE | /api/clientes/direcciones/:id | Eliminar |
| PATCH | /api/clientes/direcciones/:id/principal | Marcar principal |

### Técnicos
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/tecnicos/perfil | Crear perfil técnico |
| GET | /api/tecnicos/perfil | Ver perfil |
| PATCH | /api/tecnicos/ubicacion | Actualizar ubicación |
| PATCH | /api/tecnicos/disponibilidad | Toggle disponibilidad |

### Solicitudes
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/solicitudes | Crear solicitud |
| GET | /api/solicitudes/disponibles | Listar disponibles |
| GET | /api/solicitudes/mis-solicitudes | Mis solicitudes |
| GET | /api/solicitudes/:id | Ver solicitud |
| POST | /api/solicitudes/:id/aceptar | Aceptar solicitud |
| PATCH | /api/solicitudes/:id/terminar | Marcar terminada |

## WebSockets

Namespace: `/solicitudes`

的事件:
- `solicitud:nueva` - Notifica nueva solicitud
- `solicitud:asignada` - Notifica asignación

## Swagger

Documentación disponible en: `http://localhost:3000/api/docs`

## Estructura

```
api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── shared/
│   │   └── prisma.service.ts
│   ├── common/
│   │   ├── guards/
│   │   └── decorators/
│   └── modules/
│       ├── auth/
│       ├── clientes/
│       ├── tecnicos/
│       └── solicitudes/
└── package.json
```