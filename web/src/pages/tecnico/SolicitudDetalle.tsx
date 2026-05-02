import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { solicitudesApi } from '../../services/api';
import { ImageGridWithViewer, NavigationButton, PageHeader } from '../../components/common';
import { MapPin, User, CheckCircle, Loader, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface SolicitudDetalle {
  id: string;
  descripcion: string;
  estado: 'NUEVA' | 'ASIGNADA' | 'TERMINADA' | 'COMPLETADO';
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
  calificacion?: number | null;
  comentarioCalificacion?: string | null;
  fechaCalificacion?: string | null;
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
      <NavigationButton to="/tecnico/trabajos" text="Volver" />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <PageHeader
          title="Detalles del servicio"
          badge={<span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(solicitud.estado)}`}>{getEstadoLabel(solicitud.estado)}</span>}
        />

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

          {(solicitud.calificacion || solicitud.estado === 'TERMINADA' || solicitud.estado === 'COMPLETADO') && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Calificación recibida</h2>
              {solicitud.calificacion ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        className={star <= solicitud.calificacion! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="ml-2 text-gray-700 font-medium">{solicitud.calificacion}/5</span>
                  </div>
                  {solicitud.comentarioCalificacion && (
                    <p className="text-gray-700 text-sm italic">
                      "{solicitud.comentarioCalificacion}"
                    </p>
                  )}
                  {solicitud.fechaCalificacion && (
                    <p className="text-xs text-gray-500">
                      Calificado el {new Date(solicitud.fechaCalificacion).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  Pendiente de calificación por el cliente
                </p>
              )}
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
                Terminar servicio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}