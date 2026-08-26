const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export function requiredString(value: unknown, max = 500): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : null;
}

// Absent, empty, or non-string values become null; over-long values are truncated
// rather than rejected so an optional field can never sink a whole submission.
export function optionalString(value: unknown, max = 500): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export function isEmail(value: string): boolean {
  return value.length <= 320 && EMAIL_RE.test(value);
}

export function isYmdDate(value: string): boolean {
  return DATE_RE.test(value);
}

export function isHmTime(value: string): boolean {
  return TIME_RE.test(value);
}

export function isIsoInstant(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
