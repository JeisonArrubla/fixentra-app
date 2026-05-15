import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { ImageGridWithViewer, PageHeader, FieldRow, Modal, FormContainer, SubmitButton, ButtonContainer, NavigationButton, Chat, PrecioBreakdown } from '../../components/common';
import { CheckCircle, Loader, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface ProductoInfo {
  id: string;
  nombre: string;
  descripcion: string;
  incluye?: string | null;
  noIncluye?: string | null;
  notaInformativa?: string | null;
}

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
  producto?: ProductoInfo | null;
  precioBase?: number | null;
  cantidad?: number | null;
  subtotal?: number | null;
  tarifaServicio?: number | null;
  total?: number | null;
}

export function ServicioNuevo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [servicio, setServicio] = useState<ServicioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [aceptando, setAceptando] = useState(false);
  const [mostrarModalCancelado, setMostrarModalCancelado] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);

  useEffect(() => {
    if (id) {
      cargarServicio();
    }
  }, [id]);

  const cargarServicio = async () => {
    try {
      const { data } = await serviciosApi.getById(id!);
      setServicio(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setMostrarModalCancelado(true);
      } else {
        toast.error('Error al cargar el servicio');
        navigate('/tecnico/dashboard');
      }
    } finally {
      setCargando(false);
    }
  };

  const aceptarServicio = async () => {
    if (!id) return;
    setAceptando(true);
    try {
      await serviciosApi.aceptar(id);
      toast.success('Servicio aceptado');
      navigate('/tecnico/trabajos');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setServicio(null);
        setMostrarModalCancelado(true);
      } else {
        toast.error(err.response?.data?.message || 'Error al aceptar el servicio');
      }
    } finally {
      setAceptando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const modalCancelado = (
    <Modal
      isOpen={mostrarModalCancelado}
      onClose={() => navigate('/tecnico/dashboard')}
      title="Servicio cancelado"
      dismissible={true}
    >
      <p className="text-gray-600">El cliente ha cancelado el servicio</p>
    </Modal>
  );

  if (!servicio) {
    return (
      <>
        {modalCancelado}
      </>
    );
  }

  return (
    <>
      <div className="py-8">
        <PageHeader title="Detalles del servicio" />

        {(servicio.estado === 'ASIGNADO') && (
          <button
            onClick={() => setChatAbierto(true)}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors z-[100]"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}

        <FormContainer className="space-y-4">

          {servicio.producto && (
            <div className="bg-gray-50 p-4 rounded-md border space-y-3">
              <h3 className="font-semibold text-gray-800">{servicio.producto.nombre}</h3>
              {servicio.producto.descripcion && (
                <p className="text-sm text-gray-600">{servicio.producto.descripcion}</p>
              )}
              {servicio.producto.incluye && (
                <div>
                  <p className="text-sm font-medium text-green-700">Incluye:</p>
                  <p className="text-sm text-gray-600">{servicio.producto.incluye}</p>
                </div>
              )}
              {servicio.producto.noIncluye && (
                <div>
                  <p className="text-sm font-medium text-red-700">No incluye:</p>
                  <p className="text-sm text-gray-600">{servicio.producto.noIncluye}</p>
                </div>
              )}
              <PrecioBreakdown
                precioBase={servicio.precioBase ?? undefined}
                cantidad={servicio.cantidad ?? undefined}
                subtotal={servicio.subtotal ?? 0}
                tarifaServicio={servicio.tarifaServicio ?? 0}
                total={servicio.total ?? 0}
                showFull
                notaInformativa={servicio.producto.notaInformativa}
              />
            </div>
          )}

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

          {servicio.estado === 'NUEVO' && (
            <ButtonContainer>
              <NavigationButton to='/tecnico/dashboard'>
              </NavigationButton>
              <SubmitButton
                text='Aceptar'
                onClick={aceptarServicio}
                disabled={aceptando}
              >
              </SubmitButton>
            </ButtonContainer>
          )}

          {servicio.estado === 'ASIGNADO' && (
            <div className="pt-4 border-t">
              <Link
                to={`/tecnico/servicio/${id}/terminar`}
                className="w-full flex items-center justify-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Terminar servicio
              </Link>
            </div>
          )}

        </FormContainer>
      </div>
      {modalCancelado}
      {servicio.estado === 'ASIGNADO' && (
        <Chat
          servicioId={id!}
          usuarioId={user?.id || ''}
          isOpen={chatAbierto}
          onClose={() => setChatAbierto(false)}
        />
      )}
    </>
  );
}
