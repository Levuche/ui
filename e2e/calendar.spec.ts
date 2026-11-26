import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  calendarLinks,
  escapeIcsText,
  eventInstants,
  eventSpan,
  eventState,
  eventWhen,
  foldIcsLine,
  googleCalendarHref,
  howFar,
  icsFileName,
  icsHref,
  icsText,
  isTimeZone,
  parseEventTime,
  utcToZoned,
  zonedToUtc,
  type CalendarEvent,
} from '../src/system/calendar';
import { blockInfo } from '../src/system/registry';
import { EVENT_CARD_LABELS, EventCard } from '../src/organisms/event-card';
import { EVENT_LIST_LABELS, EventList } from '../src/organisms/feeds';

/* Plain checks of the event times and calendar links. No browser. */

const H = 3_600_000;
const D = 24 * H;

const lines = (text: string) => text.split('\r\n');
/** The .ics text with folded lines joined again, as a calendar reads it. */
const unfold = (text: string) => text.replace(/\r\n /g, '');
const field = (text: string, name: string) =>
  lines(unfold(text)).find((line) => line.startsWith(name));
const googleParams = (event: CalendarEvent) =>
  new URL(googleCalendarHref(event)!).searchParams;

test('time zones are known or refused', () => {
  expect(isTimeZone('Europe/London')).toBe(true);
  expect(isTimeZone('Asia/Kolkata')).toBe(true);
  expect(isTimeZone('America/Argentina/Buenos_Aires')).toBe(true);
  expect(isTimeZone('UTC')).toBe(true);
  expect(isTimeZone('Mars/Olympus')).toBe(false);
  expect(isTimeZone('')).toBe(false);
  expect(isTimeZone('Europe/London; DROP')).toBe(false);
  expect(isTimeZone(undefined)).toBe(false);
});

test('a wall time in a zone is the right moment, both ways', () => {
  const wall = {
    year: 2027,
    month: 3,
    day: 15,
    hour: 19,
    minute: 0,
    second: 0,
  };
  // London is on GMT in mid-March 2027 (summer time starts on the 28th).
  expect(zonedToUtc(wall, 'Europe/London')).toBe(Date.UTC(2027, 2, 15, 19));
  expect(zonedToUtc(wall, 'Asia/Kolkata')).toBe(Date.UTC(2027, 2, 15, 13, 30));
  // New York is on summer time (EDT, UTC−4) by then.
  expect(zonedToUtc(wall, 'America/New_York')).toBe(Date.UTC(2027, 2, 15, 23));
  expect(utcToZoned(Date.UTC(2027, 2, 15, 23), 'America/New_York')).toEqual(
    wall
  );
  // A time skipped when the clocks go forward comes out an hour later.
  const gap = { ...wall, month: 3, day: 28, hour: 1, minute: 30 };
  expect(zonedToUtc(gap, 'Europe/London')).toBe(Date.UTC(2027, 2, 28, 1, 30));
  // A time that happens twice is the first of the two (still on BST).
  const twice = { ...wall, month: 10, day: 31, hour: 1, minute: 30 };
  expect(zonedToUtc(twice, 'Europe/London')).toBe(Date.UTC(2027, 9, 31, 0, 30));
});

test('event times are read in every form, and nonsense is refused', () => {
  expect(parseEventTime('2027-03-15')).toMatchObject({
    allDay: true,
    utc: null,
    wall: { year: 2027, month: 3, day: 15, hour: 0 },
  });
  expect(parseEventTime('2027-03-15T19:00', 'Asia/Kolkata')).toMatchObject({
    allDay: false,
    utc: Date.UTC(2027, 2, 15, 13, 30),
    wall: { hour: 19, minute: 0 },
    offset: null,
  });
  // An offset is that moment; with a zone it shows at the zone's time.
  expect(parseEventTime('2027-03-15T19:00:00+01:00')).toMatchObject({
    utc: Date.UTC(2027, 2, 15, 18),
    wall: { hour: 19 },
    offset: 60,
  });
  expect(parseEventTime('2027-03-15T18:00:00Z', 'Asia/Kolkata')).toMatchObject({
    utc: Date.UTC(2027, 2, 15, 18),
    wall: { hour: 23, minute: 30 },
  });
  // No offset and no zone: floating, the same wall time anywhere.
  expect(parseEventTime('2027-03-15T19:00')).toMatchObject({
    utc: null,
    offset: null,
    wall: { hour: 19 },
  });
  // A zone that isn't one is left out, not guessed.
  expect(parseEventTime('2027-03-15T19:00', 'Nowhere/Land')?.utc).toBeNull();
  // allDay keeps only the day, in the event's zone.
  expect(
    parseEventTime('2027-03-15T23:30:00Z', 'Asia/Kolkata', true)
  ).toMatchObject({ allDay: true, wall: { day: 16, hour: 0 } });
  for (const bad of [
    '',
    'soon',
    '2027-02-30',
    '2027-13-01',
    '2027-03-15T25:00',
    '2027-03-15T19:61',
    '2027-03-15T19:00+25:00',
    '15/03/2027',
  ]) {
    expect(parseEventTime(bad), bad).toBeNull();
  }
  expect(parseEventTime(undefined)).toBeNull();
  expect(parseEventTime(`2027-03-15T19:00${'0'.repeat(50_000)}`)).toBeNull();
});

