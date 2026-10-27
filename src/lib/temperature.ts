import type { Unit } from '../types/weather';

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: false,
});

function roundToOneDecimal(value: number): number {
  const magnitude = Math.abs(value);
  const roundedMagnitude = Math.round(
    magnitude * 10 + Number.EPSILON * Math.max(1, magnitude * 10),
  );
  const roundedValue = Math.sign(value) * (roundedMagnitude / 10);

  return Object.is(roundedValue, -0) ? 0 : roundedValue;
}

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return 'Indisponível';
  }

  const convertedValue = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  const unitLabel = unit === 'fahrenheit' ? '°F' : '°C';

  return `${numberFormatter.format(roundToOneDecimal(convertedValue))} ${unitLabel}`;
}
