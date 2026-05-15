# Fixentra - Marketplace de Servicios del Hogar

Plataforma marketplace para servicios técnicos del hogar.

## Tech Stack

- **Backend**: Node.js + NestJS + Prisma + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS
- **Tiempo Real**: Socket.IO (chat)
- **Mapas**: Leaflet (OpenStreetMap)

## Características

- Autenticación JWT con refresh token
- Roles separados: Cliente y Técnico
- Sistema de pedidos/servicios con estados (NUEVO → ASIGNADO → TERMINADO → CERRADO)
- Gestión de direcciones con geolocalización (Leaflet)
- Subida de imágenes con lightbox viewer
- Chat en tiempo real por servicio
- Calificación de servicios (1-5 estrellas)
- Dashboard personalizado por rol
- Niveles de técnico (Madera, Bronce, Plata, Oro)

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
│   │   └── schema.prisma   # Modelos de DB (Usuario, Cliente, Tecnico, Servicio, etc.)
│   └── src/
│       ├── modules/
│       │   ├── auth/       # Autenticación JWT
│       │   ├── chat/       # Chat en tiempo real (Socket.IO)
│       │   ├── clientes/   # Gestión clientes y direcciones
│       │   ├── niveles/    # Lógica de niveles de técnico
│       │   ├── solicitudes/ # Servicios (CRUD, estados)
│       │   ├── tecnicos/   # Perfiles y disponibilidad
│       │   ├── upload/     # Subida de imágenes (Strategy Pattern)
│       │   └── usuarios/   # Gestión de usuarios
│       └── common/
│           ├── guards/     # Guards de autenticación y roles
│           ├── decorators/ # Decoradores personalizados
│           ├── filters/    # Filtros de excepciones
│           ├── interceptors/ # Interceptores
│           ├── helpers/    # Utilidades (floatEnv, stringEnv)
│           └── validators/ # Validadores personalizados
├── web/                    # Frontend React
│   └── src/
│       ├── components/
│       │   ├── common/     # Componentes reutilizables
│       │   ├── auth/       # Componentes de autenticación
│       │   ├── cliente/    # Componentes específicos de cliente
│       │   └── tecnico/    # Componentes específicos de técnico
│       ├── pages/
│       │   ├── auth/       # Login, Register
│       │   ├── cliente/    # Dashboard, Direcciones, Servicios
│       │   └── tecnico/    # Dashboard, Trabajos, Perfil
│       ├── contexts/       # AuthContext, ServicioContext
│       ├── hooks/          # Custom hooks
│       ├── services/       # API calls (Axios)
│       └── utils/          # Utilidades
├── infra/                  # Infraestructura AWS (Terraform)
│   ├── main.tf             # VPC, EC2, RDS, S3, IAM, Security Groups
│   ├── variables.tf        # Variables de Terraform
│   ├── outputs.tf          # Outputs (IP pública, RDS endpoint, bucket)
│   ├── ec2-user-data.sh.tpl # Bootstrap del servidor
│   └── README.md           # Instrucciones de deploy
├── AGENTS.md               # Instrucciones del agente
```

## API Endpoints

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/register | Registro usuario |
| POST | /auth/login | Login (JWT) |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Logout |
| GET | /auth/profile | Perfil usuario |

### Clientes (`/api/clientes`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /clientes/perfil | Ver perfil |
| POST | /clientes/direcciones | Crear dirección |
| GET | /clientes/direcciones | Listar direcciones |
| PUT | /clientes/direcciones/:id | Actualizar dirección |
| DELETE | /clientes/direcciones/:id | Eliminar dirección |
| PATCH | /clientes/direcciones/:id/principal | Marcar como principal |

### Técnicos (`/api/tecnicos`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /tecnicos/perfil | Crear perfil |
| GET | /tecnicos/perfil | Ver perfil con estadísticas |
| PATCH | /tecnicos/ubicacion | Actualizar ubicación |
| PATCH | /tecnicos/disponibilidad | Toggle disponibilidad |

### Servicios (`/api/servicios`)
| Método | Endpoint | Rol | Descripción |
|--------|----------|-----|-------------|
| POST | /servicios | cliente | Crear servicio |
| GET | /servicios/disponibles | tecnico | Listar disponibles (geolocalización) |
| GET | /servicios/todas | tecnico | Listar todas las nuevas |
| GET | /servicios/mis-servicios | ambos | Mis servicios (query: tipo=cliente\|tecnico) |
| GET | /servicios/:id | ambos | Detalle del servicio |
| POST | /servicios/:id/aceptar | tecnico | Aceptar servicio |
| PATCH | /servicios/:id/terminar | tecnico | Marcar como terminado |
| PATCH | /servicios/:id/completar | tecnico | Completar con detalles e imágenes |
| PATCH | /servicios/:id/calificar | cliente | Calificar servicio (1-5) |
| DELETE | /servicios/:id | cliente | Eliminar servicio (solo estado NUEVO) |

### Chat (`/api/chat`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /chat/:servicioId/mensajes | Obtener mensajes |
| POST | /chat/:servicioId/mensajes | Enviar mensaje |
| POST | /chat/:servicioId/mensajes/leidos | Marcar como leídos |

### Upload (`/api/upload`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /upload/image | Subir una imagen |
| POST | /upload/images | Subir múltiples imágenes (máx 2) |

## Rutas Frontend

| Ruta | Descripción |
|------|-------------|
| /login | Inicio de sesión |
| /register | Registro |
| /dashboard | Redirección según rol |
| /cliente/dashboard | Dashboard cliente |
| /cliente/direcciones | Gestión direcciones |
| /cliente/direcciones/nueva | Nueva dirección |
| /cliente/servicios | Mis servicios |
| /cliente/servicios/nuevo | Nuevo servicio (paso 1) |
| /cliente/servicios/nuevo/confirmar | Confirmar servicio (paso 2) |
| /cliente/servicio/:id | Detalle servicio |
| /cliente/servicio/calificar/:id | Calificar servicio |
| /tecnico/dashboard | Nuevos servicios disponibles |
| /tecnico/servicio/nuevo/:id | Aceptar servicio |
| /tecnico/servicio/:id | Detalle servicio |
| /tecnico/servicio/:id/terminar | Completar servicio |
| /tecnico/trabajos | Historial de trabajos |
| /tecnico/perfil | Perfil con estadísticas |

## Decisiones de Arquitectura

### Strategy Pattern para Imágenes

El sistema de upload usa Strategy Pattern para permitir cambiar proveedores de almacenamiento sin modificar el código:

```
api/src/modules/upload/
├── interfaces/storage-provider.interface.ts  // Interfaz estrategia
├── providers/local-storage.provider.ts       // Implementación local
├── upload.service.ts
├── upload.controller.ts
└── upload.module.ts
```

### Leaflet para Mapas

Se usa Leaflet (OpenStreetMap) en lugar de Mapbox - funciona sin API keys, ideal para desarrollo.

### Chat en Tiempo Real

Socket.IO implementado en el módulo chat para mensajería en tiempo real entre cliente y técnico.

### Env Helpers (Fail-fast)

Funciones utilitarias en `common/helpers/env.helper.ts` para leer variables de entorno con validación estricta:

- `floatEnv(key)` — Lee y parsea un número decimal. Lanza error si falta o no es válido.
- `stringEnv(key)` — Lee un string. Lanza error si está vacío o no existe.

Estas funciones fallan al arrancar en lugar de usar defaults silenciosos.

### Niveles de Técnico

Los niveles (Madera, Bronce, Plata, Oro) se configuran desde variables de entorno (`NIVEL_{NIVEL}_UMBRAL`, `NIVEL_{NIVEL}_TIEMPO_ESPERA`). El umbral define el promedio de calificación mínimo para alcanzar el nivel, y el tiempo de espera retrasa la asignación de servicios nuevos según el nivel.

## Deploy en AWS (Terraform)

La infraestructura se define como código en `infra/` usando Terraform:

- **EC2** (t3.micro) — Ubuntu 24.04 + Node.js 22 + Nginx + PM2
- **RDS** (db.t3.micro) — PostgreSQL 16
- **S3** — Bucket para imágenes (listo para usar cuando se implemente S3StorageProvider)
- **VPC** — Red aislada con subnets públicas
- **Elastic IP** — IP pública fija para acceder a la app

### Desplegar

```bash
cd infra
terraform init
terraform apply
```

### Acceder

```bash
open "http://$(terraform output -raw ec2_public_ip)"
```

### Destruir

```bash
terraform destroy
```

> **Nota**: Sin dominio propio. Para SSL/HTTPS, agregar un dominio y Certbot.

## Modelo de Datos

- **Usuario**: Registro base con documento, correo y contraseña
- **Cliente**: Perfil de cliente vinculado a un usuario
- **Tecnico**: Perfil de técnico con disponibilidad, ubicación, nivel y radio de cobertura
- **Direccion**: Direcciones georreferenciadas asociadas a un cliente
- **Servicio**: Solicitud de servicio con estados y calificación
- **Imagen**: Imágenes asociadas a servicios
- **Pago**: Información de pago por servicio
- **Mensaje**: Chat entre cliente y técnico por servicio
- **RefreshToken**: Tokens de refresco JWT
- **NivelTecnico**: Enum con niveles Madera, Bronce, Plata, Oro (configurable por env)
