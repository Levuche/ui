import { isSafeHref } from './href';

/*
 * Events in a visitor's own calendar: a Google Calendar link and an .ics
 * file for every other calendar app, made from the event's own fields.
 *
 * Plain functions with no clock and no browser, so a block that uses them
 * renders the same links on the server and in the browser (no hydration
 * mismatch), and the tests check them without a browser. Times are read as
 * the creator wrote them:
 *
 * - "2026-12-06": a whole day (as is any time with `allDay`)
 * - "2026-12-06T19:00" with a `timeZone` such as "Europe/London": that time
 *   where the event is
 * - "2026-12-06T19:00+01:00" or "...Z": that moment, shown in `timeZone` when
 *   one is given, otherwise at the time written
 * - "2026-12-06T19:00" with no zone: "floating", 7 pm wherever the visitor is
 *
 * An event without an end lasts an hour, or the whole day. An all-day
 * event's `end` is its last day, so "6 to 8 December" is end "2026-12-08".
 */

/** An event, as the blocks pass it in. */
export type CalendarEvent = {
  title: string;
  /** A date ("2026-12-06") or a date and time; see above. */
  start: string;
  end?: string;
  /** Where it happens, as an IANA name such as "Europe/London". */
  timeZone?: string;
  /** Only the day counts, whatever time `start` and `end` hold. */
  allDay?: boolean;
  location?: string;
  description?: string;
  /** The event's page, as https. Other addresses are left out. */
  url?: string;
  /** A lasting id for the event; made from its fields when left out. */
  uid?: string;
};

/** A date and time on a wall clock, in no particular zone. */
export type WallTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** One end of an event, read from what the creator wrote. */
export type EventTime = {
  /** The time where the event is: in its zone, or as written. */
  wall: WallTime;
  allDay: boolean;
  /** The moment in ms, when it's known: not for all-day or floating times. */
  utc: number | null;
  /** The offset written in the time (minutes east of UTC), when no zone is given. */
  offset: number | null;
};

/** An event's start and end, ready to show or put in a calendar. */
export type EventSpan = {
  start: EventTime;
  /** For an all-day event, the day after its last day (as calendars want it). */
  end: EventTime;
  allDay: boolean;
  /** The event's time zone, when a known one was given. */
  timeZone?: string;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ISO =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/i;

/** The wall time as if it were UTC, in ms: for sums and comparisons. */
export const wallMs = (w: WallTime) =>
  Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);

/** The wall time a UTC-read ms value stands for. */
export function wallFromMs(ms: number): WallTime {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
  };
}

const zoneFormats = new Map<string, Intl.DateTimeFormat | null>();

function zoneFormat(timeZone: string): Intl.DateTimeFormat | null {
  if (!zoneFormats.has(timeZone)) {
    let format: Intl.DateTimeFormat | null = null;
    try {
      format = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
    } catch {
      format = null;
    }
    zoneFormats.set(timeZone, format);
  }
  return zoneFormats.get(timeZone) ?? null;
}

/** True for a time zone the browser knows, such as "Asia/Kolkata". */
export function isTimeZone(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 64 &&
    /^[A-Za-z][A-Za-z0-9_+\-/]*$/.test(value) &&
    zoneFormat(value) !== null
  );
}

/** The wall time in `timeZone` at a moment. */
export function utcToZoned(ms: number, timeZone: string): WallTime {
  const format = zoneFormat(timeZone);
  if (!format) return wallFromMs(ms);
  const parts = format.formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  };
}

/** How far `timeZone` is ahead of UTC at a moment, in ms. */
const zoneOffset = (ms: number, timeZone: string) =>
  wallMs(utcToZoned(ms, timeZone)) - Math.floor(ms / 1000) * 1000;

/**
 * The moment a wall time in `timeZone` happens. A time skipped when the
 * clocks go forward comes out an hour later; a time that happens twice, the
 * first of the two.
 */
export function zonedToUtc(wall: WallTime, timeZone: string): number {
  const asUtc = wallMs(wall);
  const guess = asUtc - zoneOffset(asUtc, timeZone);
  const first = asUtc - zoneOffset(guess, timeZone);
  // Twice-happening times: the earlier offset gives the earlier moment.
  const earlier = asUtc - zoneOffset(first - HOUR, timeZone);
  return wallMs(utcToZoned(earlier, timeZone)) === asUtc ? earlier : first;
}

const validDate = (y: number, m: number, d: number) => {
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};

const parseOffset = (text: string) => {
  if (/^z$/i.test(text)) return 0;
  const digits = text.replace(':', '');
  const sign = digits.startsWith('-') ? -1 : 1;
  return sign * (Number(digits.slice(1, 3)) * 60 + Number(digits.slice(3, 5)));
};

/**
 * Reads one time an event starts or ends, or null when it can't be read.
 * See the top of this file for the forms it takes.
 */
