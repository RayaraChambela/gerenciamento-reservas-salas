const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function isValidTimeString(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

export function getLocalDateTimeParts(reference = new Date()) {
  return {
    date: `${reference.getFullYear()}-${pad(reference.getMonth() + 1)}-${pad(reference.getDate())}`,
    time: `${pad(reference.getHours())}:${pad(reference.getMinutes())}`,
  };
}

export function isPastSlot(date: string, endTime: string, reference = new Date()) {
  const now = getLocalDateTimeParts(reference);
  return date < now.date || (date === now.date && endTime <= now.time);
}

export function isCurrentOrFutureSlot(date: string, endTime: string, reference = new Date()) {
  return !isPastSlot(date, endTime, reference);
}
