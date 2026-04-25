import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to: string;
  text?: string;
  className?: string;
}

export function BackButton({ to, text = 'Volver', className = '' }: BackButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 mb-6 font-medium ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {text}
    </Link>
  );
}