export function parseEventTime(
  value: string | null | undefined,
  timeZone?: string,
  allDay = false
): EventTime | null {
  if (typeof value !== 'string' || value.length > 64) return null;
  const match = ISO.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, s, off] = match;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  if (!validDate(year, month, day)) return null;
  const zone = isTimeZone(timeZone) ? timeZone : undefined;
  if (h === undefined) {
    return {
      wall: { year, month, day, hour: 0, minute: 0, second: 0 },
      allDay: true,
      utc: null,
      offset: null,
    };
  }
  const hour = Number(h);
  const minute = Number(mi);
  const second = Number(s ?? 0);
  if (hour > 23 || minute > 59 || second > 59) return null;
  const written = { year, month, day, hour, minute, second };
  const offset = off === undefined ? null : parseOffset(off);
  if (offset !== null && Math.abs(offset) > 18 * 60) return null;
  const utc =
    offset !== null
      ? wallMs(written) - offset * MINUTE
      : zone
        ? zonedToUtc(written, zone)
        : null;
  const wall = utc !== null && zone ? utcToZoned(utc, zone) : written;
  if (allDay) {
    return {
      wall: { ...wall, hour: 0, minute: 0, second: 0 },
      allDay: true,
      utc: null,
      offset: null,
    };
  }
  return { wall, allDay: false, utc, offset: zone ? null : offset };
}

const addDays = (wall: WallTime, days: number) =>
  wallFromMs(wallMs(wall) + days * DAY);

/** Moves a time by `ms`, keeping it in its zone or offset. */
function later(time: EventTime, ms: number, timeZone?: string): EventTime {
  if (time.utc === null) {
    return { ...time, wall: wallFromMs(wallMs(time.wall) + ms) };
  }
  const utc = time.utc + ms;
  return {
    ...time,
    utc,
    wall: timeZone
      ? utcToZoned(utc, timeZone)
      : wallFromMs(wallMs(time.wall) + ms),
  };
}

/** The event's start and end, or null when its start can't be read. */
export function eventSpan(
  event: Pick<CalendarEvent, 'start' | 'end' | 'timeZone' | 'allDay'>
): EventSpan | null {
  const timeZone = isTimeZone(event.timeZone) ? event.timeZone : undefined;
  const start = parseEventTime(event.start, timeZone, event.allDay);
  if (!start) return null;
  const zone = timeZone ? { timeZone } : {};
  let end = parseEventTime(event.end, timeZone, start.allDay);
  if (start.allDay) {
    const last =
      end && end.allDay && wallMs(end.wall) >= wallMs(start.wall)
        ? end.wall
        : start.wall;
    return {
      start,
      end: { ...start, wall: addDays(last, 1) },
      allDay: true,
      ...zone,
    };
  }
  if (end && !end.allDay) {
    // An end with no zone or offset of its own is read like the start.
    if (start.utc === null) {
      end = { ...end, utc: null, offset: null };
    } else if (end.utc === null) {
      end = {
        ...end,
        utc: wallMs(end.wall) - (start.offset ?? 0) * MINUTE,
        offset: start.offset,
      };
    }
    const after =
      start.utc !== null && end.utc !== null
        ? end.utc > start.utc
        : wallMs(end.wall) > wallMs(start.wall);
    if (after) return { start, end, allDay: false, ...zone };
  }
  return { start, end: later(start, HOUR, timeZone), allDay: false, ...zone };
}

/* ------------------------------------------------------------- Formatting */

const pad = (n: number, size = 2) => String(n).padStart(size, '0');

/** As 20261206, for an all-day calendar entry. */
export const icsDate = (w: WallTime) =>
  `${pad(w.year, 4)}${pad(w.month)}${pad(w.day)}`;

/** As 20261206T190000, a wall time with no zone. */
export const icsLocal = (w: WallTime) =>
  `${icsDate(w)}T${pad(w.hour)}${pad(w.minute)}${pad(w.second)}`;

/** As 20261206T180000Z, a moment in UTC. */
export const icsUtc = (ms: number) => `${icsLocal(wallFromMs(ms))}Z`;

/** One end of the event as a calendar writes it. */
const stamp = (time: EventTime, allDay: boolean) =>
  allDay
    ? icsDate(time.wall)
    : time.utc !== null
      ? icsUtc(time.utc)
      : icsLocal(time.wall);

/**
 * Text made safe for an .ics file (RFC 5545 TEXT): backslashes, semicolons
 * and commas escaped, line breaks written as \n, other control characters
 * dropped.
 */
export function escapeIcsText(text: string): string {
  return (
    text
      .replace(/\r\n?/g, '\n')
      // eslint-disable-next-line no-control-regex -- these are what it drops
      .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  );
}

const encoder = new TextEncoder();

