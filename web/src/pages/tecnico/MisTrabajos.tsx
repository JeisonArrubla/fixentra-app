import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { solicitudesApi } from '../../services/api';
import { MapPin, Clock, Loader } from 'lucide-react';
import { NavigationButton } from '../../components/common';

interface Solicitud {
  id: string;
  descripcion: string;
  estado: 'NUEVA' | 'ASIGNADA' | 'TERMINADA';
  direccion: { direccion: string; latitud: number; longitud: number };
  cliente: { nombre: string; apellido: string; correo: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

export function TecnicoMisTrabajos() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data } = await solicitudesApi.getMisSolicitudes('tecnico');
      setSolicitudes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'bg-blue-100 text-blue-800';
      case 'ASIGNADA':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINADA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'Nueva';
      case 'ASIGNADA':
        return 'En proceso';
      case 'TERMINADA':
        return 'Terminada';
      default:
        return estado;
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <NavigationButton to="/tecnico/dashboard" text="Volver" />
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Mis servicios
      </h1>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No tienes trabajos asignados</p>
          <p className="text-sm">
            Acepta solicitudes desde el dashboard de técnico
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((sol) => (
            <Link
              key={sol.id}
              to={`/tecnico/solicitud/${sol.id}`}
              className="block bg-white p-4 rounded-lg shadow-sm border hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs rounded ${getEstadoColor(
                        sol.estado
                      )}`}
                    >
                      {getEstadoLabel(sol.estado)}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{sol.descripcion}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {sol.direccion.direccion}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: {sol.cliente.nombre} {sol.cliente.apellido}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">
                    {new Date(sol.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}