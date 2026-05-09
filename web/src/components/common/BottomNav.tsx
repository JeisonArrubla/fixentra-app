import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, MapPin, ClipboardList, Briefcase, User } from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const clienteItems: NavItem[] = [
  {
    to: '/cliente/dashboard',
    icon: <Home size={24} />,
    label: 'Inicio',
  },
  {
    to: '/cliente/direcciones',
    icon: <MapPin size={24} />,
    label: 'Direcciones',
  },
  {
    to: '/cliente/servicios',
    icon: <ClipboardList size={24} />,
    label: 'Servicios',
  },
];

const tecnicoItems: NavItem[] = [
  {
    to: '/tecnico/dashboard',
    icon: <Home size={24} />,
    label: 'Inicio',
  },
  {
    to: '/tecnico/trabajos',
    icon: <Briefcase size={24} />,
    label: 'Servicios',
  },
  {
    to: '/tecnico/perfil',
    icon: <User size={24} />,
    label: 'Perfil',
  },
];

export function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const items = user.esCliente ? clienteItems : tecnicoItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="pb-16 lg:pb-0">
        <Outlet />
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive(item.to)
                   ? 'text-black'
                  : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
