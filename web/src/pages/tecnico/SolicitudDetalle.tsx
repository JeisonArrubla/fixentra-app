import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { solicitudesApi } from '../../services/api';
import { ImageGridWithViewer, NavigationButton } from '../../components/common';
import { MapPin, User, CheckCircle, Loader, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface SolicitudDetalle {
  id: string;
  descripcion: string;
  estado: 'NUEVA' | 'ASIGNADA' | 'TERMINADA';
  direccion: {
    direccion: string;
    latitud: number;
    longitud: number;
  };
  cliente: {
    nombre: string;
    apellido: string;
    correo: string;
  };
  tecnico?: {
    nombre: string;
    apellido: string;
  };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

export function SolicitudDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [aceptando, setAceptando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarSolicitud();
    }
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      const { data } = await solicitudesApi.getById(id!);
      setSolicitud(data);
    } catch (err) {
      toast.error('Error al cargar la solicitud');
      navigate('/tecnico/dashboard');
    } finally {
      setCargando(false);
    }
  };

  const aceptarSolicitud = async () => {
    if (!id) return;
    setAceptando(true);
    try {
      await solicitudesApi.aceptar(id);
      toast.success('Solicitud aceptada');
      navigate('/tecnico/trabajos');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al aceptar la solicitud');
    } finally {
      setAceptando(false);
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

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">Solicitud no encontrada</p>
        <NavigationButton to="/tecnico/dashboard" text="Volver" className="mt-4" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <NavigationButton to="/tecnico/dashboard" text="Volver a solicitudes" />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Solicitud</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(solicitud.estado)}`}>
            {getEstadoLabel(solicitud.estado)}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
            <p className="text-gray-700">{solicitud.descripcion}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ubicación</h2>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-2" />
              <p className="text-gray-700">{solicitud.direccion.direccion}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Cliente</h2>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-gray-700">
                  {solicitud.cliente.nombre} {solicitud.cliente.apellido}
                </p>
                <p className="text-sm text-gray-500">{solicitud.cliente.correo}</p>
              </div>
            </div>
          </div>

          {solicitud.imagenes && solicitud.imagenes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Fotos</h2>
              <ImageGridWithViewer
                images={solicitud.imagenes}
                thumbnailClassName="h-24 w-24 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            Creada: {new Date(solicitud.createdAt).toLocaleString()}
          </div>

          {solicitud.estado === 'NUEVA' && (
            <div className="pt-4 border-t">
              <button
                onClick={aceptarSolicitud}
                disabled={aceptando}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {aceptando ? (
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                {aceptando ? 'Aceptando...' : 'Aceptar Solicitud'}
              </button>
            </div>
          )}

          {solicitud.estado === 'ASIGNADA' && (
            <div className="pt-4 border-t">
              <Link
                to={`/tecnico/solicitud/${id}/terminar`}
                className="w-full flex items-center justify-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Terminar Servicio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}