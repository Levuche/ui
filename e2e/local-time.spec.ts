import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { blockInfo } from '../src/system/registry';
import { fitsSetting, settingDefaults } from '../src/system/settings';
import {
  LOCAL_TIME_CITIES,
  LOCAL_TIME_CITY_IDS,
  LOCAL_TIME_CITY_LABELS,
  describeOffset,
  formatLocalDate,
  formatLocalTime,
  isLocalTimeCity,
  isOpenAt,
  isValidTimeZone,
  localTimeParts,
  localTimeZone,
  msToNextMinute,
  offsetFromVisitor,
  parseClockTime,
  usesTwelveHours,
  zoneClock,
  zoneDateTime,
  zoneOffset,
} from '../src/system/local-time';
import { LOCAL_TIME_LABELS, LocalTime } from '../src/organisms/local-time';

/* Plain checks of the local time block's time-zone maths. No browser. */

/** Thursday 26 November 2026, 15:05 UTC. */
const AT = Date.UTC(2026, 10, 26, 15, 5, 0);

test('every city has a name and a time zone Intl knows', () => {
  expect(new Set(LOCAL_TIME_CITY_IDS).size).toBe(LOCAL_TIME_CITY_IDS.length);
  expect(Object.keys(LOCAL_TIME_CITIES).sort()).toEqual(
    [...LOCAL_TIME_CITY_IDS].sort()
  );
  for (const id of LOCAL_TIME_CITY_IDS) {
    const city = LOCAL_TIME_CITIES[id];
    expect(city.name.length, id).toBeGreaterThan(0);
    expect(isValidTimeZone(city.zone), `${id}: ${city.zone}`).toBe(true);
    expect(LOCAL_TIME_CITY_LABELS[id]).toBe(city.name);
    expect(isLocalTimeCity(id)).toBe(true);
  }
  expect(isLocalTimeCity('atlantis')).toBe(false);
});

test('a time zone Intl doesn’t know falls back safely', () => {
  expect(isValidTimeZone('Europe/Lisbon')).toBe(true);
  for (const bad of [
    'Mars/Olympus',
    '',
    '   ',
    'Europe/Lisbon"><x',
    42,
    null,
  ]) {
    expect(isValidTimeZone(bad), String(bad)).toBe(false);
  }
  // A good zone wins over the city; a bad one gives the city's.
  expect(localTimeZone('lisbon', 'Asia/Tokyo')).toBe('Asia/Tokyo');
  expect(localTimeZone('lisbon', ' Asia/Tokyo ')).toBe('Asia/Tokyo');
  expect(localTimeZone('lisbon', 'Mars/Olympus')).toBe('Europe/Lisbon');
  expect(localTimeZone('lisbon')).toBe('Europe/Lisbon');
  // Neither: UTC, never a throw.
  expect(localTimeZone('atlantis', 'nope')).toBe('UTC');
  expect(localTimeZone()).toBe('UTC');
});

test('offsets follow summer time in both hemispheres', () => {
  const january = Date.UTC(2026, 0, 15, 12);
  const july = Date.UTC(2026, 6, 15, 12);
  expect(zoneOffset(january, 'Europe/London')).toBe(0);
  expect(zoneOffset(july, 'Europe/London')).toBe(60);
  expect(zoneOffset(january, 'America/New_York')).toBe(-300);
  expect(zoneOffset(july, 'America/New_York')).toBe(-240);
  // The south's summer is the north's winter.
  expect(zoneOffset(january, 'Australia/Sydney')).toBe(660);
  expect(zoneOffset(july, 'Australia/Sydney')).toBe(600);
  // No summer time.
  expect(zoneOffset(january, 'Asia/Tokyo')).toBe(540);
  expect(zoneOffset(july, 'Asia/Tokyo')).toBe(540);
});

test('the clock jumps at the change, not before', () => {
  // New York springs forward at 2:00 on 8 March 2026 (07:00 UTC).
  const change = Date.UTC(2026, 2, 8, 7, 0);
  expect(zoneOffset(change - 60_000, 'America/New_York')).toBe(-300);
  expect(zoneOffset(change, 'America/New_York')).toBe(-240);
  expect(formatLocalTime(change - 60_000, 'America/New_York', 'en-US')).toBe(
    '1:59 AM'
  );
  expect(formatLocalTime(change, 'America/New_York', 'en-US')).toBe('3:00 AM');
  // London falls back at 2:00 on 25 October 2026 (01:00 UTC).
  const back = Date.UTC(2026, 9, 25, 1, 0);
  expect(formatLocalTime(back - 60_000, 'Europe/London', 'en-GB')).toBe(
    '01:59'
  );
  expect(formatLocalTime(back, 'Europe/London', 'en-GB')).toBe('01:00');
  // The visitor and the creator can change on different days: from 8 to
  // 29 March New York is an hour nearer London.
  const between = Date.UTC(2026, 2, 20, 12);
  expect(offsetFromVisitor(between, 'Europe/London', 'America/New_York')).toBe(
    240
  );
  expect(
    offsetFromVisitor(
      Date.UTC(2026, 3, 20, 12),
      'Europe/London',
      'America/New_York'
    )
  ).toBe(300);
});

