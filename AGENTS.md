# Fixentra App - Agent Instructions

## Project Overview

Full-stack marketplace app for home services (like Uber for technicians).

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

## Critical Fixes Applied

1. **Navbar**: Needs `<Outlet />` to render child routes
2. **Vite proxy**: `/uploads` route configured for development
3. **Login redirect**: Redirects based on user type (cliente/tecnico)

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
    └── upload/
```

### Frontend
```
web/src/
├── components/common/
│   ├── Navbar.tsx
│   ├── LocationPicker.tsx
│   ├── ImageUpload.tsx
│   ├── ImageViewer.tsx
│   ├── ImageWithViewer.tsx
│   ├── Modal.tsx
│   └── ConfirmModal.tsx
├── pages/
│   ├── auth/Login.tsx
│   ├── auth/Register.tsx
│   ├── cliente/Dashboard.tsx
│   ├── cliente/Direcciones.tsx
│   ├── cliente/Solicitudes.tsx
│   ├── tecnico/Dashboard.tsx
│   ├── tecnico/MisTrabajos.tsx
│   └── tecnico/SolicitudDetalle.tsx
├── contexts/AuthContext.tsx
├── services/api.ts
└── App.tsx
```

## Implemented Features

- Authentication (login/register)
- Client: dashboard, addresses management, requests management
- Technician: dashboard showing new requests, detail view, work history
- Image upload with lightbox viewer
- Delete confirmations for addresses and requests
- GPS location picker with auto-detect
- Validation to prevent deleting addresses with active requests

## Lessons Learned

1. Navbar needs `<Outlet />` inside it to render child routes (React Router nested routes)
2. Leaflet works without API keys - better for development than Mapbox
3. Image upload Strategy Pattern allows swapping storage providers without changing other code
4. Prisma database needs reset (`prisma db push --force-reset`) after adding new models
5. Vite proxy needs to be configured for `/uploads` route to serve images in development

## Behavior Guidelines

- Always ask for clarification before making changes ("no hagas cambios sin preguntar")
- Don't add features not explicitly requested
- After completing a task, stop and wait for user to indicate what to do next
- Use existing code patterns and conventions when implementing new features
- Prefer reusable, scalable components over one-off implementations