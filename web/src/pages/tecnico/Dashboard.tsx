import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { serviciosApi } from '../../services/api';
import { MapPin, Loader } from 'lucide-react';
import { PageHeader, Modal } from '../../components/common';

interface Servicio {
  id: string;
  descripcion: string;
  estado: string;
  direccion: { direccion: string; latitud: number; longitud: number };
  cliente: { nombre: string; apellido: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

export function TecnicoDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [mostrarModalCancelado, setMostrarModalCancelado] = useState(false);

  useEffect(() => {
    if (user !== null) {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.esTecnico) {
      cargarServicios();
    }
  }, [user]);

  const cargarServicios = async () => {
    try {
      const { data } = await serviciosApi.getTodasNuevas();
      setServicios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoServicios(false);
    }
  };

  const handleVerServicio = async (id: string) => {
    try {
      await serviciosApi.getById(id);
      navigate(`/tecnico/servicio/${id}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setMostrarModalCancelado(true);
      }
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-icon" />
      </div>
    );
  }

  if (!user?.esTecnico) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">
          Acceso no autorizado. Esta sección es para técnicos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <PageHeader title={`Te damos la bienvenida, ${user?.nombre}`} />

      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
        
        {cargandoServicios ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-icon" />
          </div>
        ) : servicios.length === 0 ? (
          <PageHeader title={`No hay servicios nuevos`} />
        ) : (
          <div className="space-y-3">
            {servicios.map((serv) => (
              <button
                key={serv.id}
                onClick={() => handleVerServicio(serv.id)}
                className="block w-full text-left bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-lg p-4 hover:from-green-100 hover:to-green-50 hover:border-green-400 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">{serv.descripcion}</p>
                    <div className="flex items-center text-sm text-green-700 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {serv.direccion.direccion}
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Cliente: {serv.cliente.nombre} {serv.cliente.apellido}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {new Date(serv.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={mostrarModalCancelado}
        onClose={() => window.location.reload()}
        title="Servicio cancelado"
        dismissible={true}
      >
        <p className="text-gray-600">El cliente ha cancelado el servicio</p>
      </Modal>
    </div>
  );
}