/**
 * Splits a line longer than 75 bytes into lines of at most 75 bytes, each
 * after the first starting with a space (RFC 5545 folding). It never splits
 * a character, so words in any script survive.
 */
export function foldIcsLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line;
  const lines: string[] = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      lines.push(current);
      current = ' ';
      bytes = 1;
    }
    current += char;
    bytes += size;
  }
  lines.push(current);
  return lines.join('\r\n');
}

/** A short, steady hash of the event, for its id. */
function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

const clean = (text: string | undefined) => text?.trim() ?? '';

const webUrl = (url: string | undefined) =>
  url && isSafeHref(url) && /^https?:\/\//i.test(url.trim())
    ? url.trim()
    : undefined;

/** The event's id in the file: its own when it's a plain id, or one made from it. */
function eventUid(event: CalendarEvent, span: EventSpan) {
  const own = clean(event.uid);
  if (/^[\w.@-]{1,200}$/.test(own)) return own;
  const key = [
    event.title,
    event.start,
    event.end,
    event.timeZone,
    event.location,
  ].join('|');
  return `${stamp(span.start, span.allDay)}-${hash(key)}@levuche.page`;
}

/**
 * The event as an .ics file's text, with CRLF line ends, or null when its
 * start can't be read. Its DTSTAMP is the start, not the time it's made, so
 * the same event always makes the same file.
 */
