import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const testCity: City = {
  id: '3448439',
  name: 'São Paulo',
  region: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5475,
  longitude: -46.6361,
};

const currentTime = '2026-10-27T12:00:00Z';
const forecastDates = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'];

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function forecastPayload() {
  return {
    timezone: 'UTC',
    utc_offset_seconds: 0,
    current: {
      time: currentTime,
      temperature_2m: 20.5,
      weather_code: 2,
    },
    daily: {
      time: forecastDates,
      temperature_2m_min: [15, 16, 17, 16, 15],
      temperature_2m_max: [25, 26, 27, 24, 23],
      weather_code: [2, 3, 61, 2, 0],
      precipitation_probability_max: [15, null, 35, 45, 55],
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchCities', () => {
  it('returns an empty list for a blank name without calling fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  \t ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps geocoding results to City values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            admin1: 'São Paulo',
            country: 'Brasil',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo & região')).resolves.toEqual([
      {
        id: '3448439',
        name: 'São Paulo',
        region: 'São Paulo',
        country: 'Brasil',
        latitude: -23.5475,
        longitude: -46.6361,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      'name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o',
    );
  });

  it('returns an empty list when results is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ result_count: 0 })));

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError for a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 503)));

    await expect(searchCities('Recife')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      status: 503,
    });
  });
});

describe('getWeather', () => {
  it('maps current and five daily entries, defaulting null precipitation probability to zero', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(currentTime));
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(forecastPayload()));
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(testCity);

    expect(weather.current).toEqual({
      temperatureC: 20.5,
      weatherCode: 2,
      validAt: '2026-10-27T12:00:00.000Z',
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast.map((day) => day.date)).toEqual(forecastDates);
    expect(weather.forecast[1].precipitationProbabilityPercent).toBe(0);
    expect(weather.forecast[2].precipitationProbabilityPercent).toBe(35);
    expect(String(fetchMock.mock.calls[0][0])).toContain('precipitation_probability_max');
  });

  it.each([
    'current',
    'daily',
  ] as const)('throws WeatherServiceError when %s is absent', async (missingField) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(currentTime));
    const payload = forecastPayload();
    delete payload[missingField];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(payload)));

    await expect(getWeather(testCity)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
