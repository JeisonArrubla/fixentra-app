# Fixentra - Marketplace de Servicios del Hogar

Plataforma marketplace para servicios técnicos del hogar.

## Tech Stack

- **Backend**: Node.js + NestJS + Prisma + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS

## Características

- Autenticación JWT con refresh token
- Roles separados: Cliente y Técnico
- Sistema de pedidos/solicitudes de servicio
- Gestión de direcciones con geolocalización (Leaflet)
- Subida de imágenes con lightbox viewer
- Dashboard personalizado por rol

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Instalación

```bash
# Backend
cd api
npm install

# Frontend
cd web
npm install
```

## Configuración del Entorno

### Backend

1. Copiar archivo de ejemplo:
```bash
cd api
cp .env.example .env
```

2. Editar `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/fixentra?schema=public"
JWT_SECRET="tu-secret-super-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret-muy-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### Inicializar Base de Datos

```bash
cd api
npx prisma generate
npx prisma db push --force-reset
```

## Ejecución

```bash
# Backend (puerto 3000)
cd api
npm run start:dev

# Frontend (puerto 5173)
cd web
npm run dev
```

## Estructura del Proyecto

```
fixentra-app/
├── api/                    # Backend NestJS
│   ├── prisma/
│   │   └── schema.prisma   # Modelos de DB
│   └── src/
│       ├── modules/
│       │   ├── auth/       # Autenticación
│       │   ├── clientes/   # Gestión clientes
│       │   ├── tecnicos/   # Gestión técnicos
│       │   ├── solicitudes/ # Pedidos
│       │   └── upload/    # Subida imágenes
│       └── common/
│           ├── guards/
│           └── decorators/
├── web/                    # Frontend React
│   └── src/
│       ├── components/
│       │   └── common/    # Componentes reutilizables
│       ├── pages/
│       │   ├── auth/      # Login, Register
│       │   ├── cliente/  # Dashboard, Direcciones, Solicitudes
│       │   └── tecnico/  # Dashboard, Mis Trabajos
│       ├── contexts/      # AuthContext
│       └── services/      # API calls
└── AGENTS.md              # Instrucciones del agente
```

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/auth/register | Registro usuario |
| POST | /api/auth/login | Login (JWT) |
| POST | /api/auth/refresh | Refresh token |
| GET | /api/auth/profile | Perfil usuario |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/clientes/perfil | Crear perfil |
| GET | /api/clientes/perfil | Ver perfil |
| POST | /api/clientes/direcciones | Crear dirección |
| GET | /api/clientes/direcciones | Listar |
| PUT | /api/clientes/direcciones/:id | Actualizar |
| DELETE | /api/clientes/direcciones/:id | Eliminar |

### Técnicos
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/tecnicos/perfil | Crear perfil |
| GET | /api/tecnicos/perfil | Ver perfil |
| PATCH | /api/tecnicos/disponibilidad | Toggle |

### Solicitudes
| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | /api/solicitudes | Crear solicitud |
| GET | /api/solicitudes/disponibles | Listar nuevas |
| GET | /api/solicitudes/mis-solicitudes | Mis pedidos |
| POST | /api/solicitudes/:id/aceptar | Aceptar |
| PATCH | /api/solicitudes/:id/completar | Completar servicio |
| DELETE | /api/solicitudes/:id | Eliminar |

## Rutas Frontend

| Ruta | Descripción |
|------|-------------|
| /login | Inicio de sesión |
| /register | Registro |
| /cliente/dashboard | Dashboard cliente |
| /cliente/direcciones | Gestión direcciones |
| /cliente/solicitudes | Mis solicitudes |
| /tecnico/dashboard | Nuevas solicitudes |
| /tecnico/trabajos | Mis servicios |
| /tecnico/solicitud/:id | Detalle solicitud |
| /tecnico/solicitud/:id/terminar | Completar servicio |

## Decisiones de Arquitectura

### Estrategia Pattern para Imágenes

El sistema de upload usa Strategy Pattern para permitir cambiar proveedores de almacenamiento sin modificar el código:

```typescript
api/src/modules/upload/
├── interfaces/storage-provider.interface.ts  // Interfaz estrategia
├── providers/local-storage.provider.ts        // Implementación local
├── upload.service.ts
├── upload.controller.ts
└── upload.module.ts
```

### Leaflet para Mapas

Se usa Leaflet (OpenStreetMap) en lugar de Mapbox - funciona sin API keys.

## Notas Importantes

1. **Navbar**: Necesita `<Outlet />` para renderizar rutas anidadas
2. **Vite proxy**: Configurado para `/uploads` en desarrollo
3. **Login**: Redirecciona según tipo de usuario
4. **Prisma**: Después de modelos nuevos, ejecutar `npx prisma db push --force-reset`