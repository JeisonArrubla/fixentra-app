import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Wrench } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile/Tablet: solo logo centrado */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-center h-16 items-center">
          <Wrench className="h-6 w-6 text-icon" />
          <span className="ml-2 text-lg font-bold text-gray-900">Fixentra</span>
        </div>
      </div>

      {/* Desktop: logo arriba, links abajo */}
      <nav className="bg-white shadow-sm border-b hidden lg:flex flex-col">
        {/* Logo centrado */}
        <div className="flex justify-center py-2">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-icon" />
            <span className="ml-2 text-xl font-bold text-gray-900">Fixentra</span>
          </div>
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
                  <Link
                    to="/cliente/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/cliente/dashboard')
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/cliente/direcciones"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/cliente/direcciones')
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Mis direcciones
                  </Link>
                  <Link
                    to="/cliente/servicios"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/cliente/servicios')
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Mis servicios
                  </Link>
                </>
              )}

              {user.esTecnico && (
                <>
                  <Link
                    to="/tecnico/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/tecnico/dashboard')
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/tecnico/trabajos"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/tecnico/trabajos')
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Mis servicios
                  </Link>
                  <Link
                    to="/tecnico/perfil"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/tecnico/perfil')
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Mi perfil
                  </Link>
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
