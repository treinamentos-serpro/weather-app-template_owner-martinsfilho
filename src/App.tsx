import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import { formatDayLabel } from './lib/format';
import type { Unit } from './types/weather';

function formatInstant(value: string | null, timeZone: string): string {
  if (value === null) {
    return 'Indisponível';
  }

  const instant = new Date(value);

  if (Number.isNaN(instant.getTime())) {
    return 'Indisponível';
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
    }).format(instant);
  } catch {
    return 'Indisponível';
  }
}

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, query, search, retry } = useWeather();
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8 lg:px-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-accent-400/30 bg-accent-500/15 text-lg font-bold text-accent-400"
            >
              C
            </span>
            <div>
              <p className="text-lg font-semibold leading-tight">Clima</p>
              <p className="mt-1 text-xs text-white/55">BRASIL</p>
            </div>
          </div>

          <SearchBar onSearch={(name) => void search(name)} disabled={isLoading} />
          <div className="flex justify-end">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h1 className="text-xl font-semibold sm:text-2xl">Previsão do tempo</h1>

        {status === 'idle' && (
          <EmptyState title="Nenhuma cidade selecionada" hint="A previsão aparecerá aqui." />
        )}

        {status === 'loading' && <LoadingState message={`Consultando ${query}...`} />}

        {status === 'empty' && (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Nenhum resultado para “${query}”.`}
          />
        )}

        {status === 'error' && error !== null && (
          <ErrorState message={error} onRetry={() => void retry()} />
        )}

        {status === 'success' && data !== null && (
          <>
            <CurrentWeather city={data.city} current={data.current} unit={unit} />

            <section aria-labelledby="forecast-heading" className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="forecast-heading" className="text-lg font-semibold">
                  Próximos dias
                </h2>
                <p className="text-sm text-white/60">
                  {data.forecast.length > 0
                    ? `${formatDayLabel(data.forecast[0].date)} a ${formatDayLabel(data.forecast[data.forecast.length - 1].date)}`
                    : 'Período indisponível'}
                </p>
              </div>
              <ForecastList days={data.forecast} unit={unit} />
            </section>

            <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-xs text-white/55">
              <div className="flex gap-1.5">
                <dt>Válido em</dt>
                <dd>{formatInstant(data.current.validAt, data.timeZone)}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Consultado em</dt>
                <dd>{formatInstant(data.consultedAt, data.timeZone)}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>Fuso</dt>
                <dd>{data.timeZone}</dd>
              </div>
            </dl>
          </>
        )}
      </main>
    </div>
  );
}
