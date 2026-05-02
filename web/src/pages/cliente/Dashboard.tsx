import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, ArrowRight } from 'lucide-react';
import { Description } from '../../components/common/Description';
import { PageHeader } from '../../components/common/PageHeader';

export function ClienteDashboard() {
  const { user } = useAuth();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user !== null) {
      setCargando(false);
    }
  }, [user]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!user?.esCliente) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">
          Acceso no autorizado. Esta sección es para clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <PageHeader title={`Te damos la bienvenida, ${user?.nombre}`} />

      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ¿Necesitas un técnico?
        </h3>
        <Description>
          Crea una nueva solicitud de servicio y técnicos cercanos te contactarán.
        </Description>
        <Link
          to="/cliente/solicitudes/nueva"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Nueva solicitud
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/cliente/direcciones"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mis direcciones</h3>
              <Description>Gestiona dónde recibirás los servicios</Description>
            </div>
            <MapPin className="h-8 w-8 text-icon" />
          </div>
        </Link>

        <Link
          to="/cliente/solicitudes"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mis solicitudes</h3>
              <Description>Historial de servicios solicitados</Description>
            </div>
            <ArrowRight className="h-8 w-8 text-icon" />
          </div>
        </Link>
      </div>
    </div>
  );
}