import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, FileText, Briefcase, Wrench } from 'lucide-react';

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
];

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    numDocumento: '',
    correo: '',
    celular: '',
    contrasena: '',
    confirmarContrasena: '',
  });
  const [roles, setRoles] = useState({
    crearPerfilCliente: false,
    crearPerfilTecnico: false,
    disponibilidadTecnico: true,
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoles({ ...roles, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!roles.crearPerfilCliente && !roles.crearPerfilTecnico) {
      setError('Selecciona al menos una opción: Cliente y/o Técnico');
      return;
    }

    if (roles.crearPerfilTecnico && !roles.disponibilidadTecnico) {
      setError('Si eres técnico, debes indicar si estás disponible');
      return;
    }

    setCargando(true);
    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipoDocumento: formData.tipoDocumento,
        numDocumento: formData.numDocumento,
        correo: formData.correo,
        celular: formData.celular,
        contrasena: formData.contrasena,
        crearPerfilCliente: roles.crearPerfilCliente,
        crearPerfilTecnico: roles.crearPerfilTecnico,
        disponibilidadTecnico: roles.disponibilidadTecnico,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <svg className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-gray-500 hover:text-gray-700">
              Inicia Sesión
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                  placeholder="Juan"
                />
              </div>
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <div className="mt-1 relative">
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                  placeholder="Pérez"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700">
                Tipo Documento
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                >
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="numDocumento" className="block text-sm font-medium text-gray-700">
                Número Documento
              </label>
              <div className="mt-1">
                <input
                  id="numDocumento"
                  name="numDocumento"
                  type="text"
                  required
                  value={formData.numDocumento}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                  placeholder="1234567890"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                value={formData.correo}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="celular" className="block text-sm font-medium text-gray-700">
              Celular
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="celular"
                name="celular"
                type="tel"
                required
                value={formData.celular}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                placeholder="3001234567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="contrasena"
                name="contrasena"
                type={mostrarPassword ? 'text' : 'password'}
                required
                value={formData.contrasena}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {mostrarPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmarContrasena"
                name="confirmarContrasena"
                type={mostrarPassword ? 'text' : 'password'}
                required
                value={formData.confirmarContrasena}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              ¿Cómo quieres usar la app?
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="crearPerfilCliente"
                  checked={roles.crearPerfilCliente}
                  onChange={handleRoleChange}
                  className="h-5 w-5 text-gray-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    <Briefcase className="inline h-4 w-4 mr-1" />
                    Soy Cliente
                  </span>
                  <span className="block text-sm text-gray-500">
                    Quiero contratar servicios técnicos
                  </span>
                </div>
              </label>

              <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="crearPerfilTecnico"
                  checked={roles.crearPerfilTecnico}
                  onChange={handleRoleChange}
                  className="h-5 w-5 text-gray-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    <Wrench className="inline h-4 w-4 mr-1" />
                    Soy Técnico
                  </span>
                  <span className="block text-sm text-gray-500">
                    Quiero ofrecer servicios técnicos
                  </span>
                </div>
              </label>

              {roles.crearPerfilTecnico && (
                <div className="ml-8 p-3 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="disponibilidadTecnico"
                      checked={roles.disponibilidadTecnico}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-gray-500 border-gray-300 rounded"
                    />
                    <label htmlFor="disponibilidadTecnico" className="ml-2 text-sm text-gray-700">
                      Estoy disponible ahora
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={cargando}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {cargando ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}