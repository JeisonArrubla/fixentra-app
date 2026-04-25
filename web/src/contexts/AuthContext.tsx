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
    const token = localStorage.getItem('accessToken');
    if (token) {
      authApi.profile()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (correo: string, contrasena: string) => {
    console.log('[AuthContext] Intentando login para:', correo);
    const { data } = await authApi.login(correo, contrasena);
    console.log('[AuthContext] Login response:', data);
    console.log('[AuthContext] User esCliente:', data.user.esCliente, 'esTecnico:', data.user.esTecnico);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    toast.success('Bienvenido ' + data.user.nombre);
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

  const logout = () => {
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