import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, Usuario } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (correo: string, contrasena: string) => Promise<Usuario>;
  register: (data: {
    nombre: string;
    apellido: string;
    tipoDocumento: string;
    numDocumento: string;
    correo: string;
    celular: string;
    contrasena: string;
    crearPerfilCliente?: boolean;
    crearPerfilTecnico?: boolean;
    disponibilidadTecnico?: boolean;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token || refreshToken) {
        try {
          const res = await authApi.profile();
          if (isMounted) {
            setUser(res.data);
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (correo: string, contrasena: string) => {
    const { data } = await authApi.login(correo, contrasena);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    toast.success('Te damos la bienvenida ' + data.user.nombre);
    return data.user;
  };

  const register = async (data: {
    nombre: string;
    apellido: string;
    tipoDocumento: string;
    numDocumento: string;
    correo: string;
    celular: string;
    contrasena: string;
    crearPerfilCliente?: boolean;
    crearPerfilTecnico?: boolean;
    disponibilidadTecnico?: boolean;
  }) => {
    await authApi.register(data);
    toast.success('Registro exitoso. Por favor inicia sesión.');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await authApi.profile();
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}