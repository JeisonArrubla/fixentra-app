import { StarRating } from '../common/StarRating';

interface TecnicoStatsProps {
  promedioCalificacion: number;
  totalCalificaciones: number;
  totalServiciosCompletados: number;
  size?: number;
}

export function TecnicoStats({
  promedioCalificacion,
  totalCalificaciones,
  totalServiciosCompletados,
  size = 24,
}: TecnicoStatsProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputación</h3>
      <div className="flex items-center space-x-4">
        <StarRating value={promedioCalificacion} readonly size={size} />
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {promedioCalificacion.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">
            {totalCalificaciones} calificación(es)
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {totalServiciosCompletados} servicios completados
      </p>
    </div>
  );
}
