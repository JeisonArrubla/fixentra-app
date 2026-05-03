import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviciosApi } from '../../services/api';
import { MapPin, Clock, Loader, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { PageHeader, NavigationButton, FormContainer, ButtonContainer } from '../../components/common';

interface Servicio {
  id: string;
  descripcion: string;
  estado: 'NUEVO' | 'ASIGNADO' | 'TERMINADO' | 'CERRADO';
  direccion: { direccion: string; latitud: number; longitud: number };
  tecnico?: { nombre: string; apellido: string };
  cliente?: { nombre: string; apellido: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
  calificacion?: number | null;
}

export function ClienteServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await serviciosApi.getMisServicios('cliente');
      setServicios(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'NUEVO':
        return 'bg-blue-100 text-blue-800';
      case 'ASIGNADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINADO':
      case 'CERRADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const abrirModalEliminar = (serv: Servicio) => {
    setServicioAEliminar(serv);
    setMostrarModalEliminar(true);
  };

  const eliminarServicio = async () => {
    if (!servicioAEliminar) return;
    setEliminando(true);
    try {
      await serviciosApi.eliminar(servicioAEliminar.id);
      toast.success('Servicio eliminado');
      setMostrarModalEliminar(false);
      setServicioAEliminar(null);
      cargarDatos();
    } catch (err: any) {
      const mensaje = err.response?.data?.message;
      if (typeof mensaje === 'string') {
        toast.error(mensaje);
      } else if (Array.isArray(mensaje)) {
        toast.error(mensaje.join(', '));
      } else {
        toast.error('No se pudo eliminar el servicio. Intenta de nuevo más tarde.');
      }
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <PageHeader title="Mis servicios"/>

      <FormContainer>
        <ButtonContainer>
          <NavigationButton to="/cliente/servicios/nuevo" text="Solicitar servicio" />
        </ButtonContainer>
        {servicios.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No tienes servicios</p>
            <p className="text-sm">Crea tu primera solicitud de servicio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {servicios.map((serv) => (
              <Link key={serv.id} to={`/cliente/servicio/${serv.id}`} className="block">
                <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs rounded ${getEstadoColor(
                            serv.estado
                          )}`}
                        >
                          {getEstadoLabel(serv.estado)}
                        </span>
                        {serv.calificacion && (
                          <span className="flex items-center text-xs text-yellow-600">
                            {'★'.repeat(serv.calificacion)}
                          </span>
                        )}
                        {(serv.estado === 'CERRADO' || serv.estado === 'TERMINADO') && !serv.calificacion && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                            Calificar
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium">{serv.descripcion}</p>
                      {serv.imagenes && serv.imagenes.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {serv.imagenes.length} foto(s) adjunta(s)
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {serv.direccion.direccion}
                      </div>
                      {serv.tecnico && (
                        <p className="text-sm text-gray-600 mt-1">
                          Técnico: {serv.tecnico.nombre} {serv.tecnico.apellido}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">
                        {new Date(serv.createdAt).toLocaleDateString()}
                      </span>
                      {serv.estado === 'NUEVO' && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            abrirModalEliminar(serv);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </FormContainer>
      <ConfirmModal
        isOpen={mostrarModalEliminar}
        onClose={() => setMostrarModalEliminar(false)}
        onConfirm={eliminarServicio}
        title="Cancelar servicio"
        message={`¿Eliminar el servicio?`}
        confirmText="Eliminar"
        loading={eliminando}
      />
    </div>
  );
}
