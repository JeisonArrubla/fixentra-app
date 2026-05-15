interface PrecioExtra {
  label: string;
  precio: number;
}

interface PrecioBreakdownProps {
  precioBase?: number;
  cantidad?: number;
  subtotal: number;
  tarifaServicio: number;
  total: number;
  showFull?: boolean;
  extras?: PrecioExtra[];
  notaInformativa?: string | null;
}

export const TARIFA_LABEL = 'Tarifa de servicio (8%)';

const formatPrecio = (val?: number) =>
  val !== undefined ? `$${val.toLocaleString('es-CO')}` : null;

export function PrecioBreakdown({
  precioBase,
  cantidad,
  subtotal,
  tarifaServicio,
  total,
  showFull = false,
  extras,
  notaInformativa,
}: PrecioBreakdownProps) {
  return (
    <div className="space-y-2 text-sm">
      {showFull && precioBase !== undefined && (
        <div className="flex justify-between">
          <span className="text-gray-600">Precio unitario</span>
          <span>{formatPrecio(precioBase)}</span>
        </div>
      )}
      {showFull && cantidad !== undefined && (
        <div className="flex justify-between">
          <span className="text-gray-600">Cantidad</span>
          <span>{cantidad}</span>
        </div>
      )}
      <div className="flex justify-between font-medium">
        <span>Subtotal</span>
        <span>{formatPrecio(subtotal)}</span>
      </div>
      {extras?.map((extra, idx) => (
        <div key={idx} className="flex justify-between text-orange-600">
          <span>{extra.label}</span>
          <span>+{formatPrecio(extra.precio)}</span>
        </div>
      ))}
      <div className="flex justify-between text-gray-600">
        <span>{TARIFA_LABEL}</span>
        <span>{formatPrecio(tarifaServicio)}</span>
      </div>
      <hr className="my-2" />
      <div className="flex justify-between text-lg font-bold text-green-700">
        <span>Total</span>
        <span>{formatPrecio(total)}</span>
      </div>
      {notaInformativa && (
        <p className="mt-3 text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
          {notaInformativa}
        </p>
      )}
    </div>
  );
}
