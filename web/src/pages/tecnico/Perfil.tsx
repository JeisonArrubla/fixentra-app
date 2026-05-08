import { useState, useEffect } from 'react';
import { tecnicosApi } from '../../services/api';
import { TecnicoStats } from '../../components/tecnico/TecnicoStats';
import { Loader, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, FieldRow, FormContainer } from '../../components/common';

interface TecnicoPerfil {
  id: string;
  nivel: string;
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

const NIVEL_COLORS: Record<string, string> = {
  ORO: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  PLATA: 'bg-gray-100 text-gray-800 border-gray-400',
  BRONCE: 'bg-orange-100 text-orange-800 border-orange-400',
  MADERA: 'bg-amber-100 text-amber-800 border-amber-600',
};

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

      <FormContainer>
        <div className="space-y-4">
          <FieldRow label="Nombre completo" value={`${perfil.usuario.nombre} ${perfil.usuario.apellido}`} />
          <FieldRow label="Correo electrónico" value={perfil.usuario.correo} />
          <FieldRow label="Celular" value={perfil.usuario.celular} />
          <FieldRow label="Documento" value={`${perfil.usuario.tipoDocumento}: ${perfil.usuario.numDocumento}`} />
          <FieldRow
            label="Estado de disponibilidad"
            action={
              <button
                onClick={toggleDisponibilidad}
                disabled={actualizando}
                className={`px-4 py-2 rounded-md flex items-center ${perfil.disponibilidad
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-50`}
              >
                {actualizando ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : perfil.disponibilidad ? (
                  <>
                    <ToggleRight className="h-8 w-8 mr-4" strokeWidth={1} />
                    Disponible
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-8 w-8 mr-4" strokeWidth={1} />
                    No disponible
                  </>
                )}
              </button>
            }
          />
          <FieldRow
            label="Nivel"
            action={
              <span className={`px-3 py-1 rounded-full border text-sm font-semibold ${NIVEL_COLORS[perfil.nivel] || 'bg-gray-100 text-gray-800 border-gray-400'}`}>
                {perfil.nivel}
              </span>
            }
          />
          <FieldRow
            label='Calificación promedio'
            action={
              <TecnicoStats
                promedioCalificacion={perfil.promedioCalificacion}
                totalCalificaciones={perfil.totalCalificaciones}
                size={20}
              />
            }
          />
        </div>
      </FormContainer>
    </div>
  );
}
