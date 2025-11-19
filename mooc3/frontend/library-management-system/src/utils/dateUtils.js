// normalize ISO datetime strings so dayjs can parse them reliably
export function normalizeIsoDatetime(isoStr, assumeUTC = false) {
  if (!isoStr) return null;
  let s = String(isoStr).trim();

  // If there is a fractional part longer than 3 digits, trim to milliseconds (3 digits)
  // e.g. .854534 -> .854
  s = s.replace(/\.(\d{3})\d+/, '.$1');

  // If there is a fractional part with <3 digits, pad to 3 digits (optional)
  s = s.replace(/\.(\d{1,2})(?!\d)/, (m, p1) => '.' + p1.padEnd(3, '0'));

  // If string has no timezone info (no Z or +hh:mm / -hh:mm), optionally append 'Z'
  // Only append when assumeUTC === true (avoid accidentally treating local time as UTC)
  if (assumeUTC && !/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) {
    s = s + 'Z';
  }

  return s;
}

import dayjs from 'dayjs';
export function parseToDayjsOrNull(dateStr, assumeUTC = false) {
  if (!dateStr) return null;
  const normalized = normalizeIsoDatetime(dateStr, assumeUTC);
  const d = dayjs(normalized);
  return d.isValid() ? d : null;
}

export function formatDateSafe(dateStr, format = 'DD/MM/YYYY HH:mm', assumeUTC = false) {
  const d = parseToDayjsOrNull(dateStr, assumeUTC);
  return d ? d.format(format) : null;
}