test('half-hour and quarter-hour zones', () => {
  expect(zoneOffset(AT, 'Asia/Kolkata')).toBe(330);
  expect(zoneOffset(AT, 'Asia/Kathmandu')).toBe(345);
  expect(zoneOffset(AT, 'America/St_Johns')).toBe(-210);
  expect(zoneOffset(AT, 'Australia/Adelaide')).toBe(630);
  expect(formatLocalTime(AT, 'Asia/Kolkata', 'en-US')).toBe('8:35 PM');
  expect(formatLocalTime(AT, 'Asia/Kathmandu', 'en-GB')).toBe('20:50');
  expect(zoneDateTime(AT, 'Asia/Kolkata')).toBe('2026-11-26T20:35+05:30');
  expect(zoneDateTime(AT, 'America/St_Johns')).toBe('2026-11-26T11:35-03:30');
  expect(zoneDateTime(AT, 'UTC')).toBe('2026-11-26T15:05+00:00');
});

test('12 or 24 hours by the locale, or as the creator picks', () => {
  expect(usesTwelveHours('en-US')).toBe(true);
  expect(usesTwelveHours('en-IN')).toBe(true);
  expect(usesTwelveHours('en-GB')).toBe(false);
  expect(usesTwelveHours('de-DE')).toBe(false);
  expect(usesTwelveHours('ja-JP')).toBe(false);
  expect(formatLocalTime(AT, 'UTC', 'en-US')).toBe('3:05 PM');
  expect(formatLocalTime(AT, 'UTC', 'en-GB')).toBe('15:05');
  expect(formatLocalTime(AT, 'UTC', 'de-DE')).toBe('15:05');
  // Forced either way, whatever the locale.
  expect(formatLocalTime(AT, 'UTC', 'en-US', 24)).toBe('15:05');
  expect(formatLocalTime(AT, 'UTC', 'de-DE', 12)).toMatch(/^3:05 PM$/i);
  // Midnight on a 24-hour clock is 00, on a 12-hour one 12.
  const midnight = Date.UTC(2026, 10, 26, 0, 5);
  expect(formatLocalTime(midnight, 'UTC', 'en-GB')).toBe('00:05');
  expect(formatLocalTime(midnight, 'UTC', 'en-US')).toBe('12:05 AM');
  expect(formatLocalTime(midnight, 'UTC', 'en-US', 24)).toBe('00:05');
  // The day period is its own piece, wherever the locale puts it.
  expect(localTimeParts(AT, 'UTC', 'en-US')).toEqual([
    { type: 'time', value: '3:05' },
    { type: 'period', value: 'PM' },
  ]);
  expect(localTimeParts(AT, 'UTC', 'ko-KR')).toEqual([
    { type: 'period', value: '오후' },
    { type: 'time', value: '3:05' },
  ]);
  expect(localTimeParts(AT, 'UTC', 'en-GB')).toEqual([
    { type: 'time', value: '15:05' },
  ]);
});

test('the date is the one in the creator’s zone', () => {
  // 15:05 UTC on Thursday is already Friday in Auckland.
  expect(formatLocalDate(AT, 'UTC', 'en-US')).toBe('Thu, Nov 26');
  expect(formatLocalDate(AT, 'Pacific/Auckland', 'en-US')).toBe('Fri, Nov 27');
  expect(formatLocalDate(AT, 'Pacific/Auckland', 'en-GB')).toBe('Fri 27 Nov');
  const c = zoneClock(AT, 'Pacific/Auckland');
  expect([c.day, c.hour, c.minute, c.weekday]).toEqual([27, 4, 5, 4]);
});

test('how far ahead or behind the visitor', () => {
  expect(offsetFromVisitor(AT, 'Asia/Kolkata', 'Europe/London')).toBe(330);
  expect(offsetFromVisitor(AT, 'Europe/London', 'Asia/Kolkata')).toBe(-330);
  expect(offsetFromVisitor(AT, 'Asia/Kolkata', 'Asia/Kolkata')).toBe(0);
  expect(describeOffset(270)).toBe('4 h 30 min ahead of you');
  expect(describeOffset(330)).toBe('5 h 30 min ahead of you');
  expect(describeOffset(-60)).toBe('1 h behind you');
  expect(describeOffset(-45)).toBe('45 min behind you');
  expect(describeOffset(0)).toBe('Same time as you');
  expect(describeOffset(Number.NaN)).toBe('Same time as you');
  // In the creator's own words.
  expect(
    describeOffset(-90, {
      ...LOCAL_TIME_LABELS,
      behind: 'Je suis {time} derrière vous',
      hours: '{n} h',
      minutes: '{n} min',
    })
  ).toBe('Je suis 1 h 30 min derrière vous');
});

