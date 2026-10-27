import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherMetrics {
  humidityPercent?: number | null;
  windSpeedKmh?: number | null;
  precipitationMm?: number | null;
  pressureHpa?: number | null;
}

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData & CurrentWeatherMetrics;
  unit: Unit;
}

function formatMetric(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherPresentation(current.weatherCode);
  const locationDetails = [city.region, city.country].filter(Boolean).join(', ');

  return (
    <section
      aria-labelledby={headingId}
      className="w-full rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md sm:p-6"
    >
      <header className="text-center">
        <h2 id={headingId} className="text-lg font-semibold">
          {city.name}
        </h2>
        {locationDetails && <p className="mt-1 text-sm text-white/65">{locationDetails}</p>}
        <div className="mt-5">
          <span aria-hidden="true" className="text-5xl leading-none">
            {condition.icon}
          </span>
          <p className="mt-3 text-base text-white/80">{condition.label}</p>
        </div>
        <p className="mt-4 text-5xl font-semibold tabular-nums sm:text-6xl">
          {formatTemperature(current.temperatureC, unit)}
        </p>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-white/60">Umidade</dt>
          <dd className="mt-1 text-sm font-medium">{formatMetric(current.humidityPercent, '%')}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/60">Vento</dt>
          <dd className="mt-1 text-sm font-medium">{formatMetric(current.windSpeedKmh, 'km/h')}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/60">Precipitação</dt>
          <dd className="mt-1 text-sm font-medium">
            {formatMetric(current.precipitationMm, 'mm')}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-white/60">Pressão</dt>
          <dd className="mt-1 text-sm font-medium">{formatMetric(current.pressureHpa, 'hPa')}</dd>
        </div>
      </dl>
    </section>
  );
}
