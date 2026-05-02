import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { ImageGridWithViewer, NavigationButton, PageHeader, FieldRow, Modal } from '../../components/common';
import { CheckCircle, Loader } from 'lucide-react';
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
  const [aceptando, setAceptando] = useState(false);
  const [mostrarModalCancelado, setMostrarModalCancelado] = useState(false);

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

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'NUEVO':
        return 'Nuevo';
      case 'ASIGNADO':
        return 'Asignado';
      case 'TERMINADO':
        return 'Terminado';
      case 'CERRADO':
        return 'Cerrado';
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

  const modalCancelado = (
    <Modal
      isOpen={mostrarModalCancelado}
      onClose={() => navigate('/tecnico/dashboard')}
      title="Servicio cancelado"
      dismissible={false}
      footer={
        <NavigationButton
          onClick={() => navigate('/tecnico/dashboard')}
          text="Regresar"
          className="mb-0"
        />
      }
    >
      <p className="text-gray-600">El cliente ha cancelado el servicio</p>
    </Modal>
  );

  if (!servicio) {
    return (
      <>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <p className="text-gray-600">Servicio no encontrado</p>
          <NavigationButton to="/tecnico/dashboard" text="Volver" className="mt-4" />
        </div>
        {modalCancelado}
      </>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <PageHeader title="Detalles del servicio" />
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <FieldRow label="Descripción" value={servicio.descripcion} />
            <FieldRow label="Estado" value={getEstadoLabel(servicio.estado)} />

            <FieldRow
              label="Ubicación"
              value={servicio.direccion.direccion}
            />

            <FieldRow label="Cliente" value={`${servicio.cliente.nombre} ${servicio.cliente.apellido}`} />

            <FieldRow label="Creado" value={new Date(servicio.createdAt).toLocaleString()} />

            {servicio.imagenes && servicio.imagenes.length > 0 && (
              <FieldRow label="Fotos">
                <ImageGridWithViewer
                  images={servicio.imagenes}
                  thumbnailClassName="h-24 w-24 object-cover rounded-lg"
                />
              </FieldRow>
            )}

            {servicio.estado === 'NUEVO' && (
              <div className="pt-4 border-t">
                <button
                  onClick={aceptarServicio}
                  disabled={aceptando}
                  className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {aceptando ? (
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  {aceptando ? 'Aceptando...' : 'Aceptar Servicio'}
                </button>
              </div>
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
          </div>
        </div>
      </div>
      {modalCancelado}
    </>
  );
}
