import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isAuthRequest = (url: string): boolean => {
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
};

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

    if (!originalRequest || isAuthRequest(originalRequest.url || '')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
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

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

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

  completar: (id: string, data: { detalles: string; imagenes: string[] }) =>
    api.patch(`/solicitudes/${id}/completar`, data),

  terminar: (id: string) => api.patch(`/solicitudes/${id}/terminar`),

  eliminar: (id: string) => api.delete(`/solicitudes/${id}`),
};

export default api;