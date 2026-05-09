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
└── modules/
    ├── auth/
    ├── clientes/
    ├── solicitudes/
    ├── tecnicos/
    └── upload/
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
│   │   ├── NavigationButton.tsx
│   │   ├── SubmitButton.tsx
│   │   ├── CancelButton.tsx
│   │   ├── ActionButton.tsx
│   │   ├── Description.tsx
│   │   └── StarRating.tsx
│   └── tecnico/
│       └── TecnicoStats.tsx
├── pages/
│   ├── auth/Login.tsx
│   ├── auth/Register.tsx
│   ├── cliente/
│   │   ├── Dashboard.tsx
│   │   ├── Direcciones.tsx
│   │   ├── Solicitudes.tsx
│   │   ├── SolicitudDetalle.tsx
│   │   ├── NuevaSolicitud.tsx
│   │   └── ConfirmarSolicitud.tsx
│   └── tecnico/
│       ├── Dashboard.tsx
│       ├── MisTrabajos.tsx
│       ├── SolicitudDetalle.tsx
│       ├── TerminarServicio.tsx
│       └── Perfil.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── SolicitudContext.tsx
│   └── ImageViewerContext.tsx
└── services/api.ts
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
/cliente/solicitudes       → Client requests list
/cliente/solicitud/:id     → Client request detail with rating
/cliente/solicitudes/nueva → New request wizard (step 1)
/cliente/solicitudes/nueva/confirmar → New request confirmation (step 2)

/tecnico/dashboard        → Technician dashboard (new requests)
/tecnico/trabajos          → Technician work history
/tecnico/solicitud/:id     → Request detail
/tecnico/solicitud/:id/terminar → Finish service form
/tecnico/perfil            → Technician profile with reputation stats

/dashboard               → Redirects based on user tipo
/                        → Root redirects to appropriate dashboard
```