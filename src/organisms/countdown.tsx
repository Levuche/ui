'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import type { HeadingTag } from '../molecules/item-head';

/** The names of the units, as the visitor reads them. */
export type CountdownLabels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export const COUNTDOWN_LABELS: CountdownLabels = WORDS_EN.countdown;

const UNITS = [
  { key: 'days', ms: 86_400_000 },
  { key: 'hours', ms: 3_600_000 },
  { key: 'minutes', ms: 60_000 },
  { key: 'seconds', ms: 1_000 },
] as const;

/** Days, hours, minutes and seconds left until `to`. */
export function timeLeft(to: Date | string, now: number) {
  let left = Math.max(0, new Date(to).getTime() - now);
  return UNITS.map((unit) => {
    const value = Math.floor(left / unit.ms);
    left -= value * unit.ms;
    return { label: unit.key as string, value };
  });
}

/**
 * A countdown to a launch, a live stream or the end of a sale. It ticks once
 * a second in the visitor's browser and shows `doneLabel` once time is up.
 * Screen readers read it when they reach it, not on every tick.
 */
export function Countdown({
  to,
  title,
  headingAs: Heading = 'h3',
  doneLabel: doneLabelProp,
  doneContent,
  labels,
  showSeconds = true,
  now: fixedNow,
  onDone,
  ...root
}: BlockRootProps & {
  to: Date | string;
  title?: ReactNode;
  /** The title's level on the page. `p` when it's only for looks. */
  headingAs?: HeadingTag;
  doneLabel?: ReactNode;
  /** Shown under `doneLabel` once time is up, such as a link to the stream. */
  doneContent?: ReactNode;
  labels?: Partial<CountdownLabels>;
  showSeconds?: boolean;
  /** Freeze the clock at this time (ms), for previews and tests. */
  now?: number;
  /** Called once when time runs out in the visitor's browser. */
  onDone?: () => void;
}) {
  const own = usePageWords('props');
  const doneLabel = doneLabelProp === undefined ? own.live : doneLabelProp;
  const words = usePageWords('countdown', labels);
  // The clock starts in the browser, so the server and the first render
  // agree (no time until it has ticked once).
  const [ticked, setTicked] = useState<number | null>(null);
  useEffect(() => {
    if (fixedNow !== undefined) return;
    const tick = () => setTicked(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [fixedNow]);
  const now = fixedNow ?? ticked;

  // A date that can't be read shows dashes and never ends.
  const end = new Date(to).getTime();
  const valid = Number.isFinite(end);
  const done = valid && now !== null && end <= now;
  useEffect(() => {
    if (done && fixedNow === undefined) onDone?.();
    // Only when it turns done.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const parts = (
    now === null || !valid
      ? UNITS.map((u) => ({ label: u.key as string, value: null }))
      : timeLeft(to, now)
  ).filter((part) => showSeconds || part.label !== 'seconds');

  return (
    <Block name="countdown" defaults={{ align: 'center' }} {...root}>
      {title ? <Heading className="m-0 font-bold">{title}</Heading> : null}
      {/* In the page from the start, so the done words are read out when
          they arrive rather than mounting with the region. */}
      <p
        role="status"
        className="text-site-link m-0 text-xl font-bold empty:sr-only"
      >
        {done ? doneLabel : null}
      </p>
      {done ? (
        doneContent
      ) : (
        <p role="timer" className="m-0 flex justify-center gap-2">
          {parts.map((part) => (
            <span
              key={part.label}
              className="bg-site-surface-2 rounded-block-inner flex min-w-14 flex-col items-center px-2 py-1.5"
            >
              <span className="text-2xl font-bold tabular-nums">
                {part.value === null
                  ? '–'
                  : String(part.value).padStart(2, '0')}
              </span>
              <span className="text-site-text-2 text-xs">
                {words[part.label as keyof CountdownLabels]}
              </span>
            </span>
          ))}
        </p>
      )}
    </Block>
  );
}
