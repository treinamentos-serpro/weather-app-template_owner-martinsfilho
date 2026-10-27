import { describe, expect, it } from 'vitest';
import { getWeatherPresentation } from '../../src/lib/weatherCodes';

describe('getWeatherPresentation', () => {
  it('maps a known weather code to its label and icon', () => {
    expect(getWeatherPresentation(0)).toEqual({ label: 'Céu limpo', icon: '☀️' });
  });

  it('uses the fallback for unknown or missing weather codes', () => {
    const fallback = { label: 'Condição indisponível', icon: '—' };

    expect(getWeatherPresentation(999)).toEqual(fallback);
    expect(getWeatherPresentation(null)).toEqual(fallback);
  });
});