test('working hours, in the creator’s zone, past midnight too', () => {
  const hours = { from: '09:00', to: '17:30' };
  // Thursday 15:05 UTC is 20:35 in Kolkata: away; 15:05 in London: open.
  expect(isOpenAt(AT, 'Europe/London', hours)).toBe(true);
  expect(isOpenAt(AT, 'Asia/Kolkata', hours)).toBe(false);
  // Saturday is off by default, and on when listed.
  const saturday = Date.UTC(2026, 10, 28, 12);
  expect(isOpenAt(saturday, 'UTC', hours)).toBe(false);
  expect(isOpenAt(saturday, 'UTC', { ...hours, days: ['sat'] })).toBe(true);
  // The end is not open.
  expect(isOpenAt(Date.UTC(2026, 10, 26, 17, 30), 'UTC', hours)).toBe(false);
  expect(isOpenAt(Date.UTC(2026, 10, 26, 17, 29), 'UTC', hours)).toBe(true);
  // A night shift on Friday runs into Saturday morning.
  const night = { from: '22:00', to: '02:00', days: ['fri' as const] };
  expect(isOpenAt(Date.UTC(2026, 10, 27, 23), 'UTC', night)).toBe(true);
  expect(isOpenAt(Date.UTC(2026, 10, 28, 1), 'UTC', night)).toBe(true);
  expect(isOpenAt(Date.UTC(2026, 10, 28, 23), 'UTC', night)).toBe(false);
  // Hours that can't be read show no chip.
  expect(isOpenAt(AT, 'UTC', undefined)).toBeNull();
  expect(isOpenAt(AT, 'UTC', { from: '9am', to: '17:00' })).toBeNull();
  expect(isOpenAt(AT, 'UTC', { from: '09:00', to: '09:00' })).toBeNull();
  expect(parseClockTime('9:30')).toBe(570);
  expect(parseClockTime('24:00')).toBe(1440);
  expect(parseClockTime('24:01')).toBeNull();
  expect(parseClockTime('12:60')).toBeNull();
});

test('the clock moves on at the turn of each minute', () => {
  expect(msToNextMinute(AT)).toBe(60_000);
  expect(msToNextMinute(AT + 1)).toBe(59_999);
  expect(msToNextMinute(AT + 59_999)).toBe(1);
  // Never more often than once a minute, never less than once.
  for (const at of [AT, AT + 30_000, AT + 59_000]) {
    const wait = msToNextMinute(at);
    expect(wait).toBeGreaterThan(0);
    expect(wait).toBeLessThanOrEqual(60_000);
  }
});

test('the block’s settings and words', () => {
  const block = blockInfo('local-time');
  expect(block?.component).toBe('LocalTime');
  expect(block?.client).toBe(true);
  const city = block?.settings.find((field) => field.name === 'city');
  expect(city?.required).toBe(true);
  expect(city?.type === 'choice' && city.options).toBe(LOCAL_TIME_CITY_IDS);
  const values = settingDefaults(block?.settings ?? []);
  expect(values).toMatchObject({
    clock: 'auto',
    showDate: true,
    showCity: true,
    showOffset: true,
    tile: '2x1',
  });
  for (const field of block?.settings ?? []) {
    if (field.name in values) {
      expect(fitsSetting(field, values[field.name]), field.name).toBe(true);
    }
  }
  for (const [key, words] of Object.entries(LOCAL_TIME_LABELS)) {
    expect(words.length, key).toBeGreaterThan(0);
  }
  expect(LOCAL_TIME_LABELS.ahead).toContain('{time}');
  expect(LOCAL_TIME_LABELS.behind).toContain('{time}');
});

test('the server writes a stable time, and nothing it can’t know', () => {
  // Without a time from the app: a placeholder, the same on every render.
  const blank = renderToString(createElement(LocalTime, { city: 'mumbai' }));
  expect(blank).toContain('--:--');
  expect(blank).not.toContain('<time');
  expect(blank).not.toMatch(/ahead of you|behind you|Same time/);
  expect(renderToString(createElement(LocalTime, { city: 'mumbai' }))).toBe(
    blank
  );
  // With the app's time: that time, in the server's locale (en-US), without
  // seconds, and still no offset, which needs the visitor's browser.
  const html = renderToString(
    createElement(LocalTime, { city: 'mumbai', now: AT + 42_000 })
  );
  expect(html).toMatch(/datetime="2026-11-26T20:35\+05:30"/i);
  expect(html).toContain('8:35');
  expect(html).not.toContain(':42');
  expect(html).toContain('Thu, Nov 26');
  expect(html).toContain('Mumbai');
  expect(html).not.toMatch(/ahead of you|behind you|Same time/);
  expect(html).not.toContain('aria-live');
  // A bad zone never breaks the page.
  expect(() =>
    renderToString(
      createElement(LocalTime, {
        city: 'lisbon',
        timeZone: 'Not/AZone',
        now: AT,
      })
    )
  ).not.toThrow();
});