test('an event without an end lasts an hour, or the whole day', () => {
  const timed = eventSpan({
    start: '2027-03-15T19:00',
    timeZone: 'Europe/London',
  })!;
  expect(timed.end.utc! - timed.start.utc!).toBe(H);
  expect(timed.end.wall.hour).toBe(20);
  // An end before the start is ignored.
  const backwards = eventSpan({
    start: '2027-03-15T19:00',
    end: '2027-03-15T18:00',
    timeZone: 'Europe/London',
  })!;
  expect(backwards.end.wall.hour).toBe(20);
  // An all-day event's end is its last day; calendars get the day after.
  const days = eventSpan({ start: '2027-03-15', end: '2027-03-17' })!;
  expect(days.allDay).toBe(true);
  expect(days.end.wall).toMatchObject({ month: 3, day: 18 });
  const oneDay = eventSpan({ start: '2027-12-31' })!;
  expect(oneDay.end.wall).toMatchObject({ year: 2028, month: 1, day: 1 });
  expect(eventSpan({ start: 'tomorrow' })).toBeNull();
});

test('the .ics file holds the event, in UTC, with CRLF line ends', () => {
  const text = icsText({
    title: 'Live cooking night',
    start: '2027-03-15T19:00',
    end: '2027-03-15T22:00',
    timeZone: 'Europe/Berlin',
    location: 'The Old Hall, Leeds',
    description: 'Bring an apron.',
    url: 'https://example.com/tickets',
  })!;
  expect(text.endsWith('\r\n')).toBe(true);
  expect(text.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  const all = lines(text);
  expect(all[0]).toBe('BEGIN:VCALENDAR');
  expect(all).toContain('VERSION:2.0');
  expect(all).toContain('BEGIN:VEVENT');
  expect(all).toContain('END:VEVENT');
  expect(all.at(-2)).toBe('END:VCALENDAR');
  // Berlin is UTC+1 in mid-March.
  expect(all).toContain('DTSTART:20270315T180000Z');
  expect(all).toContain('DTEND:20270315T210000Z');
  expect(all).toContain('DTSTAMP:20270315T180000Z');
  expect(all).toContain('SUMMARY:Live cooking night');
  expect(all).toContain('LOCATION:The Old Hall\\, Leeds');
  expect(all).toContain('DESCRIPTION:Bring an apron.');
  expect(all).toContain('URL:https://example.com/tickets');
  expect(field(text, 'UID:')).toMatch(/^UID:20270315T180000Z-[0-9a-f]{8}@/);
  // The same event always makes the same file (no clock in it).
  expect(
    icsText({
      title: 'Live cooking night',
      start: '2027-03-15T19:00',
      end: '2027-03-15T22:00',
      timeZone: 'Europe/Berlin',
      location: 'The Old Hall, Leeds',
      description: 'Bring an apron.',
      url: 'https://example.com/tickets',
    })
  ).toBe(text);
});

test('all-day and floating events are written as calendars expect', () => {
  const days = icsText({
    title: 'Spice fair',
    start: '2027-03-15',
    end: '2027-03-17',
  })!;
  expect(lines(days)).toContain('DTSTART;VALUE=DATE:20270315');
  expect(lines(days)).toContain('DTEND;VALUE=DATE:20270318');
  const floating = icsText({ title: 'Call', start: '2027-03-15T19:00' })!;
  expect(lines(floating)).toContain('DTSTART:20270315T190000');
  expect(lines(floating)).toContain('DTEND:20270315T200000');
  expect(icsText({ title: 'No date', start: 'soon' })).toBeNull();
});

test('ICS text escapes commas, semicolons, backslashes and line breaks', () => {
  expect(escapeIcsText('Chai, samosas; and more')).toBe(
    'Chai\\, samosas\\; and more'
  );
  expect(escapeIcsText('C:\\path')).toBe('C:\\\\path');
  expect(escapeIcsText('One\nTwo\r\nThree\rFour')).toBe(
    'One\\nTwo\\nThree\\nFour'
  );
  expect(escapeIcsText('bell\u0007 tab\tend')).toBe('bell tabend');
  // Nothing a creator types can start a new line or field in the file.
  const text = icsText({
    title: 'Party\r\nEND:VEVENT\r\nBEGIN:VEVENT',
    start: '2027-03-15',
    description: 'a;b,c\\d',
    location: 'Line one\nLine two',
  })!;
  expect(lines(text).filter((line) => line === 'END:VEVENT')).toHaveLength(1);
  expect(field(text, 'SUMMARY:')).toBe(
    'SUMMARY:Party\\nEND:VEVENT\\nBEGIN:VEVENT'
  );
  expect(field(text, 'DESCRIPTION:')).toBe('DESCRIPTION:a\\;b\\,c\\\\d');
  expect(field(text, 'LOCATION:')).toBe('LOCATION:Line one\\nLine two');
});

test('long lines are folded at 75 bytes without splitting a character', () => {
  expect(foldIcsLine('SUMMARY:short')).toBe('SUMMARY:short');
  const long = `DESCRIPTION:${'a'.repeat(200)}`;
  const folded = foldIcsLine(long).split('\r\n');
  expect(folded.length).toBeGreaterThan(2);
  for (const [i, line] of folded.entries()) {
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    if (i > 0) expect(line.startsWith(' ')).toBe(true);
  }
  expect(folded.join('\r\n').replace(/\r\n /g, '')).toBe(long);
  // Words in other scripts and emoji: each piece is whole UTF-8.
  const words = `SUMMARY:${'मसाला चाय 🍵 '.repeat(12)}`;
  const pieces = foldIcsLine(words).split('\r\n');
  for (const piece of pieces) {
    expect(new TextEncoder().encode(piece).length).toBeLessThanOrEqual(75);
    expect(piece).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
    expect(piece).not.toMatch(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/);
  }
  expect(pieces.join('\r\n').replace(/\r\n /g, '')).toBe(words);
  // A long description in a file is folded and reads back the same.
  const text = icsText({
    title: 'Fair',
    start: '2027-03-15',
    description: Array(10).fill('Stalls, music; food').join('\n'),
  })!;
  for (const line of lines(text)) {
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  }
  expect(field(text, 'DESCRIPTION:')).toBe(
    `DESCRIPTION:${Array(10).fill('Stalls\\, music\\; food').join('\\n')}`
  );
});

test('only a web address goes in the file as its URL', () => {
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,hi',
    'mailto:a@b.c',
  ]) {
    const text = icsText({ title: 'X', start: '2027-03-15', url })!;
    expect(field(text, 'URL:'), url).toBeUndefined();
  }
});

