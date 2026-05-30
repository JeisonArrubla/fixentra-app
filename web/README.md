# Fixentra Web - Frontend

Aplicación frontend del marketplace de servicios del hogar construida con React y Vite.

## Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Estilos**: Tailwind CSS 3
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Mapas**: Leaflet
- **Iconos**: Lucide React
- **Notificaciones**: react-hot-toast
- **Tiempo Real**: Socket.IO Client
- **Image Lightbox**: Implementación propia con Context API

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en desarrollo (puerto 5173) |
| `npm run build` | Compilar para producción |
| `npm run lint` | Lint |
| `npm run preview` | Vista previa de build |

## Estructura

```
web/src/
├── main.tsx                     # Entry point
├── App.tsx                      # Router y providers
├── index.css                    # Estilos globales (Tailwind, Leaflet, custom)
├── vite-env.d.ts                # Tipos Vite
├── assets/
│   └── Logo-Fixentra.png        # Logo de la app
├── components/
│   ├── common/                  # Componentes reutilizables
│   │   ├── index.ts             # Barrel exports
│   │   ├── button-config.ts     # Config global de botones (tamaño, radio, etc.)
│   │   ├── Navbar.tsx           # Navegación superior (escritorio)
│   │   ├── BottomNav.tsx        # Navegación inferior (móvil)
│   │   ├── PrivateRoute.tsx     # Ruta protegida
│   │   ├── ImageUpload.tsx      # Subida de imágenes
│   │   ├── ImageViewer.tsx      # Lightbox (Provider + Context)
│   │   ├── ImageWithViewer.tsx  # Imagen con lightbox + grid
│   │   ├── LocationPicker.tsx   # Selector de mapa (Leaflet)
│   │   ├── Modal.tsx            # Modal genérico
│   │   ├── ConfirmModal.tsx     # Modal de confirmación
│   │   ├── Chat.tsx             # Chat en tiempo real
│   │   ├── StarRating.tsx       # Calificación de estrellas
│   │   ├── Description.tsx      # Texto descriptivo (oculto en móvil)
│   │   ├── SubmitButton.tsx     # Botón de envío
│   │   ├── CancelButton.tsx     # Botón de cancelación
│   │   ├── ActionButton.tsx     # Botón de acción
│   │   ├── NavigationButton.tsx # Botón de navegación
│   │   ├── PageHeader.tsx       # Encabezado de página
│   │   ├── FormContainer.tsx    # Contenedor de formulario
│   │   ├── FieldRow.tsx         # Fila de campo
│   │   ├── ButtonContainer.tsx  # Contenedor de botones
│   │   ├── NavbarLink.tsx       # Enlace de navbar
│   │   ├── Logo.tsx             # Componente del logo
│   │   └── PrecioBreakdown.tsx  # Desglose de precio (subtotal, tarifa, total)
│   └── tecnico/
│       └── TecnicoStats.tsx     # Estadísticas de reputación del técnico
├── pages/
│   ├── auth/
│   │   ├── Login.tsx            # Inicio de sesión
│   │   └── Register.tsx         # Registro
│   ├── cliente/
│   │   ├── Dashboard.tsx        # Dashboard cliente
│   │   ├── Direcciones.tsx      # Gestión de direcciones
│   │   ├── NuevaDireccion.tsx   # Nueva dirección con mapa
│   │   ├── Servicios.tsx        # Mis servicios
│   │   ├── ServicioDetalle.tsx  # Detalle con chat y calificación
│   │   ├── ProductoDetalle.tsx  # Detalle de producto del catálogo
│   │   ├── CalcularServicio.tsx # Calculadora de precio del servicio
│   │   ├── ConfirmarServicio.tsx # Confirmar y crear servicio
│   │   └── CalificarServicio.tsx # Calificar técnico
│   └── tecnico/
│       ├── Dashboard.tsx        # Servicios disponibles
│       ├── ServicioNuevo.tsx    # Aceptar servicio
│       ├── ServicioDetalle.tsx  # Detalle con chat
│       ├── MisTrabajos.tsx      # Historial de trabajos
│       ├── TerminarServicio.tsx # Completar servicio
│       └── Perfil.tsx           # Perfil con stats y reputación
├── contexts/
│   ├── AuthContext.tsx           # Contexto de autenticación
│   └── ServicioContext.tsx       # Contexto de nuevo servicio (persiste entre pasos)
├── services/
│   └── api.ts                   # Cliente Axios con interceptores JWT
├── hooks/                       # Custom hooks (vacíos - preparado)
└── utils/                       # Utilidades (vacíos - preparado)
```

## Diseño Responsive

- **Breakpoint**: `md:` (768px) - tablet y escritorio
- **Mobile** (< 768px): BottomNav fijo, sin back buttons en listas
- **Tablet/Desktop** (≥ 768px): Navbar superior, BottomNav oculto

## Proxy de Desarrollo

Vite proxy configurado en `vite.config.ts` para rutas:
- `/api` → `http://localhost:3000/api`
- `/uploads` → `http://localhost:3000/uploads`
- WebSocket → `ws://localhost:3000`
