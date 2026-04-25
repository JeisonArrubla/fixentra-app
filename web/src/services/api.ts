import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  esCliente: boolean;
  esTecnico: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
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
    latitudTecnico?: number;
    longitudTecnico?: number;
  }) => api.post('/auth/register', data),

  login: (correo: string, contrasena: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: Usuario }>('/auth/login', { correo, contrasena }),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }),

  profile: () => api.get<Usuario>('/auth/profile'),
};

export const clientesApi = {
  crearPerfil: () => api.post('/clientes/perfil'),

  getPerfil: () => api.get('/clientes/perfil'),

  getDirecciones: () => api.get('/clientes/direcciones'),

  crearDireccion: (data: {
    direccion: string;
    latitud: number;
    longitud: number;
    esPrincipal?: boolean;
  }) => api.post('/clientes/direcciones', data),

  actualizarDireccion: (id: string, data: any) => api.put(`/clientes/direcciones/${id}`, data),

  eliminarDireccion: (id: string) => api.delete(`/clientes/direcciones/${id}`),

  setPrincipal: (id: string) => api.patch(`/clientes/direcciones/${id}/principal`),
};

export const tecnicosApi = {
  crearPerfil: (data: {
    latitud?: number;
    longitud?: number;
    radioCoberturaKm?: number;
  }) => api.post('/tecnicos/perfil', data),

  getPerfil: () => api.get('/tecnicos/perfil'),

  actualizarUbicacion: (latitud: number, longitud: number) =>
    api.patch('/tecnicos/ubicacion', { latitud, longitud }),

  toggleDisponibilidad: (disponibilidad: boolean) =>
    api.patch('/tecnicos/disponibilidad', { disponibilidad }),
};

export const solicitudesApi = {
  crear: (data: { direccionId: string; descripcion: string; imagenes?: string[] }) =>
    api.post('/solicitudes', data),

  getDisponibles: (latitud: number, longitud: number, radioKm?: number) =>
    api.get('/solicitudes/disponibles', { params: { latitud, longitud, radioKm } }),

  getTodasNuevas: () => api.get('/solicitudes/todas'),

  getMisSolicitudes: (tipo: 'cliente' | 'tecnico') =>
    api.get('/solicitudes/mis-solicitudes', { params: { tipo } }),

  getById: (id: string) => api.get(`/solicitudes/${id}`),

  aceptar: (id: string) => api.post(`/solicitudes/${id}/aceptar`),

  terminar: (id: string) => api.patch(`/solicitudes/${id}/terminar`),

  eliminar: (id: string) => api.delete(`/solicitudes/${id}`),
};

export default api;