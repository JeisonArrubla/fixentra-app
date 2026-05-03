import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { NavbarLink } from './NavbarLink';
import { Logo } from './Logo';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile/Tablet: solo logo centrado */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-left h-16 items-center">
          <Logo />
        </div>
      </div>

      {/* Desktop: logo arriba, links abajo */}
      <nav className="bg-white shadow-sm border-b hidden lg:flex flex-col">
        {/* Logo centrado */}
        <div className="flex justify-left py-2">
          <Logo />
        </div>

        {/* Links centrados + logout a la derecha */}
        {user && (
          <div className="flex items-center justify-between px-4 pb-2">
            {/* Spacer izquierdo */}
            <div className="flex-1" />

            {/* Links centrados */}
            <div className="flex items-center space-x-4">
              {user.esCliente && (
                <>
                  <NavbarLink to="/cliente/dashboard">Home</NavbarLink>
                  <NavbarLink to="/cliente/direcciones">Mis direcciones</NavbarLink>
                  <NavbarLink to="/cliente/servicios">Mis servicios</NavbarLink>
                </>
              )}

              {user.esTecnico && (
                <>
                  <NavbarLink to="/tecnico/dashboard">Home</NavbarLink>
                  <NavbarLink to="/tecnico/trabajos">Mis servicios</NavbarLink>
                  <NavbarLink to="/tecnico/perfil">Mi perfil</NavbarLink>
                </>
              )}
            </div>

            {/* Logout a la derecha */}
            <div className="flex-1 flex justify-end items-center space-x-2">
              <span className="text-sm text-gray-600">
                {user.nombre} {user.apellido}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </nav>
    <div className="content">
      <Outlet />
    </div>
    </>
  );
}
