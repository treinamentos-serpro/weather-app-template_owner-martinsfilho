import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %i °C to %i °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('returns the original value when Celsius is selected', () => {
    expect(convertTemperature(18.75, 'celsius')).toBe(18.75);
  });

  it('converts to Fahrenheit without rounding the numeric result', () => {
    expect(convertTemperature(1.25, 'fahrenheit')).toBe(34.25);
  });
});

describe('formatTemperature', () => {
  it.each([
    [20, 'celsius', '20,0 °C'],
    [0, 'fahrenheit', '32,0 °F'],
    [100, 'fahrenheit', '212,0 °F'],
    [-40, 'fahrenheit', '-40,0 °F'],
    [20.25, 'celsius', '20,3 °C'],
    [-1.25, 'celsius', '-1,3 °C'],
  ] as const)('formats %s °C in %s as %s', (celsius, unit, expected) => {
    expect(formatTemperature(celsius, unit)).toBe(expected);
  });

  it('shows missing temperatures without a unit', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(Number.NaN, 'fahrenheit')).toBe('Indisponível');
  });
});

describe('unitLabel', () => {
  it('returns the Celsius symbol', () => {
    expect(unitLabel('celsius')).toBe('°C');
  });

  it('returns the Fahrenheit symbol', () => {
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
