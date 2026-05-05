import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { ImageGridWithViewer, PageHeader, FieldRow, NavigationButton, FormContainer, ButtonContainer } from '../../components/common';
import { Loader } from 'lucide-react';
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

export function ServicioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<ServicioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id) {
      cargarServicio();
    }
  }, [id]);

  const cargarServicio = async () => {
    try {
      const { data } = await serviciosApi.getById(id!);
      setServicio(data);
    } catch (err) {
      toast.error('Error al cargar el servicio');
      navigate('/tecnico/dashboard');
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
      <div className="py-8 px-4 text-center">
        <p className="text-gray-600 mb-4">Servicio no encontrado</p>
        <NavigationButton to="/tecnico/dashboard" text="Volver" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <PageHeader title="Detalles del servicio" />

      <FormContainer className="space-y-4">
          <FieldRow label="Estado" value={servicio.estado} />

          <FieldRow label="Cliente" value={`${servicio.cliente.nombre} ${servicio.cliente.apellido}`} />

          <FieldRow label="Descripción" value={servicio.descripcion} />

          <FieldRow label="Ubicación" value={servicio.direccion.direccion} />

          <FieldRow label="Fecha solicitud" value={new Date(servicio.createdAt).toLocaleString()} />

          {servicio.imagenes && servicio.imagenes.length > 0 && (
            <FieldRow label="Fotos">
              <ImageGridWithViewer
                images={servicio.imagenes}
                thumbnailClassName="h-24 w-24 object-cover rounded-lg"
              />
            </FieldRow>
          )}

          {servicio.estado === 'ASIGNADO' && (
            <ButtonContainer>
              <NavigationButton
                to="/tecnico/trabajos"
                text="Volver"
              >
              </NavigationButton>
              <NavigationButton
                to={`/tecnico/servicio/${id}/terminar`}
                text="Terminar"
                className='bg-green-900 border-green-900 hover:text-white hover:!bg-green-700 hover:border hover:!border-green-700'
              >
              </NavigationButton>
            </ButtonContainer>
          )}
      </FormContainer>
    </div>
  );
}
