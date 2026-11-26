'use client';

import { Fragment, useEffect, useRef, useState, type RefObject } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { cn } from '../system/cn';
import { useHydrated, useVisitorLocale } from '../system/locale';
import { usePageWords } from '../system/page-words';
import { WORDS_EN } from '../system/words/en';
import {
  LOCAL_TIME_CITIES,
  describeOffset,
  formatLocalDate,
  isLocalTimeCity,
  isOpenAt,
  isValidTimeZone,
  localTimeParts,
  localTimeZone,
  msToNextMinute,
  offsetFromVisitor,
  zoneDateTime,
  zoneOffset,
  type LocalTimeCity,
  type LocalTimeClock,
  type LocalTimeHours,
  type OffsetWords,
} from '../system/local-time';

/** The words a visitor reads on the block. */
export type LocalTimeLabels = OffsetWords & {
  /** Above the time. Empty for none. */
  title: string;
  /** The chip while the creator's hours are on. */
  open: string;
  /** The chip outside them. */
  away: string;
};

export const LOCAL_TIME_LABELS: LocalTimeLabels = WORDS_EN.localTime;

/** How much of the grid the block takes, in half-row tiles. */
export const LOCAL_TIME_TILES = ['2x1', '2x2'] as const;
export type LocalTimeTile = (typeof LOCAL_TIME_TILES)[number];

