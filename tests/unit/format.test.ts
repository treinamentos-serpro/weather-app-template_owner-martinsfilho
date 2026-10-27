import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('labels forecast index zero as today', () => {
    expect(formatDayLabel('2026-10-27', 0)).toBe('Hoje');
  });

  it('labels forecast index one as tomorrow', () => {
    expect(formatDayLabel('2026-10-28', 1)).toBe('Amanhã');
  });

  it('formats later forecast indexes with the weekday and date', () => {
    expect(formatDayLabel('2026-10-29', 2)).toBe('quinta-feira, 29/10');
    expect(formatDayLabel('2026-10-29', 4)).toBe('quinta-feira, 29/10');
  });

  it('returns an unavailable label for invalid local dates', () => {
    expect(formatDayLabel('2026-02-30', 0)).toBe('Data indisponível');
  });
});

describe('getShortDate', () => {
  it('formats a valid local date as day/month', () => {
    expect(getShortDate('2026-10-27')).toBe('27/10');
  });

  it('returns an unavailable label for invalid local dates', () => {
    expect(getShortDate('2026-13-01')).toBe('Data indisponível');
  });
});
