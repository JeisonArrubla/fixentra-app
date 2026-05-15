import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServicio } from '../../contexts/ServicioContext';
import { serviciosApi, clientesApi } from '../../services/api';
import { NavigationButton, SubmitButton, CancelButton, PageHeader, FieldRow, FormContainer, ButtonContainer, PrecioBreakdown } from '../../components/common';
import toast from 'react-hot-toast';

interface DireccionInfo {
  id: string;
  direccion: string;
}

export function ConfirmarServicio() {
  const navigate = useNavigate();
  const { draft, clearDraft } = useServicio();
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
      enviarServicio();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [contadorActivo, segundosRestantes]);

  if (!draft.direccionId || !draft.descripcion) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <p className="text-gray-600 mb-4">No hay datos de servicio para confirmar.</p>
        <NavigationButton to="/cliente/servicios" text="Volver a servicios" />
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

  const enviarServicio = async () => {
    setContadorActivo(false);
    setEnviando(true);
    try {
      await serviciosApi.crear({
        direccionId: draft.direccionId,
        descripcion: draft.descripcion,
        imagenes: draft.imagenes,
        productoServicioId: draft.productoServicioId,
        cantidad: draft.cantidad,
        opciones: { retirarElemento: draft.retirarElemento },
        precioBase: draft.precioBase,
        subtotal: draft.subtotal,
        tarifaServicio: draft.tarifaServicio,
        total: draft.total,
      });
      clearDraft();
      toast.success('Servicio enviado correctamente');
      navigate('/cliente/servicios');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar servicio');
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <PageHeader title="Confirma los datos de tu solicitud" />

      <FormContainer className="bg-white rounded-lg shadow-sm border p-6">
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="space-y-4">
            <FieldRow
              label="Servicio"
              value={draft.productoNombre || draft.descripcion}
            />

            <FieldRow
              label="Dirección"
              value={direccion?.direccion || 'Cargando...'}
            />

            {draft.productoServicioId && (
              <>
                <FieldRow label="Cantidad" value={String(draft.cantidad)} />
                {draft.retirarElemento && (
                  <FieldRow label="Retirar elemento existente" value="Sí" />
                )}
              </>
            )}

            {draft.imagenes.length > 0 && (
              <FieldRow label="Imágenes Adjuntas">
                <div className="grid grid-cols-2 gap-2">
                  {draft.imagenes.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Imagen ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ))}
                </div>
              </FieldRow>
            )}
          </div>
        </div>

        {draft.productoServicioId && draft.total !== undefined && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 border">
            <h3 className="font-semibold text-gray-800 mb-3">Resumen de precios</h3>
            <PrecioBreakdown
              subtotal={draft.subtotal!}
              tarifaServicio={draft.tarifaServicio!}
              total={draft.total!}
            />
          </div>
        )}

        <ButtonContainer>
          <NavigationButton
            to={`/cliente/servicios/nuevo/${draft.productoSlug}/calcular`}
            text="Editar"
          />
          {contadorActivo ? (
            <CancelButton
              text={`Cancelar (${segundosRestantes}s)`}
              onClick={cancelarEnvio}
            />
          ) : (
            <SubmitButton
              text="Solicitar servicio"
              onClick={iniciarConteo}
              loading={enviando}
            />
          )}
        </ButtonContainer>
      </FormContainer>
    </div>
  );
}
