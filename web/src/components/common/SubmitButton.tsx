import { ReactNode } from 'react';
import { Loader } from 'lucide-react';

interface SubmitButtonProps {
  text?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function SubmitButton({
  text = 'Enviar',
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  icon,
  className = '',
  fullWidth = true,
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
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