import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface NavigationButtonProps {
  to: string;
  text?: string;
  className?: string;
}

export function NavigationButton({ to, text = 'Volver', className = '' }: NavigationButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 mb-6 font-medium transition-colors ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {text}
    </Link>
  );
}