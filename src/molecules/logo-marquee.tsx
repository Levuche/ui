'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { useOnScreen } from '../system/effects';
import { stripRepeats } from '../system/motion';
import { usePageWords } from '../system/page-words';
import { MotionToggle, type MotionToggleLabels } from './motion-toggle';

const lessMotion = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The moving row of a scrolling LogoStrip, with its pause button (WCAG
 * 2.2.2). It holds still under the pointer or keyboard, while it's off
 * screen and once paused, and stands still and wraps for visitors who ask
 * for less motion. The logos themselves are drawn by LogoStrip, so they
 * stay server-rendered. Like TextStrip, each half of the row repeats the
 * logos until it's as wide as the strip, so a few small logos leave no gap.
 */
export function LogoMarquee({
  seconds,
  labels,
  logos,
  copies,
}: {
  /** Seconds for one pass of the logos, already held to the least allowed. */
  seconds: number;
  labels?: Partial<MotionToggleLabels>;
  /** The logos' list items, read by screen readers. */
  logos: ReactNode[];
  /** The same list items hidden from screen readers, for the seamless loop. */
  copies: ReactNode[];
}) {
  const words = usePageWords('logoStrip', labels);
  const view = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const onScreen = useOnScreen(view);
  const [playing, setPlaying] = useState(true);
  // Each half of the row draws the logos this many times. One on the
  // server; measured in the browser.
  const [repeats, setRepeats] = useState(1);
  const count = logos.length;

  useEffect(() => {
    const el = view.current;
    const row = list.current;
    if (!el || !row || !count || typeof ResizeObserver !== 'function') return;
    const fit = () => {
      if (lessMotion()) return;
      const sets = row.children.length / count;
      const setWidth = row.getBoundingClientRect().width / sets;
      setRepeats(stripRepeats(setWidth, el.clientWidth));
    };
    fit();
    const resized = new ResizeObserver(fit);
    resized.observe(el);
    return () => resized.disconnect();
  }, [count]);

  return (
    <div className="flex w-full items-center gap-2">
      <div
        ref={view}
        className="group min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] motion-reduce:[mask-image:none]"
      >
        <ul
          ref={list}
          className="m-0 flex w-max list-none gap-10 p-0 pe-10 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-safe:animate-[levuche-marquee_var(--marquee)_linear_infinite] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-4 motion-reduce:pe-0 rtl:[--marquee-to:50%]"
          style={{
            // The same speed per logo, however many times they repeat.
            ['--marquee' as string]: `${seconds * repeats}s`,
            animationPlayState: playing && onScreen ? undefined : 'paused',
          }}
        >
          {logos}
          {Array.from({ length: repeats * 2 - 1 }, (_, copy) => (
            <Fragment key={copy}>{copies}</Fragment>
          ))}
        </ul>
      </div>
      <MotionToggle
        playing={playing}
        onToggle={() => setPlaying(!playing)}
        labels={words}
      />
    </div>
  );
}
