import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const baseClasses = 'inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 mb-6 font-medium transition-colors';

interface NavigationButtonProps {
  to?: string;
  onClick?: () => void;
  text?: string;
  className?: string;
}

export function NavigationButton({ to, onClick, text = 'Volver', className = '' }: NavigationButtonProps) {
  const classes = `${baseClasses} ${className}`;
  const content = (
    <>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {text}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to!} className={classes}>
      {content}
    </Link>
  );
}