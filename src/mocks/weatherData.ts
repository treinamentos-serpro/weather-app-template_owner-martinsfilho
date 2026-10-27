import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: '3448439',
    name: 'São Paulo',
    region: 'São Paulo',
    country: 'Brasil',
    latitude: -23.5475,
    longitude: -46.6361,
  },
  timeZone: 'America/Sao_Paulo',
  current: {
    temperatureC: 20.5,
    weatherCode: 2,
    validAt: '2026-10-27T12:00:00Z',
  },
  forecast: [
    {
      date: '2026-10-27',
      minTemperatureC: 15,
      maxTemperatureC: 25,
      weatherCode: 2,
    },
    {
      date: '2026-10-28',
      minTemperatureC: 16,
      maxTemperatureC: 26,
      weatherCode: 3,
    },
    {
      date: '2026-10-29',
      minTemperatureC: 17,
      maxTemperatureC: 27,
      weatherCode: 61,
    },
    {
      date: '2026-10-30',
      minTemperatureC: 16,
      maxTemperatureC: 24,
      weatherCode: 2,
    },
    {
      date: '2026-10-31',
      minTemperatureC: 15,
      maxTemperatureC: 23,
      weatherCode: 0,
    },
  ],
  consultedAt: '2026-10-27T12:05:00Z',
};
