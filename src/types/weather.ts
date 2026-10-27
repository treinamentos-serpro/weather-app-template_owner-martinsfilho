export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: string;
  name: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  validAt: string | null;
}

export interface ForecastDay {
  date: string;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  weatherCode: number | null;
}

export interface WeatherData {
  city: City;
  timeZone: string;
  current: CurrentWeather;
  forecast: readonly ForecastDay[];
  consultedAt: string;
}
