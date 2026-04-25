import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tecnicosApi, solicitudesApi } from '../../services/api';
import { MapPin, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Solicitud {
  id: string;
  descripcion: string;
  estado: string;
  direccion: { direccion: string; latitud: number; longitud: number };
  cliente: { nombre: string; apellido: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

export function TecnicoDashboard() {
  const { user } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [disponibilidad, setDisponibilidad] = useState(true);

  useEffect(() => {
    if (user !== null) {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.esTecnico) {
      cargarSolicitudes();
    }
  }, [user]);

  const cargarSolicitudes = async () => {
    try {
      const { data } = await solicitudesApi.getTodasNuevas();
      setSolicitudes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoSolicitudes(false);
    }
  };

  const toggleDisponibilidad = async () => {
    try {
      await tecnicosApi.toggleDisponibilidad(!disponibilidad);
      setDisponibilidad(!disponibilidad);
      toast.success(!disponibilidad ? 'Te has puesto disponible' : 'Te has puesto en offline');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar disponibilidad');
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user?.esTecnico) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">
          Acceso no autorizado. Esta sección es para técnicos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Bienvenido, {user?.nombre}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tu Estado</h3>
            <p className="text-gray-600">Estás disponible para recibir solicitudes</p>
          </div>
          <button
            onClick={toggleDisponibilidad}
            className={`px-4 py-2 rounded-md ${
              disponibilidad
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center">
              {disponibilidad ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" /> Disponible
                </>
              ) : (
                <>
                  <Loader className="h-4 w-4 mr-2" /> No Disponible
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/tecnico/trabajos"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mis Trabajos</h3>
              <p className="text-gray-600">Historial de servicios realizados</p>
            </div>
            <ArrowRight className="h-8 w-8 text-primary-600" />
          </div>
        </Link>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Solicitudes Nuevas
        </h3>
        
        {cargandoSolicitudes ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : solicitudes.length === 0 ? (
          <p className="text-gray-600 py-4">No hay solicitudes nuevas</p>
        ) : (
          <div className="space-y-3">
            {solicitudes.map((sol) => (
              <Link
                key={sol.id}
                to={`/tecnico/solicitud/${sol.id}`}
                className="block bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-lg p-4 hover:from-green-100 hover:to-green-50 hover:border-green-400 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">{sol.descripcion}</p>
                    <div className="flex items-center text-sm text-green-700 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {sol.direccion.direccion}
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Cliente: {sol.cliente.nombre} {sol.cliente.apellido}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {new Date(sol.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}