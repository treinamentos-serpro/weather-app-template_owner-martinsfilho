import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface TimedFetchResult {
  response: Response;
  payload: unknown;
}

async function fetchWithTimeout(url: string): Promise<TimedFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      return { response, payload: undefined };
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch (error) {
      const errorName =
        typeof error === 'object' && error !== null && 'name' in error ? error.name : null;

      if (controller.signal.aborted || errorName === 'AbortError') {
        throw new WeatherServiceError('A requisição demorou demais.');
      }

      throw new WeatherServiceError('A resposta da API não contém JSON válido.');
    }

    return { response, payload };
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      throw error;
    }

    const errorName =
      typeof error === 'object' && error !== null && 'name' in error ? error.name : null;

    if (controller.signal.aborted || errorName === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }

    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
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

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function isValidLocalDate(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText] = match;
  const date = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));

  return (
    date.getUTCFullYear() === Number(yearText) &&
    date.getUTCMonth() === Number(monthText) - 1 &&
    date.getUTCDate() === Number(dayText)
  );
}

function getLocalDate(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function addCalendarDays(localDate: string, days: number): string {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

function parseCurrentTime(value: unknown, utcOffsetSeconds: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const explicitOffset = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  if (explicitOffset) {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
  }

  const localTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/.exec(
    value,
  );

  if (!localTime || typeof utcOffsetSeconds !== 'number' || !Number.isFinite(utcOffsetSeconds)) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = '0', fraction = '0'] =
    localTime;
  const parts = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const [year, month, day, hour, minute, second] = parts;
  const localAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    Number(`0.${fraction}`) * 1000,
  );
  const normalizedLocal = new Date(localAsUtc);

  if (
    normalizedLocal.getUTCFullYear() !== year ||
    normalizedLocal.getUTCMonth() !== month - 1 ||
    normalizedLocal.getUTCDate() !== day ||
    normalizedLocal.getUTCHours() !== hour ||
    normalizedLocal.getUTCMinutes() !== minute ||
    normalizedLocal.getUTCSeconds() !== second
  ) {
    return null;
  }

  return new Date(localAsUtc - utcOffsetSeconds * 1000).toISOString();
}

function mapForecastDay(
  date: string,
  minimum: unknown,
  maximum: unknown,
  weatherCode: unknown,
): ForecastDay {
  let minTemperatureC = finiteNumber(minimum);
  let maxTemperatureC = finiteNumber(maximum);

  if (minTemperatureC !== null && maxTemperatureC !== null && minTemperatureC > maxTemperatureC) {
    minTemperatureC = null;
    maxTemperatureC = null;
  }

  return {
    date,
    minTemperatureC,
    maxTemperatureC,
    weatherCode: finiteNumber(weatherCode),
  };
}

function normalizeForecastDays(daily: Record<string, unknown>, now: Date, timeZone: string) {
  const firstDate = getLocalDate(now, timeZone);
  const dates = Array.from({ length: 5 }, (_, index) => addCalendarDays(firstDate, index));
  const dateSet = new Set(dates);
  const sourceDates = Array.isArray(daily.time) ? daily.time : [];
  const minimums = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
  const maximums = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  const weatherCodes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const normalizedByDate = new Map<string, ForecastDay>();
  const duplicateDates = new Set<string>();

  sourceDates.forEach((sourceDate: unknown, index: number) => {
    if (!isValidLocalDate(sourceDate) || !dateSet.has(sourceDate)) {
      return;
    }

    if (normalizedByDate.has(sourceDate)) {
      duplicateDates.add(sourceDate);
      normalizedByDate.delete(sourceDate);
      return;
    }

    if (duplicateDates.has(sourceDate)) {
      return;
    }

    normalizedByDate.set(
      sourceDate,
      mapForecastDay(sourceDate, minimums[index], maximums[index], weatherCodes[index]),
    );
  });

  return dates.map((date) => normalizedByDate.get(date) ?? mapForecastDay(date, null, null, null));
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;
  const { response, payload } = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha ao buscar cidades (HTTP ${response.status}).`,
      response.status,
    );
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

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'temperature_2m_min,temperature_2m_max,weather_code',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
    timeformat: 'iso8601',
  });
  const { response, payload } = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha ao consultar a previsão (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
    throw new WeatherServiceError('A resposta de forecast está incompleta.');
  }

  if (!isValidTimeZone(payload.timezone)) {
    throw new WeatherServiceError('A resposta de forecast não contém um fuso horário válido.');
  }

  const consultedAt = new Date();
  const currentSource = payload.current;
  const currentValidAt = parseCurrentTime(currentSource.time, payload.utc_offset_seconds);
  const currentTimestamp = currentValidAt === null ? Number.NaN : Date.parse(currentValidAt);
  const ageInMilliseconds = consultedAt.getTime() - currentTimestamp;
  const currentIsFresh =
    Number.isFinite(currentTimestamp) &&
    ageInMilliseconds <= 3 * 60 * 60 * 1000 &&
    ageInMilliseconds >= -5 * 60 * 1000;

  const current: CurrentWeather = {
    temperatureC: currentIsFresh ? finiteNumber(currentSource.temperature_2m) : null,
    weatherCode: finiteNumber(currentSource.weather_code),
    validAt: currentIsFresh ? currentValidAt : null,
  };

  return {
    city,
    timeZone: payload.timezone,
    current,
    forecast: normalizeForecastDays(payload.daily, consultedAt, payload.timezone),
    consultedAt: consultedAt.toISOString(),
  };
}