test('the .ics link is a calendar file made from the event alone', () => {
  const event = { title: 'Spice fair', start: '2027-03-15' };
  const href = icsHref(event)!;
  expect(href.startsWith('data:text/calendar;charset=utf-8,')).toBe(true);
  expect(decodeURIComponent(href.split(',').slice(1).join(','))).toBe(
    icsText(event)
  );
  expect(icsHref({ title: 'X', start: '' })).toBeNull();
  expect(icsFileName('Live cooking night!')).toBe('live-cooking-night.ics');
  expect(icsFileName('Café Ünïcode')).toBe('cafe-unicode.ics');
  expect(icsFileName('🍵🍵')).toBe('event.ics');
  expect(icsFileName('a'.repeat(100))).toBe(`${'a'.repeat(60)}.ics`);
  expect(icsFileName('Spice -- fair -')).toBe('spice-fair.ics');
  expect(
    icsFileName(
      'one two three four five six seven eight nine ten eleven twelve'
    )
  ).toBe('one-two-three-four-five-six-seven-eight-nine-ten-eleven.ics');
  // Long runs of what isn't a letter take no time at all.
  for (const title of [
    '-'.repeat(50_000),
    `a${'-'.repeat(50_000)}a`,
    `${'-'.repeat(50_000)}x`,
    ' -'.repeat(50_000),
  ]) {
    const began = performance.now();
    const name = icsFileName(title);
    expect(performance.now() - began).toBeLessThan(50);
    expect(name).toMatch(/^[a-z0-9-]*[a-z0-9]\.ics$|^event\.ics$/);
  }
  expect(icsFileName('-'.repeat(50_000))).toBe('event.ics');
});

