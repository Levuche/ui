'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { ClockIcon, MapPinIcon } from '../atoms/icons';
import { Skeleton } from '../atoms/skeleton';
import { Badge } from '../atoms/text';
import { Thumb } from '../atoms/thumb';
import {
  AddToCalendar,
  type CalendarLabels,
} from '../molecules/add-to-calendar';
import type { HeadingTag } from '../molecules/item-head';
import { SellButton, type SellProps } from '../molecules/sell-button';
import {
  eventInstants,
  eventSpan,
  eventState,
  eventWhen,
  howFar,
  type EventState,
} from '../system/calendar';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { toImageSource, type ImageSrc } from '../system/image';
import type { LiveProps } from '../system/live';
import { useVisitorLocale } from '../system/locale';
import { usePageWords } from '../system/page-words';
import { sellJson } from '../system/sell';
import { WORDS_EN } from '../system/words/en';

/** The words on the card. The "in 4 months" chip comes from the locale. */
export type EventCardLabels = CalendarLabels & {
  tickets: string;
  soldOut: string;
  /** The chip while the event is on. */
  live: string;
  /** The chip once it's over. */
  ended: string;
  /** What screen readers hear while the event's details load. */
  loading: string;
  /** The title when there's none yet. */
  untitled: string;
};

export const EVENT_CARD_LABELS: EventCardLabels = WORDS_EN.eventCard;

/** How much of the grid the card takes: a full row, or a full row twice as tall. */
export const EVENT_CARD_TILES = ['2x1', '2x2'] as const;
export type EventCardTile = (typeof EVENT_CARD_TILES)[number];

/**
 * What the app read from the event's page (its link), to fill the card
 * where the creator left a field empty. The card never fetches it.
 */
export type EventDetails = {
  title?: string;
  start?: string;
  end?: string;
  timeZone?: string;
  allDay?: boolean;
  image?: ImageSrc | null;
  venue?: string;
  city?: string;
  description?: string;
};

/** The visitor's own time zone, once the page runs in their browser. */
const visitorZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

/** "in 4 months" as a chip starts it: "In 4 months". */
const capitalise = (text: string, locale?: string) =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

/** The soft wash behind a card with no picture, from the accent colour. */
const WASH: CSSProperties = {
  backgroundImage:
    'linear-gradient(135deg, color-mix(in oklab, var(--site-accent) 20%, var(--block-fill)), var(--block-fill) 70%)',
};

/**
 * One event: a date badge (MAR 15), a chip saying how far away it is ("In 4
 * months", in the visitor's language), the title, the date and time with
 * the event's time zone, the place, a tickets button and "Add to calendar"
 * (a Google Calendar link and an .ics file for any other calendar).
 *
 * `tile` is its size on the grid: `2x1` puts the picture behind the words,
 * dimmed so they stay readable; `2x2` shows the picture across the top and
 * the description too. With no picture, a soft wash of the page's accent
 * colour sits behind it. Once the event is over it says "Ended", the
 * picture turns grey and the buttons go.
 *
 * Tickets go to `href`, or sell through BuildBase with `sell`. The creator
 * can leave the title, times, picture and place empty and paste the event's
 * link instead: the app reads that page and passes what it found in
 * `details` (with `loading` while it does), and the card fills the gaps.
 *
 * Times: see calendar.ts. The date and time show the same on the server and
 * in the browser; "how far away" and the past state need the visitor's
 * clock, so they appear once the page runs (or at once with `now`).
 */
