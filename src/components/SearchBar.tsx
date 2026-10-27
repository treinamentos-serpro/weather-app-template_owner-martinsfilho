import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled: boolean;
}

export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [city, setCity] = useState('');
  const inputId = useId();
  const trimmedCity = city.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled || trimmedCity.length === 0) {
      return;
    }

    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-busy={disabled}
      onSubmit={handleSubmit}
      className="w-full rounded-lg border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md"
    >
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-white">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          type="search"
          disabled={disabled}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: São Paulo"
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-night-800/80 px-3 py-2 text-white placeholder:text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || trimmedCity.length === 0}
          className="rounded-md bg-accent-400 px-5 py-2 font-medium text-night-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