test('the Google Calendar link carries the same times', () => {
  const timed = googleParams({
    title: 'Live cooking night',
    start: '2027-03-15T19:00',
    end: '2027-03-15T22:00',
    timeZone: 'Asia/Kolkata',
    location: 'The Old Hall, Leeds',
    description: 'Bring an apron.',
    url: 'https://example.com/tickets',
  });
  expect(timed.get('action')).toBe('TEMPLATE');
  expect(timed.get('text')).toBe('Live cooking night');
  expect(timed.get('dates')).toBe('20270315T133000Z/20270315T163000Z');
  expect(timed.get('ctz')).toBe('Asia/Kolkata');
  expect(timed.get('location')).toBe('The Old Hall, Leeds');
  expect(timed.get('details')).toBe(
    'Bring an apron.\n\nhttps://example.com/tickets'
  );
  const days = googleParams({
    title: 'Spice fair',
    start: '2027-03-15',
    end: '2027-03-17',
  });
  expect(days.get('dates')).toBe('20270315/20270318');
  expect(days.has('ctz')).toBe(false);
  const floating = googleParams({ title: 'Call', start: '2027-03-15T19:00' });
  expect(floating.get('dates')).toBe('20270315T190000/20270315T200000');
  const href = googleCalendarHref({ title: 'A & B', start: '2027-03-15' })!;
  expect(href.startsWith('https://calendar.google.com/calendar/render?')).toBe(
    true
  );
  expect(calendarLinks({ title: 'X', start: 'nope' })).toBeNull();
  expect(calendarLinks({ title: 'Fair', start: '2027-03-15' })).toMatchObject({
    fileName: 'fair.ics',
  });
});

test('upcoming, on now and over', () => {
  const span = eventSpan({
    start: '2027-03-15T19:00:00Z',
    end: '2027-03-15T22:00:00Z',
  })!;
  const at = eventInstants(span);
  const start = Date.UTC(2027, 2, 15, 19);
  expect(eventState(at, start - 1)).toBe('upcoming');
  expect(eventState(at, start)).toBe('live');
  expect(eventState(at, start + 3 * H - 1)).toBe('live');
  expect(eventState(at, start + 3 * H)).toBe('past');
  // A floating time happens at that hour where the visitor is.
  const floating = eventSpan({ start: '2027-03-15T19:00' })!;
  expect(eventInstants(floating, 'Asia/Kolkata').start).toBe(
    Date.UTC(2027, 2, 15, 13, 30)
  );
  expect(eventInstants(floating).start).toBe(start);
  // An all-day event is on all day on the visitor's calendar.
  const day = eventSpan({ start: '2027-03-15' })!;
  const inKolkata = eventInstants(day, 'Asia/Kolkata');
  expect(inKolkata.start).toBe(Date.UTC(2027, 2, 14, 18, 30));
  expect(inKolkata.end - inKolkata.start).toBe(D);
});

test('how far away, in the unit a person would say', () => {
  const span = eventSpan({ start: '2027-03-15T19:00:00Z' })!;
  const start = Date.UTC(2027, 2, 15, 19);
  expect(howFar(span, start - 20 * 60_000)).toEqual({
    value: 20,
    unit: 'minute',
  });
  expect(howFar(span, start - 20_000)).toEqual({ value: 1, unit: 'minute' });
  expect(howFar(span, start - 5 * H)).toEqual({ value: 5, unit: 'hour' });
  expect(howFar(span, start - 3 * D)).toEqual({ value: 3, unit: 'day' });
  expect(howFar(span, start - 15 * D)).toEqual({ value: 2, unit: 'week' });
  expect(howFar(span, start - 120 * D)).toEqual({ value: 4, unit: 'month' });
  expect(howFar(span, start - 800 * D)).toEqual({ value: 2, unit: 'year' });
  expect(howFar(span, start + 2 * D)).toEqual({ value: -2, unit: 'day' });
  // An all-day event counts days on the visitor's own calendar.
  const day = eventSpan({ start: '2027-03-15' })!;
  expect(howFar(day, Date.UTC(2027, 2, 14, 22), 'UTC')).toEqual({
    value: 1,
    unit: 'day',
  });
  // 22:00 UTC on the 14th is already the 15th in Kolkata.
  expect(howFar(day, Date.UTC(2027, 2, 14, 22), 'Asia/Kolkata')).toEqual({
    value: 0,
    unit: 'day',
  });
  expect(
    new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(4, 'month')
  ).toBe('in 4 months');
});

