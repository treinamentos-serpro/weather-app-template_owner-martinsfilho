import { useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

interface WeatherHookState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

type LastOperation = { kind: 'search'; name: string } | { kind: 'selectCity'; city: City };

const initialState: WeatherHookState = {
  status: 'idle',
  data: null,
  cities: [],
  error: null,
  query: '',
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível carregar o clima.';
}

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherHookState>(initialState);
  const requestIdRef = useRef(0);
  const lastOperationRef = useRef<LastOperation | null>(null);

  async function performSearch(name: string): Promise<void> {
    const requestId = ++requestIdRef.current;
    const normalizedName = name.trim();
    let foundCities: City[] = [];

    setState({
      status: 'loading',
      data: null,
      cities: [],
      error: null,
      query: normalizedName,
    });

    try {
      foundCities = await searchCities(normalizedName);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (foundCities.length === 0) {
        setState({
          status: 'empty',
          data: null,
          cities: [],
          error: null,
          query: normalizedName,
        });
        return;
      }

      setState({
        status: 'loading',
        data: null,
        cities: foundCities,
        error: null,
        query: normalizedName,
      });

      const data = await getWeather(foundCities[0]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'success',
        data,
        cities: foundCities,
        error: null,
        query: normalizedName,
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'error',
        data: null,
        cities: foundCities,
        error: getErrorMessage(error),
        query: normalizedName,
      });
    }
  }

  async function performCitySelection(city: City): Promise<void> {
    const requestId = ++requestIdRef.current;

    setState({
      status: 'loading',
      data: null,
      cities: [city],
      error: null,
      query: city.name,
    });

    try {
      const data = await getWeather(city);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'success',
        data,
        cities: [city],
        error: null,
        query: city.name,
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: 'error',
        data: null,
        cities: [city],
        error: getErrorMessage(error),
        query: city.name,
      });
    }
  }

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();
    lastOperationRef.current = { kind: 'search', name: normalizedName };
    await performSearch(normalizedName);
  }

  async function selectCity(city: City): Promise<void> {
    lastOperationRef.current = { kind: 'selectCity', city };
    await performCitySelection(city);
  }

  async function retry(): Promise<void> {
    const lastOperation = lastOperationRef.current;

    if (lastOperation?.kind === 'search') {
      await performSearch(lastOperation.name);
    } else if (lastOperation?.kind === 'selectCity') {
      await performCitySelection(lastOperation.city);
    }
  }

  return {
    ...state,
    search,
    selectCity,
    retry,
  };
}
