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
      <nav className="bg-white shadow-sm border-b hidden lg:flex">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-icon" />
              <span className="ml-2 text-xl font-bold text-gray-900">Fixentra</span>
            </div>
          </div>

          {user && (
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
        </div>
      </div>
    </nav>
    <div className="content">
      <Outlet />
    </div>
    </>
  );
}
