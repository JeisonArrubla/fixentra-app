import { Link, useLocation } from 'react-router-dom';

// ============================================
// NAVBARLINK - Enlaces de la barra de navegación desktop
// ============================================
// Renderiza un <Link> de react-router con estilos automáticos
// según la ruta activa (detecta automáticamente cuando la URL coincide).
//
// USO:
// <NavbarLink to="/cliente/dashboard">Inicio</NavbarLink>
//
// Para cambiar estilos de TODOS los enlaces del navbar, modifica las constantes abajo.
// ============================================

// TAMAÑO: padding, ancho mínimo y alineación del texto
// px-3 py-2 (mediano) | px-4 py-3 (grande)
const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors min-w-40 text-center';

// ESTILO DEL ENLACE ACTIVO (cuando la URL coincide con `to`)
// bg-black text-white | bg-green-600 text-white | bg-transparent border-b-2 border-black
const activeClasses = 'bg-transparent border border-gray-900 text-black';

// ESTILO DEL ENLACE INACTIVO (por defecto)
// text-gray-700 hover:text-white hover:bg-gray-800 | text-gray-700 hover:text-black hover:border hover:border-black
const inactiveClasses = 'text-gray-700 hover:text-black hover:border hover:border-gray-300';

// ============================================
// Props:
// to        → ruta destino (ej: "/cliente/dashboard")
// children  → contenido del enlace (texto o ícono)
// ============================================

interface NavbarLinkProps {
  to: string;
  children: React.ReactNode;
}

export function NavbarLink({ to, children }: NavbarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </Link>
  );
}
