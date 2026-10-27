import type { City } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapGeocodingResult(result: unknown): City | null {
  if (!isRecord(result)) {
    return null;
  }

  const name = typeof result.name === 'string' ? result.name.trim() : '';
  const latitude = result.latitude;
  const longitude = result.longitude;

  if (
    name.length === 0 ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  const providerId = result.id;
  const id =
    typeof providerId === 'number' && Number.isFinite(providerId)
      ? String(providerId)
      : `coordinates:${latitude},${longitude}`;

  return {
    id,
    name,
    region: typeof result.admin1 === 'string' ? result.admin1 : null,
    country: typeof result.country === 'string' ? result.country : null,
    latitude,
    longitude,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha ao buscar cidades (HTTP ${response.status}).`,
      response.status,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError('A resposta de geocoding não contém JSON válido.');
  }

  if (!isRecord(payload)) {
    throw new WeatherServiceError('A resposta de geocoding tem formato inválido.');
  }

  if (!('results' in payload)) {
    return [];
  }

  if (!Array.isArray(payload.results)) {
    throw new WeatherServiceError('A lista de resultados de geocoding é inválida.');
  }

  if (payload.results.length === 0) {
    return [];
  }

  const cities = payload.results
    .map(mapGeocodingResult)
    .filter((city): city is City => city !== null)
    .slice(0, 10);

  if (cities.length === 0) {
    throw new WeatherServiceError('A resposta de geocoding não contém cidades válidas.');
  }

  return cities;
}