export function icsText(event: CalendarEvent): string | null {
  const span = eventSpan(event);
  if (!span) return null;
  const date = span.allDay ? ';VALUE=DATE' : '';
  const url = webUrl(event.url);
  const description = clean(event.description);
  const location = clean(event.location);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Levuche//UI//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${eventUid(event, span)}`,
    `DTSTAMP:${
      span.start.utc !== null
        ? icsUtc(span.start.utc)
        : icsUtc(wallMs(span.start.wall))
    }`,
    `DTSTART${date}:${stamp(span.start, span.allDay)}`,
    `DTEND${date}:${stamp(span.end, span.allDay)}`,
    `SUMMARY:${escapeIcsText(clean(event.title))}`,
    ...(location ? [`LOCATION:${escapeIcsText(location)}`] : []),
    ...(description ? [`DESCRIPTION:${escapeIcsText(description)}`] : []),
    ...(url ? [`URL:${url}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

/**
 * The .ics file as a link the visitor's browser saves (a data: address),
 * or null. Made from the event alone, so it's the same on the server and in
 * the browser, and it needs no JavaScript to work.
 */
export function icsHref(event: CalendarEvent): string | null {
  const text = icsText(event);
  return text
    ? `data:text/calendar;charset=utf-8,${encodeURIComponent(text)}`
    : null;
}

/**
 * A plain file name for the event's .ics file, as "live-cooking-night.ics":
 * the title's letters and digits in words joined by "-", at most 60
 * characters. Split into words rather than trimmed with a pattern, so it
 * takes the same short time on any title.
 */
export function icsFileName(title: string): string {
  const words = title
    .slice(0, 500)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]/)
    .filter(Boolean);
  let slug = '';
  for (const word of words) {
    const next = slug ? `${slug}-${word}` : word;
    if (next.length > 60) {
      if (!slug) slug = word.slice(0, 60);
      break;
    }
    slug = next;
  }
  return `${slug || 'event'}.ics`;
}

/** What Google Calendar's new-event page reads, as its `details`. */
function details(event: CalendarEvent) {
  const url = webUrl(event.url);
  return [clean(event.description).slice(0, 1000), url]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * A link that opens Google Calendar with the event filled in, for the
 * visitor to save; or null when its start can't be read.
 */
export function googleCalendarHref(event: CalendarEvent): string | null {
  const span = eventSpan(event);
  if (!span) return null;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: clean(event.title),
    dates: `${stamp(span.start, span.allDay)}/${stamp(span.end, span.allDay)}`,
  });
  const about = details(event);
  if (about) params.set('details', about);
  const location = clean(event.location);
  if (location) params.set('location', location);
  if (span.timeZone && !span.allDay) params.set('ctz', span.timeZone);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Both ways to save the event, or null when its start can't be read. */
export function calendarLinks(
  event: CalendarEvent
): { google: string; ics: string; fileName: string } | null {
  const google = googleCalendarHref(event);
  const ics = icsHref(event);
  return google && ics
    ? { google, ics, fileName: icsFileName(event.title) }
    : null;
}

/* ------------------------------------------------------- How far away it is */

/**
 * The moments an event starts and ends. Floating and all-day times happen
 * at that wall time in `localZone`, the visitor's zone; give it only in the
 * browser, after the page has hydrated.
 */
export function eventInstants(
  span: EventSpan,
  localZone?: string
): { start: number; end: number } {
  const at = (time: EventTime) =>
    time.utc !== null
      ? time.utc
      : isTimeZone(localZone)
        ? zonedToUtc(time.wall, localZone)
        : wallMs(time.wall);
  return { start: at(span.start), end: at(span.end) };
}

/** Whether the event is still to come, on now, or over. */
export type EventState = 'upcoming' | 'live' | 'past';

export function eventState(
  instants: { start: number; end: number },
  now: number
): EventState {
  if (now < instants.start) return 'upcoming';
  return now < instants.end ? 'live' : 'past';
}

/** A distance in time, for Intl.RelativeTimeFormat. */
export type HowFar = {
  value: number;
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
};

/**
 * How far away the event's start is, in the unit a person would say: "in 20
 * minutes", "in 3 days", "in 4 months". Negative when it has passed. An
 * all-day event counts whole days on the visitor's calendar, so tomorrow's
 * is "tomorrow" all day today.
 */
export function howFar(
  span: EventSpan,
  now: number,
  localZone?: string
): HowFar {
  const zone = isTimeZone(localZone) ? localZone : undefined;
  if (span.allDay) {
    const today = zone ? utcToZoned(now, zone) : wallFromMs(now);
    const days = Math.round(
      (wallMs(span.start.wall) -
        wallMs({ ...today, hour: 0, minute: 0, second: 0 })) /
        DAY
    );
    return byDays(days);
  }
  const diff = eventInstants(span, zone).start - now;
  const size = Math.abs(diff);
  const sign = diff < 0 ? -1 : 1;
  if (size < HOUR) {
    return {
      value: sign * Math.max(1, Math.round(size / MINUTE)),
      unit: 'minute',
    };
  }
  if (size < DAY)
    return { value: sign * Math.round(size / HOUR), unit: 'hour' };
  return byDays(sign * Math.round(size / DAY));
}

function byDays(days: number): HowFar {
  const size = Math.abs(days);
  const sign = days < 0 ? -1 : 1;
  if (size < 7) return { value: days, unit: 'day' };
  if (size < 30) return { value: sign * Math.round(size / 7), unit: 'week' };
  if (size < 365) {
    return {
      value: sign * Math.max(1, Math.round(size / 30.44)),
      unit: 'month',
    };
  }
  return { value: sign * Math.round(size / 365.25), unit: 'year' };
}

/* ------------------------------------------------------------ Showing it */

/** The event's date and time in words, as the card shows them. */
export type EventWhen = {
  /** The month for the date badge, as "Mar". */
  month: string;
  /** The day of the month for the date badge, as "15". */
  day: string;
  /** The date and time, as "Sat, Mar 15, 2027, 7:00 – 10:00 PM". */
  text: string;
  /** The zone's short name, as "GMT+1" or "UTC+5:30", when it has one. */
  zone?: string;
  /** For a <time> element's dateTime. */
  dateTime: string;
};

const offsetName = (minutes: number) => {
  if (minutes === 0) return 'UTC';
  const size = Math.abs(minutes);
  const rest = size % 60;
  return `UTC${minutes < 0 ? '−' : '+'}${Math.floor(size / 60)}${
    rest ? `:${pad(rest)}` : ''
  }`;
};

/**
 * The event's date and time in `locale`'s words, at the time where the event
 * is. Uses no clock and no zone of the machine it runs on, so the server and
 * the browser write the same words for the same locale.
 */
export function eventWhen(span: EventSpan, locale?: string): EventWhen {
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options });
  const start = new Date(wallMs(span.start.wall));
  const dateParts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  let text: string;
  if (span.allDay) {
    const last = new Date(wallMs(addDays(span.end.wall, -1)));
    text =
      last.getTime() === start.getTime()
        ? format(dateParts).format(start)
        : format(dateParts).formatRange(start, last);
  } else {
    text = format({
      ...dateParts,
      hour: 'numeric',
      minute: '2-digit',
    }).formatRange(start, new Date(wallMs(span.end.wall)));
  }
  let zone: string | undefined;
  if (!span.allDay && span.timeZone && span.start.utc !== null) {
    zone = new Intl.DateTimeFormat(locale, {
      timeZone: span.timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(new Date(span.start.utc))
      .find((part) => part.type === 'timeZoneName')?.value;
  } else if (!span.allDay && span.start.offset !== null) {
    zone = offsetName(span.start.offset);
  }
  const w = span.start.wall;
  const date = `${pad(w.year, 4)}-${pad(w.month)}-${pad(w.day)}`;
  return {
    month: format({ month: 'short' }).format(start),
    day: format({ day: 'numeric' }).format(start),
    text,
    ...(zone ? { zone } : {}),
    dateTime: span.allDay
      ? date
      : span.start.utc !== null
        ? new Date(span.start.utc).toISOString()
        : `${date}T${pad(w.hour)}:${pad(w.minute)}`,
  };
}
