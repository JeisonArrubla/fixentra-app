import { useState, useEffect } from 'react';
import { tecnicosApi } from '../../services/api';
import { TecnicoStats } from '../../components/tecnico/TecnicoStats';
import { MapPin, User, Loader, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, FieldRow } from '../../components/common';

interface TecnicoPerfil {
  id: string;
  disponibilidad: boolean;
  latitud?: number;
  longitud?: number;
  radioCoberturaKm: number;
  createdAt: string;
  updatedAt: string;
  usuario: {
    nombre: string;
    apellido: string;
    correo: string;
    celular: string;
    tipoDocumento: string;
    numDocumento: string;
  };
  promedioCalificacion: number;
  totalCalificaciones: number;
  totalServiciosCompletados: number;
}

export function TecnicoPerfil() {
  const [perfil, setPerfil] = useState<TecnicoPerfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const { data } = await tecnicosApi.getPerfil();
      setPerfil(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar el perfil');
    } finally {
      setCargando(false);
    }
  };

  const toggleDisponibilidad = async () => {
    if (!perfil) return;
    
    setActualizando(true);
    try {
      await tecnicosApi.toggleDisponibilidad(!perfil.disponibilidad);
      toast.success(
        !perfil.disponibilidad 
          ? 'Ahora estás disponible' 
          : 'Ahora estás en offline'
      );
      cargarPerfil();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar disponibilidad');
    } finally {
      setActualizando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">Perfil no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <PageHeader title="Mi Perfil" />

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Información Personal */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-500" />
            Información Personal
          </h2>
          <div className="space-y-3">
            <FieldRow label="Nombre completo" value={`${perfil.usuario.nombre} ${perfil.usuario.apellido}`} />
            <FieldRow label="Correo electrónico" value={perfil.usuario.correo} />
            <FieldRow label="Celular" value={perfil.usuario.celular} />
            <FieldRow label="Documento" value={`${perfil.usuario.tipoDocumento}: ${perfil.usuario.numDocumento}`} />
          </div>
        </section>

        {/* Información de Técnico */}
        <section className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            Información de Técnico
          </h2>
          <div className="space-y-3">
            <FieldRow
              label="Estado de disponibilidad"
              action={
                <button
                  onClick={toggleDisponibilidad}
                  disabled={actualizando}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    perfil.disponibilidad
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {actualizando ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : perfil.disponibilidad ? (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Disponible
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      No Disponible
                    </>
                  )}
                </button>
              }
            />
            {perfil.latitud && perfil.longitud && (
              <FieldRow
                label="Ubicación actual"
                value={`${perfil.latitud.toFixed(4)}, ${perfil.longitud.toFixed(4)}`}
              />
            )}
          </div>
        </section>

        {/* Reputación */}
        <section className="border-t pt-6">
          <TecnicoStats
            promedioCalificacion={perfil.promedioCalificacion}
            totalCalificaciones={perfil.totalCalificaciones}
            totalServiciosCompletados={perfil.totalServiciosCompletados}
            size={32}
          />
        </section>
      </div>
    </div>
  );
}
