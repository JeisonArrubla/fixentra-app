import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../../services/api';
import { LocationPicker } from '../../components/common/LocationPicker';
import { NavigationButton, SubmitButton, CancelButton, ButtonContainer, PageHeader } from '../../components/common';
import toast from 'react-hot-toast';

export function ClienteNuevaDireccion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    direccion: '',
    latitud: 6.2476,
    longitud: -75.5658,
    esPrincipal: false,
  });
  const [guardando, setGuardando] = useState(false);

  const guardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await clientesApi.crearDireccion(formData);
      toast.success('Dirección creada');
      navigate('/cliente/direcciones');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear dirección');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <PageHeader title="Nueva dirección" />
      <NavigationButton to="/cliente/direcciones" text="Volver" />

      <form onSubmit={guardarDireccion} className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">
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
          <div className="pt-4 border-t">
            <ButtonContainer>
              <CancelButton
                onClick={() => navigate('/cliente/direcciones')}
              />
              <SubmitButton
                text={guardando ? 'Guardando...' : 'Guardar'}
                type="submit"
                loading={guardando}
              />
            </ButtonContainer>
          </div>
        </div>
      </form>
    </div>
  );
}
