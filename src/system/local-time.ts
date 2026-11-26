/*
 * The time-zone maths behind the LocalTime block: the cities a creator picks
 * from, checking a time zone, the time and date in a zone, a zone's offset
 * from UTC, how far ahead or behind the visitor that is, and whether the
 * creator's working hours are on.
 *
 * Plain functions on Intl only, so they run on a server, in a browser or in a
 * test, and every answer comes from the time passed in, never the clock.
 */

/** The cities a creator picks from, west to east. */
export const LOCAL_TIME_CITY_IDS = [
  'honolulu',
  'anchorage',
  'los-angeles',
  'vancouver',
  'denver',
  'mexico-city',
  'chicago',
  'toronto',
  'new-york',
  'bogota',
  'lima',
  'halifax',
  'st-johns',
  'sao-paulo',
  'buenos-aires',
  'reykjavik',
  'lisbon',
  'london',
  'dublin',
  'lagos',
  'paris',
  'berlin',
  'madrid',
  'rome',
  'amsterdam',
  'stockholm',
  'cairo',
  'johannesburg',
  'athens',
  'istanbul',
  'nairobi',
  'moscow',
  'tehran',
  'dubai',
  'karachi',
  'mumbai',
  'delhi',
  'bengaluru',
  'chennai',
  'kolkata',
  'kathmandu',
  'dhaka',
  'bangkok',
  'jakarta',
  'singapore',
  'kuala-lumpur',
  'manila',
  'hong-kong',
  'shanghai',
  'taipei',
  'seoul',
  'tokyo',
  'perth',
  'adelaide',
  'brisbane',
  'sydney',
  'melbourne',
  'auckland',
  'utc',
] as const;
export type LocalTimeCity = (typeof LOCAL_TIME_CITY_IDS)[number];

/** Each city's name, as a visitor reads it, and its IANA time zone. */
export const LOCAL_TIME_CITIES: Record<
  LocalTimeCity,
  { name: string; zone: string }
> = {
  honolulu: { name: 'Honolulu', zone: 'Pacific/Honolulu' },
  anchorage: { name: 'Anchorage', zone: 'America/Anchorage' },
  'los-angeles': { name: 'Los Angeles', zone: 'America/Los_Angeles' },
  vancouver: { name: 'Vancouver', zone: 'America/Vancouver' },
  denver: { name: 'Denver', zone: 'America/Denver' },
  'mexico-city': { name: 'Mexico City', zone: 'America/Mexico_City' },
  chicago: { name: 'Chicago', zone: 'America/Chicago' },
  toronto: { name: 'Toronto', zone: 'America/Toronto' },
  'new-york': { name: 'New York', zone: 'America/New_York' },
  bogota: { name: 'Bogotá', zone: 'America/Bogota' },
  lima: { name: 'Lima', zone: 'America/Lima' },
  halifax: { name: 'Halifax', zone: 'America/Halifax' },
  'st-johns': { name: 'St. John’s', zone: 'America/St_Johns' },
  'sao-paulo': { name: 'São Paulo', zone: 'America/Sao_Paulo' },
  'buenos-aires': {
    name: 'Buenos Aires',
    zone: 'America/Argentina/Buenos_Aires',
  },
  reykjavik: { name: 'Reykjavík', zone: 'Atlantic/Reykjavik' },
  lisbon: { name: 'Lisbon', zone: 'Europe/Lisbon' },
  london: { name: 'London', zone: 'Europe/London' },
  dublin: { name: 'Dublin', zone: 'Europe/Dublin' },
  lagos: { name: 'Lagos', zone: 'Africa/Lagos' },
  paris: { name: 'Paris', zone: 'Europe/Paris' },
  berlin: { name: 'Berlin', zone: 'Europe/Berlin' },
  madrid: { name: 'Madrid', zone: 'Europe/Madrid' },
  rome: { name: 'Rome', zone: 'Europe/Rome' },
  amsterdam: { name: 'Amsterdam', zone: 'Europe/Amsterdam' },
  stockholm: { name: 'Stockholm', zone: 'Europe/Stockholm' },
  cairo: { name: 'Cairo', zone: 'Africa/Cairo' },
  johannesburg: { name: 'Johannesburg', zone: 'Africa/Johannesburg' },
  athens: { name: 'Athens', zone: 'Europe/Athens' },
  istanbul: { name: 'Istanbul', zone: 'Europe/Istanbul' },
  nairobi: { name: 'Nairobi', zone: 'Africa/Nairobi' },
  moscow: { name: 'Moscow', zone: 'Europe/Moscow' },
  tehran: { name: 'Tehran', zone: 'Asia/Tehran' },
  dubai: { name: 'Dubai', zone: 'Asia/Dubai' },
  karachi: { name: 'Karachi', zone: 'Asia/Karachi' },
  mumbai: { name: 'Mumbai', zone: 'Asia/Kolkata' },
  delhi: { name: 'Delhi', zone: 'Asia/Kolkata' },
  bengaluru: { name: 'Bengaluru', zone: 'Asia/Kolkata' },
  chennai: { name: 'Chennai', zone: 'Asia/Kolkata' },
  kolkata: { name: 'Kolkata', zone: 'Asia/Kolkata' },
  kathmandu: { name: 'Kathmandu', zone: 'Asia/Kathmandu' },
  dhaka: { name: 'Dhaka', zone: 'Asia/Dhaka' },
  bangkok: { name: 'Bangkok', zone: 'Asia/Bangkok' },
  jakarta: { name: 'Jakarta', zone: 'Asia/Jakarta' },
  singapore: { name: 'Singapore', zone: 'Asia/Singapore' },
  'kuala-lumpur': { name: 'Kuala Lumpur', zone: 'Asia/Kuala_Lumpur' },
  manila: { name: 'Manila', zone: 'Asia/Manila' },
  'hong-kong': { name: 'Hong Kong', zone: 'Asia/Hong_Kong' },
  shanghai: { name: 'Shanghai', zone: 'Asia/Shanghai' },
  taipei: { name: 'Taipei', zone: 'Asia/Taipei' },
  seoul: { name: 'Seoul', zone: 'Asia/Seoul' },
  tokyo: { name: 'Tokyo', zone: 'Asia/Tokyo' },
  perth: { name: 'Perth', zone: 'Australia/Perth' },
  adelaide: { name: 'Adelaide', zone: 'Australia/Adelaide' },
  brisbane: { name: 'Brisbane', zone: 'Australia/Brisbane' },
  sydney: { name: 'Sydney', zone: 'Australia/Sydney' },
  melbourne: { name: 'Melbourne', zone: 'Australia/Melbourne' },
  auckland: { name: 'Auckland', zone: 'Pacific/Auckland' },
  utc: { name: 'UTC', zone: 'UTC' },
};

