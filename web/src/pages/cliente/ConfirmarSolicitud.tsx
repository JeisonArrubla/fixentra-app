import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSolicitud } from '../../contexts/SolicitudContext';
import { solicitudesApi, clientesApi } from '../../services/api';
import { BackButton, SubmitButton, CancelButton } from '../../components/common';
import { MapPin, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DireccionInfo {
  id: string;
  direccion: string;
}

export function ConfirmarSolicitud() {
  const navigate = useNavigate();
  const { draft, clearDraft } = useSolicitud();
  const [direccion, setDireccion] = useState<DireccionInfo | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [contadorActivo, setContadorActivo] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(5);

  useEffect(() => {
    if (draft.direccionId) {
      clientesApi.getDirecciones().then(res => {
        const dir = res.data.find((d: DireccionInfo) => d.id === draft.direccionId);
        if (dir) setDireccion(dir);
      });
    }
  }, [draft.direccionId]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (contadorActivo && segundosRestantes > 0) {
      timer = setTimeout(() => {
        setSegundosRestantes(segundosRestantes - 1);
      }, 1000);
    } else if (contadorActivo && segundosRestantes === 0) {
      enviarSolicitud();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [contadorActivo, segundosRestantes]);

  if (!draft.direccionId || !draft.descripcion) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-gray-600 mb-4">No hay datos de solicitud para confirmar.</p>
        <BackButton to="/cliente/solicitudes" text="Volver a solicitudes" />
      </div>
    );
  }

  const iniciarConteo = () => {
    setContadorActivo(true);
    setSegundosRestantes(5);
  };

  const cancelarEnvio = () => {
    setContadorActivo(false);
    setSegundosRestantes(5);
  };

  const enviarSolicitud = async () => {
    setContadorActivo(false);
    setEnviando(true);
    try {
      await solicitudesApi.crear({
        direccionId: draft.direccionId,
        descripcion: draft.descripcion,
        imagenes: draft.imagenes,
      });
      clearDraft();
      toast.success('Solicitud enviada correctamente');
      navigate('/cliente/solicitudes');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar solicitud');
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <BackButton to="/cliente/solicitudes" text="Regresar" />

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Confirma los datos de tu solicitud
        </h1>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            Detalles del servicio solicitado
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
              <div className="flex items-start mt-1">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <p className="text-gray-900">
                  {direccion?.direccion || 'Cargando...'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Descripción del servicio
              </h3>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                {draft.descripcion}
              </p>
            </div>

            {draft.imagenes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Imágenes Adjuntas
                </h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {draft.imagenes.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Imagen ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          {contadorActivo ? (
            <CancelButton
              text={`Cancelar (${segundosRestantes}s)`}
              onClick={cancelarEnvio}
              icon={<XCircle className="h-5 w-5" />}
            />
          ) : (
            <SubmitButton
              text="Enviar Solicitud"
              onClick={iniciarConteo}
              loading={enviando}
              icon={<Clock className="h-5 w-5" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}