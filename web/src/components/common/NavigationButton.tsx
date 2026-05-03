import { Link } from 'react-router-dom';
import { buttonSize, buttonBorderRadius, buttonMarginBottom, buttonFontWeight } from './button-config';

// ============================================
// CONFIGURACIÓN DEL BOTÓN (modifica aquí para cambiar TODOS los NavigationButton)
// ============================================

// COLOR DE FONDO: bg-black, bg-green-600, bg-blue-600, etc.
const bgColor = 'bg-white border border-black';

// COLOR DE FONDO EN HOVER: hover:bg-gray-800, hover:bg-green-700, etc.
const hoverBg = 'hover:text-white hover:bg-black';

// COLOR DE TEXTO: text-white, text-gray-900, etc.
const textColor = 'text-black';

// BORDES:
// Para borde SOLO EN HOVER → modifica hoverBg:
//   const hoverBg = 'hover:border hover:border-black hover:bg-white';
// Para borde SIEMPRE VISIBLE → modifica bgColor:
//   const bgColor = 'bg-black text-white border border-black';
// Para SIN BORDES → usa solo fondo y color:
//   const hoverBg = 'hover:bg-gray-800';
//   const bgColor = 'bg-black text-white';

// ============================================
// NO MODIFICAR DESDE AQUÍ
// ============================================

const baseClasses = `inline-flex items-center justify-center ${buttonSize} ${bgColor} ${textColor} ${buttonBorderRadius} ${hoverBg} ${buttonMarginBottom} ${buttonFontWeight} transition-colors`;

// Props:
// to        → ruta de navegación (ej: "/cliente/dashboard"). Usa <Link>
// onClick   → función al hacer clic (ej: () => navigate('/dashboard')). Usa <button>
// text      → texto del botón (default: "Volver")
// className → clases extra para personalizar una instancia específica

interface NavigationButtonProps {
  to?: string;
  onClick?: () => void;
  text?: string;
  className?: string;
}

export function NavigationButton({ to, onClick, text = 'Volver', className = '' }: NavigationButtonProps) {
  const classes = `${baseClasses} ${className}`;

  if (onClick) {
    return <button onClick={onClick} className={classes}>{text}</button>;
  }

  return <Link to={to!} className={classes}>{text}</Link>;
}