/** City names by id, for the settings panel. */
export const LOCAL_TIME_CITY_LABELS: Readonly<Record<string, string>> =
  Object.fromEntries(
    LOCAL_TIME_CITY_IDS.map((id) => [id, LOCAL_TIME_CITIES[id].name])
  );

export function isLocalTimeCity(value: unknown): value is LocalTimeCity {
  return (LOCAL_TIME_CITY_IDS as readonly unknown[]).includes(value);
}

/** 12-hour, 24-hour, or the visitor's own way ('auto'). */
export const LOCAL_TIME_CLOCKS = ['auto', 12, 24] as const;
export type LocalTimeClock = (typeof LOCAL_TIME_CLOCKS)[number];

/** Days of the week, as working hours take them. */
export const LOCAL_TIME_DAYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;
export type LocalTimeDay = (typeof LOCAL_TIME_DAYS)[number];

/** When the creator is around, in their own time zone. */
export type LocalTimeHours = {
  /** From, as "09:00" (24-hour). */
  from: string;
  /** Until, as "17:30". Earlier than `from` runs past midnight. */
  to: string;
  /** The days it starts on. Left out, Monday to Friday. */
  days?: LocalTimeDay[];
};

export const WEEKDAYS: readonly LocalTimeDay[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
];

/** Whether Intl knows this IANA time zone, as "Europe/Lisbon". */
export function isValidTimeZone(zone: unknown): zone is string {
  if (typeof zone !== 'string' || !zone.trim()) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone.trim() });
    return true;
  } catch {
    return false;
  }
}

/**
 * The time zone to show: `zone` when Intl knows it, else the city's, else
 * UTC. Never throws, so a mistyped zone can't break the page.
 */
export function localTimeZone(city?: string, zone?: string): string {
  if (isValidTimeZone(zone)) return zone.trim();
  const cityZone = isLocalTimeCity(city)
    ? LOCAL_TIME_CITIES[city].zone
    : undefined;
  return isValidTimeZone(cityZone) ? cityZone : 'UTC';
}

const DAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** The wall clock in a zone: date, time and weekday (0 is Monday). */
export function zoneClock(at: number, zone: string) {
  const parts: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at)) {
    parts[part.type] = part.value;
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    // Some engines write midnight as 24 even with h23.
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: DAY_INDEX[parts.weekday ?? ''] ?? 0,
  };
}

/** How far a zone is ahead of UTC at a moment, in minutes (India: 330). */
export function zoneOffset(at: number, zone: string): number {
  const c = zoneClock(at, zone);
  const wall = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second);
  const exact = Math.floor(at / 1000) * 1000;
  return Math.round((wall - exact) / 60_000);
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The moment as the zone's wall clock with its offset, for a <time>
 * element's dateTime: "2026-11-26T20:35+05:30".
 */
