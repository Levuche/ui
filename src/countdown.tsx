'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from './cn';

const UNITS = [
  { label: 'days', ms: 86_400_000 },
  { label: 'hours', ms: 3_600_000 },
  { label: 'minutes', ms: 60_000 },
  { label: 'seconds', ms: 1_000 },
] as const;

/** Days, hours, minutes and seconds left until `to`. */
export function timeLeft(to: Date | string, now: number) {
  let left = Math.max(0, new Date(to).getTime() - now);
  return UNITS.map((unit) => {
    const value = Math.floor(left / unit.ms);
    left -= value * unit.ms;
    return { label: unit.label, value };
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
  doneLabel = 'It’s live',
  now: fixedNow,
  className,
}: {
  to: Date | string;
  title?: ReactNode;
  doneLabel?: ReactNode;
  /** Freeze the clock at this time (ms), for previews and tests. */
  now?: number;
  className?: string;
}) {
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

  const done = now !== null && new Date(to).getTime() <= now;
  return (
    <div
      className={cn(
        'bg-site-surface text-site-text rounded-site flex flex-col items-center gap-2.5 p-3.5 text-center',
        className
      )}
    >
      {title ? <p className="m-0 font-bold">{title}</p> : null}
      {done ? (
        <p role="status" className="text-site-link m-0 text-xl font-bold">
          {doneLabel}
        </p>
      ) : (
        <p role="timer" className="m-0 flex justify-center gap-2">
          {(now === null
            ? UNITS.map((u) => ({ label: u.label, value: null }))
            : timeLeft(to, now)
          ).map((part) => (
            <span
              key={part.label}
              className="bg-site-surface-2 rounded-site flex min-w-14 flex-col items-center px-2 py-1.5"
            >
              <span className="text-2xl font-bold tabular-nums">
                {part.value === null
                  ? '–'
                  : String(part.value).padStart(2, '0')}
              </span>
              <span className="text-site-text-2 text-xs">{part.label}</span>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
