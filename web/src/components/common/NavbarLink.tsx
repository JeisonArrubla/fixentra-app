import { Link, useLocation } from 'react-router-dom';

const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors min-w-40 text-center';
const activeClasses = 'bg-black text-white';
const inactiveClasses = 'text-gray-700 hover:text-black hover:border hover:border-black';

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
