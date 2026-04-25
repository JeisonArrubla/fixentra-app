import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SolicitudProvider } from './contexts/SolicitudContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ClienteDashboard } from './pages/cliente/Dashboard';
import { ClienteDirecciones } from './pages/cliente/Direcciones';
import { ClienteSolicitudes } from './pages/cliente/Solicitudes';
import { NuevaSolicitud } from './pages/cliente/NuevaSolicitud';
import { ConfirmarSolicitud } from './pages/cliente/ConfirmarSolicitud';
import { TecnicoDashboard } from './pages/tecnico/Dashboard';
import { TecnicoMisTrabajos } from './pages/tecnico/MisTrabajos';
import { SolicitudDetalle } from './pages/tecnico/SolicitudDetalle';
import { TerminarServicio } from './pages/tecnico/TerminarServicio';
import { Navbar } from './components/common/Navbar';
import { PrivateRoute } from './components/common/PrivateRoute';
import { ImageViewerProvider } from './components/common/ImageViewer';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      
      <Route path="/" element={<PrivateRoute />}>
        <Route element={<Navbar />}>
          <Route path="dashboard" element={<Navigate to="/cliente/dashboard" replace />} />
          
          <Route path="cliente/dashboard" element={<ClienteDashboard />} />
          <Route path="cliente/direcciones" element={<ClienteDirecciones />} />
          <Route path="cliente/solicitudes" element={<ClienteSolicitudes />} />
          <Route path="cliente/solicitudes/nueva" element={<NuevaSolicitud />} />
          <Route path="cliente/solicitudes/nueva/confirmar" element={<ConfirmarSolicitud />} />
          
          <Route path="tecnico/dashboard" element={<TecnicoDashboard />} />
          <Route path="tecnico/solicitud/:id" element={<SolicitudDetalle />} />
          <Route path="tecnico/solicitud/:id/terminar" element={<TerminarServicio />} />
          <Route path="tecnico/trabajos" element={<TecnicoMisTrabajos />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SolicitudProvider>
        <ImageViewerProvider>
          <AppRoutes />
        </ImageViewerProvider>
      </SolicitudProvider>
    </AuthProvider>
  );
}