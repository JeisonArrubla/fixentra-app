import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { catalogosApi } from '../../services/api';
import { PageHeader } from '../../components/common';
import { Tag } from 'lucide-react';

interface ProductoCategoria {
  categoria: { nombre: string; slug: string };
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  slug: string;
  precioBase: number;
  imagenUrl: string | null;
  categorias: ProductoCategoria[];
}

export function ClienteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    if (user !== null) {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    catalogosApi
      .listarProductos()
      .then((res) => setProductos(res.data))
      .catch(() => {});
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!user?.esCliente) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">
          Acceso no autorizado. Esta sección es para clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <PageHeader title="¿Cómo podemos ayudarte hoy?" />

      {productos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {productos.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/cliente/servicios/nuevo/${p.slug}`)}
              className="text-left bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all"
            >
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{p.nombre}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.descripcion}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.categorias.map((c) => (
                  <span
                    key={c.categoria.slug}
                    className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {c.categoria.nombre}
                  </span>
                ))}
              </div>
              <p className="text-green-700 font-bold text-xl">
                ${p.precioBase.toLocaleString('es-CO')}
              </p>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
