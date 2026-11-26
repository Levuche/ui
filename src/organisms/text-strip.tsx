'use client';

import { useEffect, useRef, useState } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { cn } from '../system/cn';
import { useOnScreen } from '../system/effects';
import { motionSeconds, stripRepeats } from '../system/motion';
import {
  MotionToggle,
  type MotionToggleLabels,
} from '../molecules/motion-toggle';

export type TextStripLabels = MotionToggleLabels;

export const TEXT_STRIP_LABELS: TextStripLabels = {
  pause: 'Stop the moving words',
  play: 'Move the words again',
};

const lessMotion = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A band of words that scrolls across, such as "New drop ✦ Free shipping ✦
 * Made in Pune". It has a pause button (WCAG 2.2.2), stops under the pointer
 * or keyboard, holds still while it's off screen, and shows the words still
 * and wrapped for visitors who ask for less motion. Screen readers hear each
 * phrase once, in order.
 */
export function TextStrip({
  items,
  separator = '✦',
  speed,
  direction = 'start',
  label = 'Highlights',
  labels,
  ...root
}: BlockRootProps & {
  /** The words or short phrases, in order. */
  items: string[];
  /** Drawn between phrases; screen readers skip it. */
  separator?: string;
  /** Seconds for the phrases to pass once, at least 5. 16 when left out. */
  speed?: number;
  /**
   * Which way the words move: towards the start of a line (left in a
   * left-to-right script) or towards its end.
   */
  direction?: 'start' | 'end';
  /** The strip's name for screen readers. */
  label?: string;
  labels?: Partial<TextStripLabels>;
}) {
  const words = { ...TEXT_STRIP_LABELS, ...labels };
  const phrases = items.map((item) => String(item).trim()).filter(Boolean);
  const view = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const onScreen = useOnScreen(view);
  const [playing, setPlaying] = useState(true);
  // Each half of the row draws the phrases this many times, so a half is at
  // least as wide as the strip. One on the server; measured in the browser.
  const [repeats, setRepeats] = useState(1);
  const count = phrases.length;
  // Measured again whenever the words change.
  const shown = phrases.join('\n');

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
  }, [count, separator, shown]);

  if (!count) return null;

  const separatorMark = separator.trim();
  const phrase = (text: string, i: number, copy: number) => {
    const hidden = copy > 0;
    return (
      <li
        key={`${copy}-${i}`}
        aria-hidden={hidden || undefined}
        className={cn(
          'm-0 flex flex-none items-center gap-4 whitespace-nowrap motion-reduce:whitespace-normal',
          hidden && 'motion-reduce:hidden'
        )}
      >
        <span>{text}</span>
        {separatorMark ? (
          <span
            aria-hidden="true"
            className={cn(
              'opacity-70',
              // Still, the last phrase needs no separator after it.
              !hidden && i === count - 1 && 'motion-reduce:hidden'
            )}
          >
            {separatorMark}
          </span>
        ) : null}
      </li>
    );
  };

  return (
    <Block
      as="section"
      name="text-strip"
      aria-label={label}
      defaults={{ tone: 'band' }}
      {...root}
    >
      <div className="flex items-center gap-2">
        <div
          ref={view}
          className="group min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:[mask-image:none]"
        >
          <ul
            ref={list}
            className={cn(
              'text-block-title m-0 flex w-max list-none gap-4 p-0 pe-4 font-bold group-hover:[animation-play-state:paused] motion-safe:animate-[levuche-marquee_var(--marquee)_linear_infinite] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-1 motion-reduce:pe-0 rtl:[--marquee-to:50%]'
            )}
            style={{
              ['--marquee' as string]: `${motionSeconds(speed, 16) * repeats}s`,
              animationPlayState: playing && onScreen ? undefined : 'paused',
              // Inline, so the animation shorthand can't reset it.
              animationDirection: direction === 'end' ? 'reverse' : undefined,
            }}
          >
            {Array.from({ length: repeats * 2 }, (_, copy) =>
              phrases.map((text, i) => phrase(text, i, copy))
            )}
          </ul>
        </div>
        <MotionToggle
          playing={playing}
          onToggle={() => setPlaying(!playing)}
          labels={words}
        />
      </div>
    </Block>
  );
}