/** The visitor's own time zone, read in the browser. */
function browserTimeZone(): string | undefined {
  try {
    const zone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(zone) ? zone : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The live clock: the time `start` until the page runs, then the browser's,
 * moved on at the turn of each minute while the block is on screen and the
 * tab is showing. Never more than once a minute.
 */
function useMinuteClock(
  start: number | undefined,
  live: boolean,
  target: RefObject<HTMLElement | null>
) {
  const [ticked, setTicked] = useState<number | null>(null);
  useEffect(() => {
    if (!live) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let onScreen = true;
    const showing = () =>
      onScreen &&
      (typeof document === 'undefined' ||
        document.visibilityState !== 'hidden');
    const tick = () => {
      clearTimeout(timer);
      timer = undefined;
      if (!showing()) return;
      const now = Date.now();
      setTicked(now);
      timer = setTimeout(tick, msToNextMinute(now) + 50);
    };
    // After the first paint, so the server and the first render agree.
    const first = setTimeout(tick, 0);
    const el = target.current;
    const observer =
      el && typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            const was = onScreen;
            onScreen = Boolean(entry?.isIntersecting);
            if (onScreen && !was) tick();
            if (!onScreen) clearTimeout(timer);
          })
        : null;
    if (el) observer?.observe(el);
    const onVisibility = () => {
      if (showing()) tick();
      else clearTimeout(timer);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimeout(first);
      clearTimeout(timer);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [live, target]);
  return live ? (ticked ?? start ?? null) : (start ?? null);
}

/**
 * The creator's local time, so visitors in other countries know whether it's
 * a good moment to message or book: a title, the time large, and the date
 * and city small under it. Optionally how far ahead or behind the visitor
 * that is ("4 h 30 min ahead of you"), worked out in the visitor's browser,
 * and an "Open now" or "Away" chip from the creator's working hours.
 *
 * The server can't know the time a visitor will read the page at, so it
 * writes the time from `now` (the app's clock when it made the page), or a
 * placeholder without it. The browser takes over once the page runs, and
 * moves the time on once a minute, only while the block is on screen and the
 * tab is showing. Screen readers read the time when they reach it, never on
 * each tick, and nothing moves.
 *
 * `timeZone`, an IANA zone such as "Europe/Lisbon", wins over the city's;
 * one Intl doesn't know falls back to the city's, so a typo can't break the
 * page.
 */
export function LocalTime({
  city,
  cityName,
  timeZone,
  clock = 'auto',
  showDate = true,
  showCity = true,
  showOffset = true,
  hours,
  tile = '2x1',
  labels,
  locale,
  now: start,
  live = true,
  visitorTimeZone,
  ...root
}: BlockRootProps & {
  /** The creator's city, from LOCAL_TIME_CITY_IDS. */
  city: LocalTimeCity;
  /** The city's name as shown, over the list's (as "Kochi"). */
  cityName?: string;
  /** An IANA time zone, over the city's. */
  timeZone?: string;
  /** 12-hour, 24-hour, or the visitor's own way. */
  clock?: LocalTimeClock;
  showDate?: boolean;
  showCity?: boolean;
  /** How far ahead or behind the visitor the creator is. */
  showOffset?: boolean;
  /** When the creator is around, for the "Open now" or "Away" chip. */
  hours?: LocalTimeHours;
  tile?: LocalTimeTile;
  labels?: Partial<LocalTimeLabels>;
  /** For the time and date. Left out, the visitor's own once the page runs. */
  locale?: string;
  /**
   * The time (ms) the server and the first render show, such as the app's
   * clock when it made the page. Left out, a placeholder until the page runs.
   */
  now?: number;
  /** False keeps showing `now`, for previews and tests. */
  live?: boolean;
  /** The visitor's IANA time zone. Left out, the browser's, once it runs. */
  visitorTimeZone?: string;
}) {
  const words = usePageWords('localTime', labels);
  const zone = localTimeZone(city, timeZone);
  const place =
    cityName?.trim() ||
    (isLocalTimeCity(city) ? LOCAL_TIME_CITIES[city].name : zone);
  const shownLocale = useVisitorLocale(locale);
  const hydrated = useHydrated();
  const timeRef = useRef<HTMLParagraphElement>(null);
  const at = useMinuteClock(start, live, timeRef);
  const large = tile === '2x2';

  const visitorZone = isValidTimeZone(visitorTimeZone)
    ? visitorTimeZone
    : hydrated
      ? browserTimeZone()
      : undefined;
  let offset: string | null = null;
  if (showOffset && at !== null) {
    if (visitorZone) {
      offset = describeOffset(offsetFromVisitor(at, zone, visitorZone), words);
    } else if (hydrated) {
      // No zone name from the browser: its offset still tells.
      offset = describeOffset(
        zoneOffset(at, zone) + new Date(at).getTimezoneOffset(),
        words
      );
    }
  }
  const open = at === null ? null : isOpenAt(at, zone, hours);
  const date =
    showDate && at !== null ? formatLocalDate(at, zone, shownLocale) : null;
  const under = [date, showCity ? place : null].filter(Boolean);

  return (
    <Block
      name="local-time"
      data-tile={tile}
      data-zone={zone}
      {...root}
      className={cn('@container', root.className)}
    >
      {words.title ? (
        <p className="text-site-text-2 m-0 text-sm font-semibold">
          {words.title}
        </p>
      ) : null}
      <p
        ref={timeRef}
        className={cn(
          'm-0 leading-none font-bold tracking-tight tabular-nums',
          large ? 'text-5xl @md:text-6xl' : 'text-4xl'
        )}
      >
        {at === null ? (
          <span aria-hidden className="text-site-text-2">
            --:--
          </span>
        ) : (
          <time dateTime={zoneDateTime(at, zone)}>
            {localTimeParts(at, zone, shownLocale, clock).map((part, i) =>
              part.type === 'period' ? (
                <span
                  key={i}
                  className={cn(
                    'font-semibold tracking-normal',
                    large ? 'text-2xl' : 'text-lg',
                    i > 0 ? 'ms-1.5' : 'me-1.5'
                  )}
                >
                  {part.value}
                </span>
              ) : (
                <span key={i}>{part.value}</span>
              )
            )}
          </time>
        )}
      </p>
      {under.length ? (
        <p className="text-site-text-2 m-0 text-sm">
          {under.map((item, i) => (
            <Fragment key={i}>
              {i > 0 ? (
                <>
                  <span aria-hidden> · </span>
                  <span className="sr-only">, </span>
                </>
              ) : null}
              <span>{item}</span>
            </Fragment>
          ))}
        </p>
      ) : null}
      {offset || open !== null ? (
        <div
          className={cn(
            'flex flex-wrap items-center gap-x-3 gap-y-2',
            large ? 'mt-auto' : undefined
          )}
        >
          {open !== null ? (
            <p className="m-0" data-open={open}>
              <span className="bg-site-surface-2 text-site-text inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
                <span
                  aria-hidden
                  className={cn(
                    'size-2 rounded-full',
                    open ? 'bg-site-accent' : 'bg-site-text-2'
                  )}
                />
                {open ? words.open : words.away}
              </span>
            </p>
          ) : null}
          {offset ? (
            <p className="text-site-text-2 m-0 text-sm" data-offset>
              {offset}
            </p>
          ) : null}
        </div>
      ) : null}
    </Block>
  );
}
