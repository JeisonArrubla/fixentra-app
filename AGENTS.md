# Fixentra App - Agent Instructions

## Project Overview

Full-stack marketplace app for home services.

- **Backend**: Node.js + NestJS + Prisma + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS

## User Preferences

- **Critical**: Do not make changes without asking first ("no hagas cambios sin preguntar")
- Prefer reusable, scalable components
- Avoid adding features that weren't explicitly requested
- Wait for user to indicate what to do next after completing requested tasks

## Architecture Decisions

### Image Upload System (Strategy Pattern)

The image upload system uses the Strategy Pattern to allow swapping storage providers without changing other code:

```
api/src/modules/upload/
├── interfaces/storage-provider.interface.ts  # Strategy interface
├── providers/local-storage.provider.ts       # Local implementation
├── upload.service.ts
├── upload.controller.ts
└── upload.module.ts
```

### Leaflet for Maps

Leaflet (OpenStreetMap) is used instead of Mapbox - works without API keys, better for development.

### Database

Prisma ORM with PostgreSQL. After adding new models, run:
```bash
prisma db push --force-reset
```

### Image Viewer System

Uses Context + Provider pattern for global image lightbox functionality:

```
web/src/components/common/
├── ImageViewer.tsx        # Context provider
└── ImageWithViewer.tsx    # Wrapper component for images
```

### Env Helpers

Utility functions in `api/src/common/helpers/env.helper.ts` for reading environment variables with strict validation:

- `floatEnv(key)` — Reads and parses a float. Throws error if missing or NaN.
- `stringEnv(key)` — Reads a string. Throws error if empty or missing.

These fail fast at startup instead of using silent defaults.

### Technician Levels System

Technicians have levels (Madera, Bronce, Plata, Oro) configured via environment variables:
- `NIVEL_{NIVEL}_UMBRAL` — Minimum average rating to reach the level
- `NIVEL_{NIVEL}_TIEMPO_ESPERA` — Delay in minutos before new services are assigned to technicians of this level

Configuration lives in `api/src/config/niveles.config.ts` using `floatEnv` helper.

## Critical Fixes Applied

1. **Navbar**: Needs `<Outlet />` to render child routes
2. **Vite proxy**: `/uploads` route configured for development
3. **Login redirect**: Redirects based on user type (cliente/tecnico)
4. **Root route `/`**: Redirects to dashboard based on user tipo (cliente/tecnico)
5. **Root route null safety**: Validates user exists before accessing user.tipo

## Key Files

### Backend
```
api/src/
├── app.module.ts
├── prisma/schema.prisma
├── common/
│   └── helpers/
│       └── env.helper.ts
└── modules/
    ├── auth/
    ├── chat/
    ├── clientes/
    ├── niveles/
    ├── solicitudes/
    ├── tecnicos/
    ├── upload/
    └── usuarios/
```

### Frontend
```
web/src/
├── App.tsx
├── components/
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── ImageViewer.tsx
│   │   ├── ImageWithViewer.tsx
│   │   ├── Modal.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── Chat.tsx
│   │   ├── StarRating.tsx
│   │   ├── Description.tsx
│   │   ├── SubmitButton.tsx
│   │   ├── CancelButton.tsx
│   │   ├── ActionButton.tsx
│   │   ├── NavigationButton.tsx
│   │   ├── PageHeader.tsx
│   │   ├── NavbarLink.tsx
│   │   ├── Logo.tsx
│   │   ├── FormContainer.tsx
│   │   ├── FieldRow.tsx
│   │   └── ButtonContainer.tsx
│   └── tecnico/
│       └── TecnicoStats.tsx
├── pages/
│   ├── auth/Login.tsx
│   ├── auth/Register.tsx
│   ├── cliente/
│   │   ├── Dashboard.tsx
│   │   ├── Direcciones.tsx
│   │   ├── NuevaDireccion.tsx
│   │   ├── Servicios.tsx
│   │   ├── ServicioDetalle.tsx
│   │   ├── NuevoServicio.tsx
│   │   ├── ConfirmarServicio.tsx
│   │   └── CalificarServicio.tsx
│   └── tecnico/
│       ├── Dashboard.tsx
│       ├── ServicioNuevo.tsx
│       ├── ServicioDetalle.tsx
│       ├── MisTrabajos.tsx
│       ├── TerminarServicio.tsx
│       └── Perfil.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ServicioContext.tsx
├── services/api.ts
└── hooks/
```

## Implemented Features

