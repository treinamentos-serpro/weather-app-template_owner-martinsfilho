import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

export interface ForecastCardData extends ForecastDay {
  precipitationProbabilityPercent?: number | null;
}

interface ForecastCardProps {
  day: ForecastCardData;
  unit: Unit;
}

function formatProbability(value: number | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    return 'Indisponível';
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const condition = getWeatherPresentation(day.weatherCode);

  return (
    <article className="h-full rounded-lg border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md">
      <h3 className="break-words text-sm font-semibold capitalize text-white">
        {formatDayLabel(day.date)}
      </h3>
      <div className="mt-4 text-center">
        <span aria-hidden="true" className="text-4xl leading-none">
          {condition.icon}
        </span>
        <p className="mt-2 min-h-10 break-words text-sm text-white/80">{condition.label}</p>
      </div>
      <dl className="mt-4 flex items-baseline justify-between gap-2 border-t border-white/10 pt-3">
        <div>
          <dt className="text-xs text-white/60">Máx.</dt>
          <dd className="mt-1 break-words text-sm font-semibold tabular-nums">
            {formatTemperature(day.maxTemperatureC, unit)}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-white/60">Mín.</dt>
          <dd className="mt-1 break-words text-sm tabular-nums text-white/85">
            {formatTemperature(day.minTemperatureC, unit)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 break-words border-t border-white/10 pt-3 text-xs text-white/80">
        Chuva: {formatProbability(day.precipitationProbabilityPercent)}
      </p>
    </article>
  );
}
