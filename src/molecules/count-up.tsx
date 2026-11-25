'use client';

import { useEffect, useRef, useState } from 'react';

/** How a number is written, as Intl.NumberFormat takes it. */
export type NumberStyle = Intl.NumberFormatOptions;

/**
 * A number that counts up from 0 once, when it first scrolls into view. The
 * server and visitors who ask for less motion get the final number straight
 * away, and screen readers only ever hear the final number.
 */
export function CountUp({
  value,
  locale,
  format,
  duration = 1200,
  animate = true,
  className,
}: {
  value: number;
  /** Such as "en-IN". The visitor's own when left out. */
  locale?: string;
  /** Such as { notation: 'compact' } for "12K". */
  format?: NumberStyle;
  /** How long the count takes, in milliseconds. */
  duration?: number;
  animate?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const write = (n: number) => new Intl.NumberFormat(locale, format).format(n);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !animate ||
      typeof IntersectionObserver !== 'function' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(value);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 3;
        setShown(t < 1 ? value * eased : value);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      setShown(0);
      frame = requestAnimationFrame(step);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, animate, duration]);

  const decimals = format?.maximumFractionDigits;
  const rounded =
    shown === value
      ? value
      : decimals
        ? Number(shown.toFixed(decimals))
        : Math.round(shown);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden className="tabular-nums">
        {write(rounded)}
      </span>
      <span className="sr-only">{write(value)}</span>
    </span>
  );
}