export function EventCard({
  title,
  start,
  end,
  timeZone,
  allDay = false,
  venue,
  city,
  description,
  image,
  href,
  soldOut = false,
  tile = '2x1',
  calendar = true,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  newTab,
  sponsored,
  nofollow,
  details,
  now: fixedNow,
  labels,
  locale,
  headingAs: Heading = 'h3',
  ...root
}: BlockRootProps &
  SellProps &
  LinkBehavior & {
    title?: string;
    /** When it starts, as "2027-03-15T19:00" or "2027-03-15" (see calendar.ts). */
    start?: string;
    /** When it ends; for an all-day event, its last day. */
    end?: string;
    /** Where it happens, as "Europe/London". */
    timeZone?: string;
    /** Only the dates count. */
    allDay?: boolean;
    venue?: string;
    city?: string;
    /** Shown on the 2x2 card, and put in the calendar entry. */
    description?: string;
    /** undefined or null: the accent wash instead. */
    image?: ImageSrc | null;
    /** The event's page or where tickets are sold. */
    href?: string;
    soldOut?: boolean;
    tile?: EventCardTile;
    /** Show "Add to calendar". */
    calendar?: boolean;
    /** What the app read from the event's link, for the fields left empty. */
    details?: LiveProps<EventDetails>;
    /** Freeze the clock at this time (ms), for previews and tests. */
    now?: number;
    labels?: Partial<EventCardLabels>;
    /** For the dates. Left out, the server's and browser's agree (en-US) until the page runs. */
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const words = usePageWords('eventCard', labels);
  const found = details?.data ?? undefined;
  const event = {
    title: title?.trim() || found?.title?.trim() || '',
    start: start || found?.start,
    end: start ? end : (end ?? found?.end),
    timeZone: timeZone || found?.timeZone,
    allDay: start ? allDay : (allDay || found?.allDay) === true,
    venue: venue || found?.venue,
    city: city || found?.city,
    description: description || found?.description,
    image: image ?? found?.image,
  };
  const visitorLocale = useVisitorLocale(locale);

  // The clock and the visitor's zone start in the browser, so the server
  // and the first render agree; then the chip ticks over once a minute.
  const [clock, setClock] = useState<{ now: number; zone?: string } | null>(
    null
  );
  useEffect(() => {
    const tick = () =>
      setClock({ now: fixedNow ?? Date.now(), zone: visitorZone() });
    const first = setTimeout(tick, 0);
    const timer = fixedNow === undefined ? setInterval(tick, 60_000) : null;
    return () => {
      clearTimeout(first);
      if (timer) clearInterval(timer);
    };
  }, [fixedNow]);

  if (details?.loading && !event.title && !event.start) {
    return (
      <Block
        as="article"
        name="event-card"
        data-tile={tile}
        {...root}
        className={cn('@container', root.className)}
      >
        <div
          role="status"
          aria-busy="true"
          aria-label={words.loading}
          className="flex items-start gap-3"
        >
          <Skeleton shape="box" className="aspect-square w-14 flex-none" />
          <span className="flex flex-1 flex-col gap-2">
            <Skeleton className="w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="w-2/3" />
          </span>
        </div>
      </Block>
    );
  }

  const span = event.start
    ? eventSpan({
        start: event.start,
        end: event.end,
        timeZone: event.timeZone,
        allDay: event.allDay,
      })
    : null;
  const when = span ? eventWhen(span, visitorLocale) : null;
  const now = fixedNow ?? clock?.now ?? null;
  const state: EventState | null =
    span && now !== null
      ? eventState(eventInstants(span, clock?.zone), now)
      : null;
  const past = state === 'past';
  let chip: string | null = null;
  if (state === 'live') chip = words.live;
  else if (past) chip = words.ended;
  else if (state === 'upcoming' && span && now !== null) {
    const far = howFar(span, now, clock?.zone);
    chip = capitalise(
      new Intl.RelativeTimeFormat(visitorLocale, { numeric: 'auto' }).format(
        far.value,
        far.unit
      ),
      visitorLocale
    );
  }

  const name = event.title || words.untitled;
  const place = [event.venue, event.city].filter(Boolean).join(', ');
  const picture = toImageSource(event.image);
  const tall = tile === '2x2';
  const ownBackground = root.background !== undefined;

  let tickets: ReactNode = null;
  if (soldOut && !sellJson(sell)) {
    tickets = (
      <Badge tone="outline" className="self-center">
        {words.soldOut}
      </Badge>
    );
  } else if (sell || href) {
    tickets = (
      <SellButton
        href={href}
        sell={sell}
        // The Sold out toggle closes the buy button too.
        sellState={soldOut ? 'sold_out' : sellState}
        sellLabels={sellLabels}
        renderBuy={renderBuy}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
        size="sm"
        action="event_tickets"
      >
        {words.tickets}
        <span className="sr-only">: {name}</span>
      </SellButton>
    );
  }
  const addToCalendar =
    calendar && event.start ? (
      <AddToCalendar
        event={{
          title: name,
          start: event.start,
          end: event.end,
          timeZone: event.timeZone,
          allDay: event.allDay,
          location: place || undefined,
          description: event.description,
          url: href,
        }}
        labels={words}
        context={name}
        fullWidth
      />
    ) : null;

  return (
    <Block
      as="article"
      name="event-card"
      data-tile={tile}
      {...(state ? { 'data-state': state } : {})}
      {...root}
      className={cn(
        'p-block @container relative isolate',
        tall && 'min-h-[22rem]',
        root.className
      )}
    >
      {/* Behind the words: the dimmed picture, or the accent wash. */}
      {(!tall && picture) || (!picture && !ownBackground) ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
          style={picture ? undefined : WASH}
        >
          {picture ? (
            <>
              <Thumb
                src={picture}
                alt=""
                sizes="(min-width: 768px) 576px, 100vw"
                className={cn('size-full rounded-none', past && 'grayscale')}
              />
              <span className="absolute inset-0 bg-[color-mix(in_oklab,var(--block-fill)_82%,transparent)]" />
            </>
          ) : null}
        </span>
      ) : null}
      {tall && picture ? (
        <div
          aria-hidden
          className="-mx-block -mt-block relative overflow-hidden rounded-t-[inherit]"
        >
          <Thumb
            src={picture}
            alt=""
            ratio="video"
            sizes="(min-width: 768px) 576px, 100vw"
            className={cn('w-full rounded-none', past && 'grayscale')}
          />
          <span className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[var(--block-fill)] to-transparent" />
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        {when ? (
          <span
            aria-hidden
            className="bg-site-surface text-site-text border-site-border rounded-block-inner flex w-14 flex-none flex-col items-center border py-1.5 leading-none"
          >
            <span className="text-xs font-bold tracking-wide uppercase">
              {when.month}
            </span>
            <span className="text-2xl font-bold tabular-nums">{when.day}</span>
          </span>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {chip ? (
            <Badge
              tone={past ? 'outline' : 'solid'}
              data-chip={state ?? undefined}
              className="self-start"
            >
              {state === 'live' ? (
                <span
                  aria-hidden
                  className="bg-site-on-button size-2 rounded-full motion-safe:animate-pulse"
                />
              ) : null}
              {chip}
            </Badge>
          ) : null}
          <Heading className="text-block-title m-0 leading-tight font-bold [overflow-wrap:anywhere]">
            {name}
          </Heading>
          {when ? (
            <p className="m-0 flex items-start gap-1.5 text-sm">
              <ClockIcon size={16} className="mt-0.5 flex-none" />
              <span>
                <time dateTime={when.dateTime}>{when.text}</time>
                {when.zone ? (
                  <span className="text-site-text-2"> {when.zone}</span>
                ) : null}
              </span>
            </p>
          ) : null}
          {place ? (
            <p className="m-0 flex items-start gap-1.5 text-sm">
              <MapPinIcon size={16} className="mt-0.5 flex-none" />
              <span className="[overflow-wrap:anywhere]">{place}</span>
            </p>
          ) : null}
        </div>
      </div>

      {tall && event.description ? (
        <p className="text-site-text-2 m-0 line-clamp-4 text-sm whitespace-pre-line">
          {event.description}
        </p>
      ) : null}

      {!past && (tickets || addToCalendar) ? (
        <div className="mt-auto grid items-start gap-2 @md:grid-cols-2">
          {tickets}
          {addToCalendar}
        </div>
      ) : null}
    </Block>
  );
}
