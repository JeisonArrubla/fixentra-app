# Frontend - Fixentra Marketplace

Frontend React + Vite para marketplace de servicios del hogar.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
cd web
npm install
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

## Estructura

```
web/
├── src/
│   ├── components/
│   │   ├── auth/       # Componentes de autenticación
│   │   ├── cliente/    # Componentes de cliente
│   │   ├── tecnico/    # Componentes de técnico
│   │   └── common/     # Componentes compartidos
│   ├── pages/
│   │   ├── auth/      # Login, Register
│   │   ├── cliente/   # Dashboard, Direcciones, Solicitudes
│   │   └── tecnico/    # Dashboard, Mis Trabajos
│   ├── services/      # API calls
│   ├── contexts/      # Auth context
│   └── App.tsx        # Principal
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Login de usuario |
| `/register` | Registro de usuario |
| `/cliente/dashboard` | Dashboard cliente |
| `/cliente/direcciones` | Gestión de direcciones |
| `/cliente/solicitudes` | Crear/ver solicitudes |
| `/tecnico/dashboard` | Dashboard técnico |
| `/tecnico/trabajos` | Mis trabajos |

## Conexión con Backend

El proyecto usa proxy para conectar con el backend:
- API: `http://localhost:3000/api`
- WebSocket: `ws://localhost:3000`

Para desarrollo, el backend debe estar corriendo en puerto 3000.

## Características

- Autenticación JWT con refresh token
- Roles separados (cliente/técnico)
- Gestión de direcciones con geolocalización
- Crear solicitudes de servicio
- Aceptar/terminar solicitudes
- Notificaciones en tiempo real (próximamente)