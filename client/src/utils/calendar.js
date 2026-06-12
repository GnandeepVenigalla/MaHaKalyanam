// Utility to generate and download a .ics (iCalendar) file for an event
// Exports: downloadICS(event)
// event = { title, description, location, start, end }
// start/end must be strings in YYYYMMDDTHHMMSS format (local America/New_York values)

function escapeICalText(str = '') {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

function formatDTStamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return date.getUTCFullYear()
    + pad(date.getUTCMonth() + 1)
    + pad(date.getUTCDate()) + 'T'
    + pad(date.getUTCHours())
    + pad(date.getUTCMinutes())
    + pad(date.getUTCSeconds()) + 'Z';
}

function uidForEvent(title) {
  const ts = Date.now();
  const safe = title ? title.replace(/[^a-zA-Z0-9]/g, '') : 'event';
  return `${safe}-${ts}@mahakalyanam`;
}

function buildVTimezone() {
  // Full VTIMEZONE block for America/New_York with DST rules
  return [
    'BEGIN:VTIMEZONE',
    'TZID:America/New_York',
    'X-LIC-LOCATION:America/New_York',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'END:STANDARD',
    'END:VTIMEZONE'
  ].join('\r\n');
}

export function downloadICS(event) {
  if (!event || !event.start || !event.end) return;

  const title = escapeICalText(event.title || 'Event');
  const description = escapeICalText(event.description || '');
  const location = escapeICalText(event.location || '');
  const dtstamp = formatDTStamp(new Date());
  const uid = uidForEvent(event.title || 'event');

  const lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//MaHaKalyanam//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push(buildVTimezone());

  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${uid}`);
  lines.push(`DTSTAMP:${dtstamp}`);
  lines.push(`DTSTART;TZID=America/New_York:${event.start}`);
  lines.push(`DTEND;TZID=America/New_York:${event.end}`);
  lines.push(`SUMMARY:${title}`);
  if (description) lines.push(`DESCRIPTION:${description}`);
  if (location) lines.push(`LOCATION:${location}`);
  lines.push('END:VEVENT');

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filenameSafe = (event.title || 'event').replace(/[^a-z0-9_-]/gi, '_');
  a.href = url;
  a.download = `${filenameSafe}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Opens the generated .ics in a new tab/window (no download attribute) so
// iOS/macOS/desktop calendar apps will show the native add dialog.
export function openICS(event) {
  if (!event || !event.start || !event.end) return;

  const title = escapeICalText(event.title || 'Event');
  const description = escapeICalText(event.description || '');
  const location = escapeICalText(event.location || '');
  const dtstamp = formatDTStamp(new Date());
  const uid = uidForEvent(event.title || 'event');

  const lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//MaHaKalyanam//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push(buildVTimezone());

  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${uid}`);
  lines.push(`DTSTAMP:${dtstamp}`);
  lines.push(`DTSTART;TZID=America/New_York:${event.start}`);
  lines.push(`DTEND;TZID=America/New_York:${event.end}`);
  lines.push(`SUMMARY:${title}`);
  if (description) lines.push(`DESCRIPTION:${description}`);
  if (location) lines.push(`LOCATION:${location}`);
  lines.push('END:VEVENT');

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // Open in new tab/window without download attribute
  const w = window.open(url, '_blank');
  if (!w) {
    // fallback: navigate current window (some mobile browsers block window.open)
    window.location.href = url;
  }

  // Revoke after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
