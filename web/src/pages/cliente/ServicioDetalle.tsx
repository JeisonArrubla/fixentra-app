import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { NavigationButton } from '../../components/common/NavigationButton';
import { StarRating } from '../../components/common/StarRating';
import { ImageWithViewer } from '../../components/common/ImageWithViewer';
import { PageHeader, FieldRow } from '../../components/common';
import { Star, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServicioDetalle {
  id: string;
  descripcion: string;
  estado: 'NUEVO' | 'ASIGNADO' | 'TERMINADO' | 'CERRADO';
  direccion: {
    direccion: string;
    latitud: number;
    longitud: number;
  };
  cliente?: { nombre: string; apellido: string; correo: string };
  tecnico?: { nombre: string; apellido: string; correo: string };
  imagenes?: { id: string; url: string }[];
  detallesCompletado?: string;
  calificacion?: number | null;
  comentarioCalificacion?: string | null;
  fechaCalificacion?: string | null;
  createdAt: string;
}

export function ServicioDetalle() {
  const { id } = useParams<{ id: string }>();
  const [servicio, setServicio] = useState<ServicioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [calificando, setCalificando] = useState(false);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    cargarServicio();
  }, [id]);

  const cargarServicio = async () => {
    try {
      const { data } = await serviciosApi.getById(id!);
      setServicio(data);
      if (data.calificacion) {
        setRating(data.calificacion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const enviarCalificacion = async () => {
    if (rating === 0) {
      toast.error('Selecciona una calificación');
      return;
    }

    setCalificando(true);
    try {
      await serviciosApi.calificar(id!, {
        calificacion: rating,
        comentario: comentario.trim() || undefined,
      });
      toast.success('¡Gracias por calificar!');
      cargarServicio();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al calificar');
    } finally {
      setCalificando(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { text: string; class: string }> = {
      'NUEVO': { text: 'Nuevo', class: 'bg-blue-100 text-blue-800' },
      'ASIGNADO': { text: 'Asignado', class: 'bg-yellow-100 text-yellow-800' },
      'TERMINADO': { text: 'Terminado', class: 'bg-green-100 text-green-800' },
      'CERRADO': { text: 'Cerrado', class: 'bg-green-100 text-green-900' },
    };
    const info = estados[estado] || { text: estado, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.class}`}>
        {info.text}
      </span>
    );
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">Servicio no encontrado</p>
        <NavigationButton to="/cliente/servicios" text="Volver" className="mt-4" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <NavigationButton to="/cliente/servicios" text="Volver a mis servicios" />

      <div className="bg-white rounded-lg shadow-sm border p-6 mt-4">
        <PageHeader
          title="Detalles del servicio"
          badge={getEstadoBadge(servicio.estado)}
        />

        <div className="space-y-4">
          <FieldRow label="Servicio solicitado">
            <p className="text-gray-900">{servicio.descripcion}</p>
            <p className="text-sm text-gray-500">{new Date(servicio.createdAt).toLocaleString()}</p>
          </FieldRow>

          <FieldRow
            label="Ubicación"
            value={servicio.direccion.direccion}
          />

          {servicio.tecnico && (
            <FieldRow
              label="Técnico asignado"
              value={`${servicio.tecnico.nombre} ${servicio.tecnico.apellido}`}
            />
          )}

          {servicio.detallesCompletado && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Detalles del servicio realizado</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{servicio.detallesCompletado}</p>
            </div>
          )}

          {servicio.imagenes && servicio.imagenes.length > 0 && (
            <FieldRow label="Fotos del resultado">
              <div className="grid grid-cols-2 gap-2">
                {servicio.imagenes.map((img) => (
                  <ImageWithViewer key={img.id} src={img.url} alt="Foto del servicio" />
                ))}
              </div>
            </FieldRow>
          )}

          {(servicio.estado === 'CERRADO' || servicio.estado === 'TERMINADO') && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Calificación del servicio</h2>

              {servicio.calificacion ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <StarRating value={servicio.calificacion} readonly size={28} />
                    <span className="text-gray-700 font-medium">{servicio.calificacion}/5</span>
                  </div>
                  {servicio.comentarioCalificacion && (
                    <p className="text-gray-600 text-sm italic">
                      "{servicio.comentarioCalificacion}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Calificado el {new Date(servicio.fechaCalificacion!).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">¿Cómo calificarías el servicio recibido?</p>
                  <StarRating value={rating} onChange={setRating} size={36} />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Escribe tu opinión sobre el servicio..."
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {comentario.length}/200 caracteres
                    </p>
                  </div>

                  <button
                    onClick={enviarCalificacion}
                    disabled={calificando || rating === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {calificando ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Enviar calificación
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
