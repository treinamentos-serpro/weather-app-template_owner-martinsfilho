import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();

      const nextButton =
        event.target === celsiusButtonRef.current
          ? fahrenheitButtonRef.current
          : celsiusButtonRef.current;

      nextButton?.focus();
    }
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      onKeyDown={handleKeyDown}
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        onClick={() => onChange('celsius')}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 aria-pressed:bg-accent-500"
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        onClick={() => onChange('fahrenheit')}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 aria-pressed:bg-accent-500"
      >
        °F
      </button>
    </div>
  );
}
