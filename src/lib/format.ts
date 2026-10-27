function parseLocalDate(localDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatDayLabel(localDate: string, forecastIndex?: number): string {
  const date = parseLocalDate(localDate);

  if (date === null) {
    return 'Data indisponível';
  }

  if (forecastIndex === 0) {
    return 'Hoje';
  }

  if (forecastIndex === 1) {
    return 'Amanhã';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function getShortDate(localDate: string): string {
  const date = parseLocalDate(localDate);

  if (date === null) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}
