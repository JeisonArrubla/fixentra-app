import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../../services/api';
import { NavigationButton } from '../../components/common/NavigationButton';
import { MapPin, Loader } from 'lucide-react';
import { ImageUpload } from '../../components/common/ImageUpload';
import { SubmitButton } from '../../components/common/SubmitButton';
import { useSolicitud } from '../../contexts/SolicitudContext';
import toast from 'react-hot-toast';

interface Direccion {
  id: string;
  direccion: string;
}

export function NuevaSolicitud() {
  const navigate = useNavigate();
  const { draft, setDraft } = useSolicitud();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState(draft);
  const [imagenes, setImagenes] = useState<string[]>(draft.imagenes);

  useEffect(() => {
    clientesApi.getDirecciones()
      .then(res => setDirecciones(res.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    setFormData(draft);
    setImagenes(draft.imagenes);
  }, [draft]);

  const handleContinuar = () => {
    if (!formData.direccionId) {
      toast.error('Selecciona una dirección');
      return;
    }
    if (!formData.descripcion.trim()) {
      toast.error('Ingresa una descripción del servicio');
      return;
    }

    setDraft({ ...formData, imagenes });
    navigate('/cliente/solicitudes/nueva/confirmar');
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (direcciones.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-gray-600 mb-4">
          Primero necesitas tener al menos una dirección registrada.
        </p>
        <NavigationButton to="/cliente/direcciones" text="Ir a direcciones" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <NavigationButton to="/cliente/solicitudes" text="Cancelar" />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Crear nueva solicitud
        </h1>

        <div className="space-y-6">
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="direccion"
                value={formData.direccionId}
                onChange={(e) => setFormData({ ...formData, direccionId: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecciona una dirección</option>
                {direcciones.map((dir) => (
                  <option key={dir.id} value={dir.id}>
                    {dir.direccion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del servicio
            </label>
            <textarea
              id="descripcion"
              rows={4}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe el servicio que necesitas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes (opcional)
            </label>
            <ImageUpload
              images={imagenes}
              onChange={setImagenes}
              maxImages={2}
            />
          </div>

          <div className="pt-4 border-t flex justify-end">
            <SubmitButton
              text="Continuar"
              onClick={handleContinuar}
            />
          </div>
        </div>
      </div>
    </div>
  );
}