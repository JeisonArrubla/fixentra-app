import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { MapPin, Clock, Loader } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

interface Servicio {
  id: string;
  descripcion: string;
  estado: 'NUEVO' | 'ASIGNADO' | 'TERMINADO' | 'CERRADO';
  direccion: { direccion: string; latitud: number; longitud: number };
  cliente: { nombre: string; apellido: string; correo: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

export function TecnicoMisTrabajos() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data } = await serviciosApi.getMisServicios('tecnico');
      setServicios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'NUEVO':
        return 'bg-blue-100 text-blue-800';
      case 'ASIGNADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINADO':
        return 'bg-green-100 text-green-800';
      case 'CERRADO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'NUEVO':
        return 'Nuevo';
      case 'ASIGNADO':
        return 'En proceso';
      case 'TERMINADO':
        return 'Terminado';
      case 'CERRADO':
        return 'Cerrado';
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
      <PageHeader title="Mis servicios" />

      {servicios.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No tienes trabajos asignados</p>
          <p className="text-sm">
            Acepta servicios desde el dashboard de técnico
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {servicios.map((serv) => (
            <Link
              key={serv.id}
              to={`/tecnico/servicio/${serv.id}`}
              className="block bg-white p-4 rounded-lg shadow-sm border hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs rounded ${getEstadoColor(
                        serv.estado
                      )}`}
                    >
                      {getEstadoLabel(serv.estado)}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{serv.descripcion}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {serv.direccion.direccion}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: {serv.cliente.nombre} {serv.cliente.apellido}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">
                    {new Date(serv.createdAt).toLocaleDateString()}
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
