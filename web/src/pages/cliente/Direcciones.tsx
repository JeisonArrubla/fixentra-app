import { useState, useEffect } from 'react';
import { clientesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Trash2, Star, Loader } from 'lucide-react';
import { LocationPicker } from '../../components/common/LocationPicker';
import { Modal } from '../../components/common/Modal';
import { CancelButton, NavigationButton, SubmitButton } from '../../components/common';
import toast from 'react-hot-toast';

interface Direccion {
  id: string;
  direccion: string;
  latitud: number;
  longitud: number;
  esPrincipal: boolean;
}

export function ClienteDirecciones() {
  const { } = useAuth();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [direccionAEliminar, setDireccionAEliminar] = useState<Direccion | null>(null);
  const [formData, setFormData] = useState({
    direccion: '',
    latitud: 6.2476,
    longitud: -75.5658,
    esPrincipal: false,
  });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDirecciones();
  }, []);

  const cargarDirecciones = async () => {
    try {
      const { data } = await clientesApi.getDirecciones();
      setDirecciones(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cargar direcciones');
    } finally {
      setCargando(false);
    }
  };

  const guardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await clientesApi.crearDireccion(formData);
      toast.success('Dirección creada');
      setMostrarFormulario(false);
      setFormData({
        direccion: '',
        latitud: 6.2476,
        longitud: -75.5658,
        esPrincipal: false,
      });
      cargarDirecciones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear dirección');
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalEliminar = (dir: Direccion) => {
    setDireccionAEliminar(dir);
    setMostrarModalEliminar(true);
  };

  const eliminarDireccion = async () => {
    if (!direccionAEliminar) return;
    try {
      await clientesApi.eliminarDireccion(direccionAEliminar.id);
      toast.success('Dirección eliminada');
      setMostrarModalEliminar(false);
      setDireccionAEliminar(null);
      cargarDirecciones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const setPrincipal = async (id: string) => {
    try {
      await clientesApi.setPrincipal(id);
      toast.success('Dirección principal actualizada');
      cargarDirecciones();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
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
      <NavigationButton to="/cliente/dashboard" text="Volver" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis direcciones</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Nueva dirección
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4">Nueva dirección</h3>
          <form onSubmit={guardarDireccion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                required
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="CR 43A 10 22 MEDELLIN"
              />
            </div>
            <LocationPicker
              latitud={formData.latitud}
              longitud={formData.longitud}
              onLocationChange={(lat, lng) => setFormData({ ...formData, latitud: lat, longitud: lng })}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="esPrincipal"
                checked={formData.esPrincipal}
                onChange={(e) => setFormData({ ...formData, esPrincipal: e.target.checked })}
                className="h-4 w-4 text-gray-500 border-gray-300 rounded"
              />
              <label htmlFor="esPrincipal" className="ml-2 text-sm text-gray-700">
                Establecer como dirección principal
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <CancelButton
                text="Cancelar"
                onClick={() => setMostrarFormulario(false)}
                fullWidth={false}
              />
              <SubmitButton
                text={guardando ? 'Guardando...' : 'Guardar'}
                type="submit"
                loading={guardando}
                fullWidth={false}
              />
            </div>
          </form>
        </div>
      )}

      {direcciones.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No tienes direcciones guardadas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {direcciones.map((dir) => (
            <div key={dir.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{dir.direccion}</p>
                  <p className="text-sm text-gray-500">
                    {dir.latitud}, {dir.longitud}
                  </p>
                </div>
                {dir.esPrincipal && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    <Star className="h-3 w-3 mr-1" />
                    Principal
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!dir.esPrincipal && (
                  <button
                    onClick={() => setPrincipal(dir.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Hacer principal
                  </button>
                )}
                <button
                  onClick={() => abrirModalEliminar(dir)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={mostrarModalEliminar}
        onClose={() => setMostrarModalEliminar(false)}
        title="Eliminar Dirección"
        footer={
          <>
            <button
              onClick={() => setMostrarModalEliminar(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={eliminarDireccion}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          ¿Estás seguro de que quieres eliminar la dirección{' '}
          <strong>"{direccionAEliminar?.direccion}"</strong>?
        </p>
      </Modal>
    </div>
  );
}