- Authentication (login/register)
- Client: dashboard, addresses management, requests management, request detail with rating
- Technician: dashboard, detail view, work history, finish service, profile with reputation stats
- Image upload with lightbox viewer
- Delete confirmations for addresses and requests
- GPS location picker with auto-detect
- Validation to prevent deleting addresses with active requests
- Reusable button components (NavigationButton, SubmitButton, CancelButton, ActionButton)
- Solicitud flow with context persistence (NuevaSolicitud → ConfirmarSolicitud)
- Confirmation countdown feature for service requests
- Rating system (clients rate technicians)
- Description component to hide descriptive text on mobile
- Bottom navigation bar (mobile only)
- Technician reputation stats (average rating, total ratings, completed services)
- Chat in real time between client and technician (Socket.IO)
- Technician levels system (Madera, Bronce, Plata, Oro) with configurable thresholds
- Service completion with details and multiple images

## UI/UX Design System

### Responsive Design
- **Breakpoint**: `md:` (768px) - tablet and above
- All new views must be responsive starting from 768px
- **Mobile** (< 768px):
  - Bottom navigation bar (`BottomNav.tsx`) - fixed, icon-based
  - No back buttons in list views (use BottomNav for navigation)
  - Content padding: `pb-16` to avoid overlap with bottom nav
- **Tablet/Desktop** (≥ 768px):
  - Top navbar (`Navbar.tsx`) - horizontal links
  - BottomNav hidden (`md:hidden` on BottomNav)
  - Use responsive classes: `hidden md:flex`, `md:hidden`, etc.

### Mobile-First Design
- **Hide descriptive paragraphs on mobile**: Use `Description` component to hide `<p>` tags with secondary descriptions on mobile devices
- Keep mobile views clean and focused on primary actions
- Show descriptive text only on tablet/desktop (`md:` breakpoint)

### Color Scheme
- Primary buttons: `bg-green-600` (green tones)
- Secondary/alternative buttons: `bg-black` or similar
- Icons use `text-icon` custom class
- Avoid blue primary colors

### Button Hierarchy
1. **Primary actions**: `bg-green-600 text-white`
2. **Submit**: `SubmitButton` component (green)
3. **Cancel**: `CancelButton` component (outline/gray)
4. **Generic actions**: `ActionButton` component
5. **Navigation/Back**: Avoid back buttons in main list views; use navigation bars instead

## Lessons Learned

1. Navbar needs `<Outlet />` inside it to render child routes (React Router nested routes)
2. Leaflet works without API keys - better for development than Mapbox
3. Image upload Strategy Pattern allows swapping storage providers without changing other code
4. Prisma database needs reset (`prisma db push --force-reset`) after adding new models
5. Vite proxy needs to be configured for `/uploads` route to serve images in development
6. Always check `user && user.tipo` before accessing user properties in routes
7. Use `Description` component to hide descriptive text on mobile
8. No back buttons in main list views; use BottomNav (mobile) and Navbar (desktop) for navigation
9. All new views must include responsive design from 768px (md breakpoint)
10. Use `floatEnv` helper for reading numeric env vars with strict validation instead of silent defaults
11. Technician levels configuration should live in env vars for easy tuning without code changes

## Behavior Guidelines

- Always ask for clarification before making changes ("no hagas cambios sin preguntar")
- Don't add features not explicitly requested
- After completing a task, stop and wait for user to indicate what to do next
- Use existing code patterns and conventions when implementing new features
- Prefer reusable, scalable components over one-off implementations
- Follow the responsive design strategy (768px breakpoint) and mobile-first approach

## Routes Structure

```
/login                    → Login page (redirects to /dashboard if authenticated)
/register                → Register page (redirects to /dashboard if authenticated)

/cliente/dashboard       → Client dashboard
/cliente/direcciones      → Client addresses management
/cliente/direcciones/nueva → New address with map
/cliente/servicios       → Client services list
/cliente/servicios/nuevo → New service (step 1)
/cliente/servicios/nuevo/confirmar → Confirm service (step 2)
/cliente/servicio/:id     → Service detail with chat and rating
/cliente/servicio/calificar/:id → Rate technician

/tecnico/dashboard        → Technician dashboard (available services)
/tecnico/servicio/nuevo/:id → Accept service
/tecnico/servicio/:id     → Service detail with chat
/tecnico/servicio/:id/terminar → Complete service with details
/tecnico/trabajos          → Work history
/tecnico/perfil            → Technician profile with reputation stats

/dashboard               → Redirects based on user tipo
/                        → Root redirects to appropriate dashboard
```