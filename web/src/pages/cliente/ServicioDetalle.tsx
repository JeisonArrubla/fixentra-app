import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { NavigationButton } from '../../components/common/NavigationButton';
import { StarRating } from '../../components/common/StarRating';
import { ImageWithViewer } from '../../components/common/ImageWithViewer';
import { Chat } from '../../components/common/Chat';
import { PageHeader, FieldRow } from '../../components/common';
import { FormContainer, ButtonContainer } from '../../components/common';
import { Star, Loader, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const [servicio, setServicio] = useState<ServicioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [calificando, setCalificando] = useState(false);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [chatAbierto, setChatAbierto] = useState(false);

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
      <PageHeader
        title="Detalles del servicio"
      />

      {(servicio.estado === 'ASIGNADO' || servicio.estado === 'TERMINADO' || servicio.estado === 'CERRADO') && (
        <button
          onClick={() => setChatAbierto(true)}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors z-[100]"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      <FormContainer>
        <div className="space-y-4">

          <FieldRow
            label="Estado"
            value={servicio.estado}
          />

          <FieldRow
            label="Descripción"
            value={servicio.descripcion}
          />

          <FieldRow
            label="Fecha de la solicitud"
            value={new Date(servicio.createdAt).toLocaleString()}
          />

          <FieldRow
            label="Dirección"
            value={servicio.direccion.direccion}
          />

          {servicio.tecnico && (
            <FieldRow
              label="Técnico asignado"
              value={`${servicio.tecnico.nombre} ${servicio.tecnico.apellido}`}
            />
          )}

          {servicio.detallesCompletado && (
            <FieldRow
              label="Detalles del servicio realizado"
              value={servicio.detallesCompletado}
            />
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
            <div className="pt-6 mt-6">
              <FieldRow
                label="Calificación del servicio"
                value={servicio.detallesCompletado}
              />

              {servicio.calificacion ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <StarRating value={servicio.calificacion} readonly size={22} />
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
        <ButtonContainer>
          <NavigationButton to="/cliente/servicios" text="Volver a mis servicios" />
        </ButtonContainer>
      </FormContainer>

      <Chat
        servicioId={id!}
        usuarioId={user?.id || ''}
        isOpen={chatAbierto}
        onClose={() => setChatAbierto(false)}
      />
    </div>
  );
}