test('the date and time are written where the event is, the same anywhere', () => {
  const span = eventSpan({
    start: '2027-03-15T19:00',
    end: '2027-03-15T22:00',
    timeZone: 'America/New_York',
  })!;
  const when = eventWhen(span, 'en-US');
  expect(when.month).toBe('Mar');
  expect(when.day).toBe('15');
  expect(when.text).toMatch(/Mon, Mar 15, 2027, 7:00\s?–\s?10:00\s?PM/);
  expect(when.zone).toBe('EDT');
  expect(when.dateTime).toBe('2027-03-15T23:00:00.000Z');
  // Another language writes its own month.
  expect(eventWhen(span, 'de-DE').month).toMatch(/^Mär/);
  // An offset with no zone is named by the offset.
  const offset = eventSpan({ start: '2027-03-15T19:00:00+05:30' })!;
  expect(eventWhen(offset, 'en-US').zone).toBe('UTC+5:30');
  // An all-day range, and a floating time with no zone to name.
  const days = eventWhen(
    eventSpan({ start: '2027-03-15', end: '2027-03-17' })!,
    'en-US'
  );
  expect(days.text).toMatch(/Mar 15/);
  expect(days.text).toMatch(/17/);
  expect(days.zone).toBeUndefined();
  expect(days.dateTime).toBe('2027-03-15');
  const floating = eventWhen(
    eventSpan({ start: '2027-03-15T19:00' })!,
    'en-US'
  );
  expect(floating.zone).toBeUndefined();
  expect(floating.dateTime).toBe('2027-03-15T19:00');
});

test('the card and the list have every calendar word, and settings for them', () => {
  for (const words of [EVENT_CARD_LABELS, EVENT_LIST_LABELS]) {
    expect(words.addToCalendar).toBe('Add to calendar');
    expect(words.google.length).toBeGreaterThan(0);
    expect(words.download).toContain('.ics');
  }
  const card = blockInfo('event-card');
  expect(card).toMatchObject({ kind: 'card', pack: 'core', client: true });
  const names = card!.settings.map((field) => field.name);
  for (const name of [
    'href',
    'title',
    'start',
    'end',
    'timeZone',
    'tile',
    'calendar',
    'sell',
  ]) {
    expect(names).toContain(name);
  }
  expect(
    blockInfo('event-list')!.settings.some((field) => field.name === 'calendar')
  ).toBe(true);
});

test('the card renders on the server with working calendar links and no clock', () => {
  const props = {
    title: 'Live cooking night',
    start: '2027-03-15T19:00',
    end: '2027-03-15T22:00',
    timeZone: 'Europe/London',
    href: 'https://example.com/tickets',
  };
  const html = renderToString(createElement(EventCard, props));
  // The same every time: nothing in it depends on when or where it renders.
  expect(renderToString(createElement(EventCard, props))).toBe(html);
  // No "how far away" or past state until the visitor's clock is known.
  expect(html).not.toContain('data-state');
  expect(html).not.toContain('data-chip');
  expect(html).toContain('Mon, Mar 15, 2027');
  // Both calendar links are in the HTML, so they work without JavaScript.
  expect(html).toContain('href="https://calendar.google.com/calendar/render?');
  expect(html).toContain('href="data:text/calendar;charset=utf-8,');
  expect(html).toContain('download="live-cooking-night.ics"');
  // With a fixed clock, the chip renders on the server too.
  const fixed = renderToString(
    createElement(EventCard, { ...props, now: Date.UTC(2026, 10, 15, 9) })
  );
  expect(fixed).toContain('In 4 months');
  const list = renderToString(
    createElement(EventList, {
      data: [
        { date: 'Sat 6 Dec', dateTime: '2026-12-06', title: 'Fair' },
        { date: 'Soon', title: 'No date yet' },
      ],
    })
  );
  expect(list.match(/<summary/g)).toHaveLength(1);
});
