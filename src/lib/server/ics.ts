const CRLF = '\r\n';

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// RFC 5545 3.1: content lines over 75 octets fold onto continuation lines that
// begin with a single space.
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  parts.push(` ${rest}`);
  return parts.join(CRLF);
}

function icsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

// METHOD:PUBLISH for confirmations (adds the event without RSVP semantics, which
// need ORGANIZER/ATTENDEE plumbing); METHOD:CANCEL with the same UID and a bumped
// SEQUENCE lets calendars drop the event on cancellation.
export function buildInviteIcs(opts: {
  uid: string;
  startsAtUtc: string;
  endsAtUtc: string;
  summary: string;
  description: string;
  location?: string;
  cancelled?: boolean;
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SLO Web Design//Booking//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${opts.cancelled ? 'CANCEL' : 'PUBLISH'}`,
    'BEGIN:VEVENT',
    `UID:${opts.uid}@slowebdesign.com`,
    `DTSTAMP:${icsUtc(new Date().toISOString())}`,
    `DTSTART:${icsUtc(opts.startsAtUtc)}`,
    `DTEND:${icsUtc(opts.endsAtUtc)}`,
    `SUMMARY:${escapeText(opts.summary)}`,
    `DESCRIPTION:${escapeText(opts.description)}`,
    ...(opts.location ? [`LOCATION:${escapeText(opts.location)}`] : []),
    `STATUS:${opts.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
    `SEQUENCE:${opts.cancelled ? '1' : '0'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join(CRLF) + CRLF;
}
