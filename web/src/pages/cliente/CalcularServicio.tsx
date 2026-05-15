import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogosApi, clientesApi } from '../../services/api';
import { useServicio } from '../../contexts/ServicioContext';
import { PageHeader, NavigationButton, ButtonContainer, FormContainer, SubmitButton, FieldRow } from '../../components/common';
import { Loader, MapPin, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Direccion {
  id: string;
  direccion: string;
}

interface PrecioCalculado {
  productoId: string;
  slug: string;
  nombre: string;
  precioBase: number;
  cantidad: number;
  retirarElemento: boolean;
  subtotal: number;
  tarifaServicio: number;
  total: number;
  notaInformativa: string | null;
}

export function CalcularServicio() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { draft, updateDraft } = useServicio();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargandoDir, setCargandoDir] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [precio, setPrecio] = useState<PrecioCalculado | null>(null);
  const [cantidad, setCantidad] = useState(draft.cantidad);
  const [retirarElemento, setRetirarElemento] = useState(draft.retirarElemento);

  useEffect(() => {
    clientesApi
      .getDirecciones()
      .then((res) => setDirecciones(res.data))
      .catch(() => toast.error('Error al cargar direcciones'))
      .finally(() => setCargandoDir(false));
  }, []);

  useEffect(() => {
    if (!slug) return;
    recalcular();
  }, [cantidad, retirarElemento, slug]);

  const recalcular = async () => {
    setCalculando(true);
    try {
      const { data } = await catalogosApi.calcularPrecio({
        slug: slug!,
        cantidad,
        retirarElemento,
      });
      setPrecio(data);
    } catch {
      // silent
    } finally {
      setCalculando(false);
    }
  };

  const handleContinuar = () => {
    if (!draft.direccionId) {
      toast.error('Selecciona una dirección');
      return;
    }
    if (!precio) return;

    updateDraft({
      cantidad,
      retirarElemento,
      subtotal: precio.subtotal,
      tarifaServicio: precio.tarifaServicio,
      total: precio.total,
    });
    navigate('/cliente/servicios/nuevo/confirmar');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <PageHeader title="Configurar servicio" />

      <FormContainer>
        {draft.productoNombre && (
          <p className="text-lg font-semibold text-gray-800 mb-4">
            {draft.productoNombre}
          </p>
        )}

        <div className="space-y-6">
          <FieldRow label="Dirección del servicio" />
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={draft.direccionId}
              onChange={(e) => updateDraft({ direccionId: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecciona una dirección</option>
              {direcciones.map((dir) => (
                <option key={dir.id} value={dir.id}>
                  {dir.direccion}
                </option>
              ))}
            </select>
          </div>

          {cargandoDir && (
            <div className="flex justify-center py-4">
              <Loader className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          <FieldRow label="Cantidad" />
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="p-2 rounded-md border hover:bg-gray-50"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-xl font-semibold w-8 text-center">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad(cantidad + 1)}
              className="p-2 rounded-md border hover:bg-gray-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={retirarElemento}
              onChange={(e) => setRetirarElemento(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300"
            />
            <span className="text-gray-700">Retirar elemento existente</span>
          </label>
        </div>

        {calculando && (
          <div className="flex justify-center py-4">
            <Loader className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {precio && !calculando && (
          <div className="mt-6 bg-gray-50 p-4 rounded-md border">
            <h3 className="font-semibold text-gray-800 mb-3">Resumen de precios</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio unitario</span>
                <span>${precio.precioBase.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad</span>
                <span>{precio.cantidad}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${precio.subtotal.toLocaleString('es-CO')}</span>
              </div>
              {precio.retirarElemento && (
                <div className="flex justify-between text-orange-600">
                  <span>Retiro de elemento existente</span>
                  <span>+$30,000</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tarifa de servicio (8%)</span>
                <span>${precio.tarifaServicio.toLocaleString('es-CO')}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-green-700">
                <span>Total</span>
                <span>${precio.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        )}

        {precio?.notaInformativa && (
          <p className="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
            {precio.notaInformativa}
          </p>
        )}

        <ButtonContainer>
          <NavigationButton to={`/cliente/servicios/nuevo/${slug}`} text="Volver" />
          <SubmitButton
            text="Continuar"
            onClick={handleContinuar}
            disabled={calculando || !draft.direccionId || !precio}
          />
        </ButtonContainer>
      </FormContainer>
    </div>
  );
}
