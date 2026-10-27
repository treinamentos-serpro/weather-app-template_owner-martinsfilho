import type { Unit } from '../types/weather';
import ForecastCard, { type ForecastCardData } from './ForecastCard';

interface ForecastListProps {
  days: readonly ForecastCardData[];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  return (
    <section aria-label="Previsão para os próximos dias">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {days.map((day) => (
          <li key={day.date} className="min-w-0">
            <ForecastCard day={day} unit={unit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
