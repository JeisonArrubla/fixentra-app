import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Wrench, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-icon" />
              <span className="ml-2 text-xl font-bold text-gray-900">Fixentra</span>
            </div>
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-4">
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
                    to="/cliente/solicitudes"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/cliente/solicitudes')
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Mis solicitudes
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

              <div className="flex items-center space-x-2 ml-4">
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

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && user && (
        <div className="lg:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user.esCliente && (
              <>
                <Link
                  to="/cliente/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Cliente
                </Link>
                <Link
                  to="/cliente/direcciones"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis direcciones
                </Link>
                <Link
                  to="/cliente/solicitudes"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis solicitudes
                </Link>
              </>
            )}

            {user.esTecnico && (
              <>
                <Link
                  to="/tecnico/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/tecnico/trabajos"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis servicios
                </Link>
                <Link
                  to="/tecnico/perfil"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Mi perfil
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
            >
              Cerrar Sesión
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