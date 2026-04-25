import { useState, useEffect } from 'react';
import { clientesApi, solicitudesApi } from '../../services/api';
import { BackButton } from '../../components/common/BackButton';
import { Plus, MapPin, Clock, Loader, Trash2 } from 'lucide-react';
import { ImageUpload } from '../../components/common/ImageUpload';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

interface Solicitud {
  id: string;
  descripcion: string;
  estado: 'NUEVA' | 'ASIGNADA' | 'TERMINADA';
  direccion: { direccion: string; latitud: number; longitud: number };
  tecnico?: { nombre: string; apellido: string };
  cliente?: { nombre: string; apellido: string };
  imagenes?: { id: string; url: string }[];
  createdAt: string;
}

interface Direccion {
  id: string;
  direccion: string;
}

export function ClienteSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [solicitudAEliminar, setSolicitudAEliminar] = useState<Solicitud | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [formData, setFormData] = useState({
    direccionId: '',
    descripcion: '',
    imagenes: [] as string[],
  });
  const [guardando, setGuardando] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [solsRes, dirsRes] = await Promise.all([
        solicitudesApi.getMisSolicitudes('cliente'),
        clientesApi.getDirecciones(),
      ]);
      setSolicitudes(solsRes.data);
      setDirecciones(dirsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const crearSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.direccionId) {
      toast.error('Selecciona una dirección');
      return;
    }
    setGuardando(true);
    try {
      await solicitudesApi.crear({
        direccionId: formData.direccionId,
        descripcion: formData.descripcion,
        imagenes: imagenes,
      });
      toast.success('Solicitud creada');
      setMostrarFormulario(false);
      setFormData({ direccionId: '', descripcion: '', imagenes: [] });
      setImagenes([]);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear solicitud');
    } finally {
      setGuardando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'bg-blue-100 text-blue-800';
      case 'ASIGNADA':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINADA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'Nueva';
      case 'ASIGNADA':
        return 'Asignada';
      case 'TERMINADA':
        return 'Terminada';
      default:
        return estado;
    }
  };

  const abrirModalEliminar = (sol: Solicitud) => {
    setSolicitudAEliminar(sol);
    setMostrarModalEliminar(true);
  };

  const eliminarSolicitud = async () => {
    if (!solicitudAEliminar) return;
    setEliminando(true);
    try {
      await solicitudesApi.eliminar(solicitudAEliminar.id);
      toast.success('Solicitud eliminada');
      setMostrarModalEliminar(false);
      setSolicitudAEliminar(null);
      cargarDatos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar solicitud');
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <BackButton to="/cliente/dashboard" text="Volver al dashboard" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h1>
        <button
          onClick={() => {
            if (direcciones.length === 0) {
              toast.error('Primero agrega una dirección');
              return;
            }
            setMostrarFormulario(!mostrarFormulario);
          }}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Solicitud
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4">Nueva Solicitud de Servicio</h3>
          <form onSubmit={crearSolicitud} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <select
                required
                value={formData.direccionId}
                onChange={(e) => setFormData({ ...formData, direccionId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecciona una dirección</option>
                {direcciones.map((dir) => (
                  <option key={dir.id} value={dir.id}>
                    {dir.direccion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción del servicio
              </label>
              <textarea
                required
                rows={4}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe el servicio que necesitas..."
              />
            </div>
            <ImageUpload
              images={imagenes}
              onChange={setImagenes}
              maxImages={2}
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {guardando ? 'Enviando...' : 'Crear Solicitud'}
              </button>
            </div>
          </form>
        </div>
      )}

      {solicitudes.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No tienes solicitudes</p>
          <p className="text-sm">Crea tu primera solicitud de servicio</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs rounded ${getEstadoColor(
                        sol.estado
                      )}`}
                    >
                      {getEstadoLabel(sol.estado)}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{sol.descripcion}</p>
                  {sol.imagenes && sol.imagenes.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {sol.imagenes.length} foto(s) adjunta(s)
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {sol.direccion.direccion}
                  </div>
                  {sol.tecnico && (
                    <p className="text-sm text-gray-600 mt-1">
                      Técnico: {sol.tecnico.nombre} {sol.tecnico.apellido}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xs text-gray-500">
                    {new Date(sol.createdAt).toLocaleDateString()}
                  </span>
                  {sol.estado === 'NUEVA' && (
                    <button
                      onClick={() => abrirModalEliminar(sol)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={mostrarModalEliminar}
        onClose={() => setMostrarModalEliminar(false)}
        onConfirm={eliminarSolicitud}
        title="Eliminar solicitud"
        message={`¿Eliminar la solicitud  ?`}
        confirmText="Eliminar"
        loading={eliminando}
      />
    </div>
  );
}