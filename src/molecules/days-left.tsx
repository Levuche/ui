'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import { useHydrated, useVisitorLocale } from '../system/locale';
import { usePageWords } from '../system/page-words';
import {
  deadlineState,
  fillTemplate,
  formatDeadline,
} from '../system/progress';
import { WORDS_EN } from '../system/words/en';

/** The words of a DaysLeft chip. {date} and {n} are filled in. */
export type DaysLeftLabels = {
  /** The deadline, as "Due Dec 31, 2026". */
  due: string;
  /** Days left, as "37 days left". */
  days: string;
  /** One day left (or less). */
  oneDay: string;
  /** The deadline has passed. */
  ended: string;
};

export const DAYS_LEFT_LABELS: DaysLeftLabels = WORDS_EN.daysLeft;

/**
 * A deadline as a chip: its date, and the days left once the page is
 * running in the visitor's browser ("Due Dec 31, 2026 · 37 days left").
 *
 * The server doesn't know the visitor's clock or time zone, so the first
 * render writes the date in UTC and en-US with no days left, which the
 * browser's first render matches; the visitor's own date and the days left
 * follow. Pass `now` (ms) to freeze the clock for previews and tests.
 */
export function DaysLeft({
  deadline,
  now: fixedNow,
  locale,
  labels,
  className,
}: {
  /** A date and time, as an ISO string. */
  deadline: Date | string;
  /** Freeze the clock at this time (ms), for previews and tests. */
  now?: number;
  locale?: string;
  labels?: Partial<DaysLeftLabels>;
  className?: string;
}) {
  const words = usePageWords('daysLeft', labels);
  const hydrated = useHydrated();
  const shownLocale = useVisitorLocale(locale);
  // The clock starts in the browser, so the server and the first render
  // agree (no days left until it has been read once).
  const [read, setRead] = useState<number | null>(null);
  useEffect(() => {
    if (fixedNow !== undefined) return;
    const first = setTimeout(() => setRead(Date.now()), 0);
    return () => clearTimeout(first);
  }, [fixedNow]);
  const now = fixedNow ?? read;

  const date = formatDeadline(deadline, {
    locale: shownLocale,
    timeZone: hydrated ? undefined : 'UTC',
  });
  if (!date) return null;
  const state = now === null ? null : deadlineState(deadline, now);
  const left = !state
    ? ''
    : state.ended
      ? words.ended
      : state.days === 1
        ? words.oneDay
        : fillTemplate(words.days, { n: state.days });
  const iso = new Date(deadline).toISOString();
  return (
    <p
      className={cn(
        'border-site-border text-site-text m-0 inline-flex w-fit flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-full border px-3 py-1 text-sm',
        className
      )}
      data-ended={state?.ended ? '' : undefined}
    >
      <CalendarIcon size={15} className="flex-none" />
      <time dateTime={iso}>{fillTemplate(words.due, { date })}</time>
      {left ? (
        <>
          <span aria-hidden>·</span>
          <span className="sr-only">, </span>
          <span className="font-semibold">{left}</span>
        </>
      ) : null}
    </p>
  );
}
