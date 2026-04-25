import { ReactNode } from 'react';
import { Loader } from 'lucide-react';

interface ActionButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  icon?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-primary-600 hover:bg-primary-700',
  success: 'bg-green-600 hover:bg-green-700',
  danger: 'bg-red-600 hover:bg-red-700',
  secondary: 'bg-gray-600 hover:bg-gray-700',
};

export function ActionButton({
  text,
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  className = '',
  fullWidth = false,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center px-6 py-3 text-white rounded-md font-medium
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader className="h-5 w-5 animate-spin mr-2" />
          Procesando...
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