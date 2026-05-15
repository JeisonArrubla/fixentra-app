import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogosApi } from '../../services/api';
import { useServicio } from '../../contexts/ServicioContext';
import { PageHeader, NavigationButton, ButtonContainer, FormContainer, SubmitButton } from '../../components/common';
import { Loader, Tag, CheckCircle2, XCircle } from 'lucide-react';

interface Categoria {
  categoria: { nombre: string; slug: string };
}

interface ReglaPrecio {
  id: string;
  tipo: string;
  clave: string;
  etiqueta: string;
  precioAdicional: number | null;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  slug: string;
  precioBase: number;
  imagenUrl: string | null;
  incluye: string | null;
  noIncluye: string | null;
  notaInformativa: string | null;
  soportaCantidad: boolean;
  categorias: Categoria[];
  reglasPrecio: ReglaPrecio[];
}

export function ProductoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { updateDraft, clearDraft } = useServicio();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    clearDraft();
    catalogosApi
      .getProductoBySlug(slug)
      .then((res) => setProducto(res.data))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [slug]);

  const handleContinuar = () => {
    if (!producto) return;
    updateDraft({
      productoServicioId: producto.id,
      productoSlug: producto.slug,
      productoNombre: producto.nombre,
      descripcion: producto.nombre,
      precioBase: producto.precioBase,
    });
    navigate(`/cliente/servicios/nuevo/${producto.slug}/calcular`);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">Servicio no encontrado</p>
        <NavigationButton to="/cliente/dashboard" text="Volver" className="mt-4" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <PageHeader title={producto.nombre} />

      <FormContainer>
        <p className="text-gray-600 mb-6">{producto.descripcion}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {producto.categorias.map((c) => (
            <span
              key={c.categoria.slug}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 border"
            >
              <Tag className="h-3 w-3 mr-1" />
              {c.categoria.nombre}
            </span>
          ))}
        </div>

        <div className="text-2xl font-bold text-green-700 mb-6">
          ${producto.precioBase.toLocaleString('es-CO')}
        </div>

        {producto.incluye && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Incluye</h3>
            <ul className="space-y-1">
              {producto.incluye.split('\n').map((item, i) => (
                <li key={i} className="flex items-start text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {producto.noIncluye && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">No incluye</h3>
            <ul className="space-y-1">
              {producto.noIncluye.split('\n').map((item, i) => (
                <li key={i} className="flex items-start text-sm text-gray-600">
                  <XCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ButtonContainer>
          <NavigationButton to="/cliente/dashboard" text="Volver" />
          <SubmitButton text="Continuar" onClick={handleContinuar} />
        </ButtonContainer>
      </FormContainer>
    </div>
  );
}
