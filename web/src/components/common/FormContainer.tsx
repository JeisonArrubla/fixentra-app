import { ReactNode } from 'react';

// ============================================
// CONFIGURACIÓN DEL CONTENEDOR DE FORMULARIOS
// Modifica aquí para cambiar TODOS los formularios de la app
// ============================================

// ANCHO MÁXIMO del formulario: max-w-xl, max-w-2xl, max-w-3xl, max-w-4xl, max-w-5xl
const maxWidth = 'max-w-xl';

// FONDO: bg-white, bg-gray-50, bg-transparent
const backgroundColor = 'bg-white';

// BORDE: border (gris por defecto), border-2, border-0 (sin borde)
const border = 'border';

// REDONDEO: rounded-sm, rounded-md, rounded-lg, rounded-xl
const borderRadius = 'rounded-lg';

// SOMBRA: shadow-sm, shadow-md, shadow-lg, shadow-none
const shadow = 'shadow-sm';

// PADDING INTERNO: p-4, p-6, p-8
const padding = 'p-6';

// ============================================
// NO MODIFICAR DESDE AQUÍ
// ============================================

const containerClasses = `mx-auto ${maxWidth} ${backgroundColor} ${border} ${borderRadius} ${shadow} ${padding}`;

interface FormContainerProps {
  children: ReactNode;
  className?: string;
}

export function FormContainer({ children, className = '' }: FormContainerProps) {
  return (
    <div className={`${containerClasses} ${className}`}>
      {children}
    </div>
  );
}
