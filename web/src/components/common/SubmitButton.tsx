import { ReactNode } from 'react';
import { Loader } from 'lucide-react';
import { buttonSize, buttonBorderRadius, buttonMarginBottom, buttonFontWeight } from './button-config';

// ============================================
// CONFIGURACIÓN DEL BOTÓN (modifica aquí para cambiar TODOS los SubmitButton)
// ============================================

// COLOR DE FONDO: bg-green-600, bg-black, bg-blue-600, etc.
const bgColor = 'bg-black';

// COLOR DE FONDO EN HOVER: hover:bg-green-700, hover:bg-gray-800, etc.
const hoverBg = 'hover:bg-green-700';

// COLOR DE TEXTO: text-white, text-gray-900, etc.
const textColor = 'text-white';

// ============================================
// NO MODIFICAR DESDE AQUÍ
// ============================================

const baseClasses = `inline-flex items-center justify-center ${buttonSize} ${bgColor} ${textColor} ${buttonBorderRadius} ${hoverBg} ${buttonMarginBottom} ${buttonFontWeight} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;

// Props:
// text      → texto del botón (default: "Enviar")
// onClick   → función al hacer clic
// type      → 'button' o 'submit' (default: 'button')
// loading   → muestra spinner y cambia texto a "Enviando..."
// disabled  → deshabilita el botón
// icon      → ícono a la izquierda del texto
// className → clases extra para personalizar una instancia específica

interface SubmitButtonProps {
  text?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function SubmitButton({
  text = 'Enviar',
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  icon,
  className = '',
}: SubmitButtonProps) {
  const classes = `${baseClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <>
          <Loader className="h-5 w-5 animate-spin mr-2" />
          Enviando...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {text}
        </>
      )}
    </button>
  );
}