export function zoneDateTime(at: number, zone: string): string {
  const c = zoneClock(at, zone);
  const offset = zoneOffset(at, zone);
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  return `${c.year}-${pad(c.month)}-${pad(c.day)}T${pad(c.hour)}:${pad(
    c.minute
  )}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Whether a locale writes times on a 12-hour clock. */
export function usesTwelveHours(locale?: string): boolean {
  const cycle = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
  }).resolvedOptions().hourCycle;
  return cycle === 'h12' || cycle === 'h11';
}

/** One piece of a written time; the day period ("PM") is shown smaller. */
export type TimePart = { type: 'time' | 'period'; value: string };

/**
 * The time in a zone, in the locale's words, as pieces: "3:05" and "PM", or
 * "15:05" alone. `clock` 'auto' follows the locale; 12 and 24 force one.
 */
export function localTimeParts(
  at: number,
  zone: string,
  locale?: string,
  clock: LocalTimeClock = 'auto'
): TimePart[] {
  const twelve = clock === 'auto' ? usesTwelveHours(locale) : clock === 12;
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    hour: twelve ? 'numeric' : '2-digit',
    minute: '2-digit',
    hourCycle: twelve ? 'h12' : 'h23',
  }).formatToParts(at);
  const pieces: TimePart[] = [];
  for (const part of parts) {
    const type = part.type === 'dayPeriod' ? 'period' : 'time';
    const last = pieces[pieces.length - 1];
    if (last && last.type === type) last.value += part.value;
    else pieces.push({ type, value: part.value });
  }
  return pieces
    .map((piece) => ({ ...piece, value: piece.value.trim() }))
    .filter((piece) => piece.value);
}

/** The time in a zone as one string: "3:05 PM" or "15:05". */
export function formatLocalTime(
  at: number,
  zone: string,
  locale?: string,
  clock: LocalTimeClock = 'auto'
): string {
  return localTimeParts(at, zone, locale, clock)
    .map((part) => part.value)
    .join(' ');
}

/** The date in a zone, short: "Thu, Nov 26". */
export function formatLocalDate(
  at: number,
  zone: string,
  locale?: string
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(at);
}

/** The words for how far ahead or behind the visitor the creator is. */
export type OffsetWords = {
  /** "{time} ahead of you" */
  ahead: string;
  /** "{time} behind you" */
  behind: string;
  /** "Same time as you" */
  same: string;
  /** "{n} h" */
  hours: string;
  /** "{n} min" */
  minutes: string;
};

export const OFFSET_WORDS: OffsetWords = {
  ahead: '{time} ahead of you',
  behind: '{time} behind you',
  same: 'Same time as you',
  hours: '{n} h',
  minutes: '{n} min',
};

/**
 * Minutes the creator's zone is ahead of the visitor's at a moment: positive
 * when the creator is ahead, negative when behind.
 */
export function offsetFromVisitor(
  at: number,
  creatorZone: string,
  visitorZone: string
): number {
  return zoneOffset(at, creatorZone) - zoneOffset(at, visitorZone);
}

/** "4 h 30 min ahead of you", "1 h behind you" or "Same time as you". */
export function describeOffset(
  minutes: number,
  words: OffsetWords = OFFSET_WORDS
): string {
  if (!Number.isFinite(minutes) || Math.round(minutes) === 0) {
    return words.same;
  }
  const abs = Math.abs(Math.round(minutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const time = [
    h ? words.hours.replace('{n}', String(h)) : '',
    m ? words.minutes.replace('{n}', String(m)) : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (minutes > 0 ? words.ahead : words.behind).replace('{time}', time);
}

/** "09:30" as minutes after midnight, or null when it can't be read. */
export function parseClockTime(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(value);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 24 || m > 59 || (h === 24 && m > 0)) return null;
  return h * 60 + m;
}

/**
 * Whether the creator is around at a moment, by their hours in their zone;
 * null when the hours can't be read (then no "open" or "away" is shown).
 * Hours that end before they start run past midnight, and count for the day
 * they start on.
 */
export function isOpenAt(
  at: number,
  zone: string,
  hours?: LocalTimeHours | null
): boolean | null {
  if (!hours) return null;
  const from = parseClockTime(hours.from);
  const to = parseClockTime(hours.to);
  if (from === null || to === null || from === to) return null;
  const days = hours.days ?? WEEKDAYS;
  const c = zoneClock(at, zone);
  const now = c.hour * 60 + c.minute;
  const today = LOCAL_TIME_DAYS[c.weekday];
  const yesterday = LOCAL_TIME_DAYS[(c.weekday + 6) % 7];
  if (from < to) return days.includes(today) && now >= from && now < to;
  return (
    (days.includes(today) && now >= from) ||
    (days.includes(yesterday) && now < to)
  );
}

/** Milliseconds from `at` to the start of the next minute. */
export function msToNextMinute(at: number): number {
  return 60_000 - (((at % 60_000) + 60_000) % 60_000);
}
