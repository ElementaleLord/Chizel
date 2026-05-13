const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: 'auto',
});

const TIME_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
];

export function formatRelativeTime(value?: string | number | Date | null) {
  if (!value) {
    return 'recently';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);

  if (Math.abs(diffSeconds) < 45) {
    return 'just now';
  }

  for (const { unit, seconds } of TIME_UNITS) {
    if (Math.abs(diffSeconds) >= seconds || unit === 'second') {
      return relativeTimeFormatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }

  return 'recently';
}
