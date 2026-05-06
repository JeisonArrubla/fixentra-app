import { StarRating } from '../common/StarRating';

interface TecnicoStatsProps {
  promedioCalificacion: number;
  totalCalificaciones: number;
  size?: number;
}

export function TecnicoStats({
  promedioCalificacion,
  totalCalificaciones,
  size = 24,
}: TecnicoStatsProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <StarRating value={promedioCalificacion} readonly size={size} />
      <div className="text-center">
        <p className="text-2xl text-gray-900">
          {promedioCalificacion.toFixed(1)}
        </p>
        <p className="text-sm text-gray-600">
          Servicios calificados: {totalCalificaciones}
        </p>
      </div>
    </div>
  );
}
