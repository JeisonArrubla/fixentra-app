import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudesApi } from '../../services/api';
import { NavigationButton } from '../../components/common/NavigationButton';
import { MapPin, Clock, Loader, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

interface Solicitud {
  id: string;
  descripcion: string;
  estado: 'NUEVA' | 'ASIGNADA' | 'TERMINADA';
  direccion: { direccion: string; latitud: number; longitud: number };
  tecnico?: { nombre: string; apellido: string };
  cliente?: { nombre: string; apellido: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

export function ClienteSolicitudes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [solicitudAEliminar, setSolicitudAEliminar] = useState<Solicitud | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const solsRes = await solicitudesApi.getMisSolicitudes('cliente');
      setSolicitudes(solsRes.data);
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
        return 'Asignada';
      case 'TERMINADA':
        return 'Terminada';
      default:
        return estado;
    }
  };

  const abrirModalEliminar = (sol: Solicitud) => {
    setSolicitudAEliminar(sol);
    setMostrarModalEliminar(true);
  };

  const eliminarSolicitud = async () => {
    if (!solicitudAEliminar) return;
    setEliminando(true);
    try {
      await solicitudesApi.eliminar(solicitudAEliminar.id);
      toast.success('Solicitud eliminada');
      setMostrarModalEliminar(false);
      setSolicitudAEliminar(null);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar solicitud');
    } finally {
      setEliminando(false);
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
      <NavigationButton to="/cliente/dashboard" text="Volver" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light text-gray-900">Mis Solicitudes</h1>
        <button
          onClick={() => navigate('/cliente/solicitudes/nueva')}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Nueva solicitud
        </button>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No tienes solicitudes</p>
          <p className="text-sm">Crea tu primera solicitud de servicio</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="bg-white p-4 rounded-lg shadow-sm border">
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
                  {sol.imagenes && sol.imagenes.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {sol.imagenes.length} foto(s) adjunta(s)
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {sol.direccion.direccion}
                  </div>
                  {sol.tecnico && (
                    <p className="text-sm text-gray-600 mt-1">
                      Técnico: {sol.tecnico.nombre} {sol.tecnico.apellido}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs text-gray-500">
                    {new Date(sol.createdAt).toLocaleDateString()}
                  </span>
                  {sol.estado === 'NUEVA' && (
                    <button
                      onClick={() => abrirModalEliminar(sol)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={mostrarModalEliminar}
        onClose={() => setMostrarModalEliminar(false)}
        onConfirm={eliminarSolicitud}
        title="Cancelar solicitud de servicio"
        message={`¿Eliminar la solicitud?`}
        confirmText="Eliminar"
        loading={eliminando}
      />
    </div>
  );
}