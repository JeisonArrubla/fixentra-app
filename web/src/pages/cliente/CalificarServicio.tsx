import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { StarRating } from '../../components/common/StarRating';
import { PageHeader, FieldRow, FormContainer, ButtonContainer, NavigationButton, SubmitButton } from '../../components/common';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServicioDetalle {
  id: string;
  descripcion: string;
  estado: 'NUEVO' | 'ASIGNADO' | 'TERMINADO' | 'CERRADO';
  direccion: {
    direccion: string;
  };
  tecnico?: { nombre: string; apellido: string };
  createdAt: string;
}

export function CalificarServicio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      navigate(`/cliente/servicio/${id}`);
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
      <PageHeader title="Calificar servicio" />

      <FormContainer>
        <div className="space-y-4">
          <FieldRow label="Estado" value={servicio.estado} />
          
          <FieldRow label="Descripción" value={servicio.descripcion} />

          <FieldRow label="Dirección" value={servicio.direccion.direccion} />

          {servicio.tecnico && (
            <FieldRow
              label="Técnico"
              value={`${servicio.tecnico.nombre} ${servicio.tecnico.apellido}`}
            />
          )}

          <FieldRow label="Fecha solicitud" value={new Date(servicio.createdAt).toLocaleString()} />

          <div className="pt-6">
            <p className="text-gray-600 mb-4">¿Cómo calificarías el servicio recibido?</p>
            <StarRating value={rating} onChange={setRating} size={36} />

            <div className="mt-4">
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
          </div>
        </div>

        <ButtonContainer>
          <NavigationButton to={`/cliente/servicio/${id}`} text="Volver" />
          <SubmitButton
            onClick={enviarCalificacion}
            disabled={calificando || rating === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
          </SubmitButton>
        </ButtonContainer>
      </FormContainer>
    </div>
  );
}
