import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { NavigationButton } from '../../components/common/NavigationButton';
import { ImageWithViewer } from '../../components/common/ImageWithViewer';
import { Chat } from '../../components/common/Chat';
import { PageHeader, FieldRow } from '../../components/common';
import { FormContainer, ButtonContainer } from '../../components/common';
import { Loader, MessageCircle } from 'lucide-react';
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
  createdAt: string;
}

export function ServicioDetalle() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [servicio, setServicio] = useState<ServicioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [chatAbierto, setChatAbierto] = useState(false);

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
        </div>

        {(servicio.estado === 'TERMINADO') && (
          <ButtonContainer>
            <NavigationButton to={`/cliente/servicio/calificar/${id}`} text="Calificar servicio" />
          </ButtonContainer>
        )}

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
