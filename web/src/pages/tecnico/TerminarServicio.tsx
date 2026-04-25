import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { solicitudesApi } from '../../services/api';
import { NavigationButton } from '../../components/common/NavigationButton';
import { ImageUpload } from '../../components/common/ImageUpload';
import { MapPin, CheckCircle, Loader } from 'lucide-react';
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
  tecnico?: { nombre: string; apellido: string };
  cliente?: { nombre: string; apellido: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

export function TerminarServicio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [detalles, setDetalles] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);

  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      const { data } = await solicitudesApi.getById(id!);
      setSolicitud(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const completarServicio = async () => {
    if (detalles.trim().length === 0) {
      toast.error('Ingresa los detalles del servicio');
      return;
    }
    if (detalles.length > 400) {
      toast.error('Máximo 400 caracteres');
      return;
    }
    if (imagenes.length < 1 || imagenes.length > 2) {
      toast.error('Carga entre 1 y 2 imágenes');
      return;
    }

    setGuardando(true);
    try {
      await solicitudesApi.completar(id!, {
        detalles,
        imagenes,
      });
      toast.success('Servicio completado');
      navigate('/tecnico/trabajos');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al completar');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
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
      <NavigationButton to={`/tecnico/solicitud/${id}`} text="Volver al detalle" />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Completar Servicio
        </h1>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            Servicio solicitado
          </h2>
          <p className="text-gray-900">{solicitud.descripcion}</p>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            {solicitud.direccion.direccion}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalles del servicio prestado
            </label>
            <textarea
              rows={4}
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              maxLength={400}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe qué trabajos realizaste..."
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {detalles.length}/400 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos del resultado (mínimo 1, máximo 2)
            </label>
            <ImageUpload
              images={imagenes}
              onChange={setImagenes}
              maxImages={2}
            />
            {imagenes.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {imagenes.length}/2 fotos cargadas
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Link
            to={`/tecnico/solicitud/${id}`}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Volver
          </Link>
          <button
            onClick={completarServicio}
            disabled={guardando}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {guardando ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}