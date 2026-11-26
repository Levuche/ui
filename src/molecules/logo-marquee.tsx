'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useOnScreen } from '../system/effects';
import { usePageWords } from '../system/page-words';
import { MotionToggle, type MotionToggleLabels } from './motion-toggle';

/**
 * The moving row of a scrolling LogoStrip, with its pause button (WCAG
 * 2.2.2). It holds still under the pointer or keyboard, while it's off
 * screen and once paused, and stands still and wraps for visitors who ask
 * for less motion. The logos themselves are drawn by LogoStrip, so they
 * stay server-rendered.
 */
export function LogoMarquee({
  seconds,
  labels,
  children,
}: {
  /** Seconds for one pass, already held to the least allowed. */
  seconds: number;
  labels?: Partial<MotionToggleLabels>;
  /** The list items: the logos, then their copy for the seamless loop. */
  children: ReactNode;
}) {
  const words = usePageWords('logoStrip', labels);
  const view = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(view);
  const [playing, setPlaying] = useState(true);
  return (
    <div className="flex w-full items-center gap-2">
      <div
        ref={view}
        className="group min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] motion-reduce:[mask-image:none]"
      >
        <ul
          className="m-0 flex w-max list-none gap-10 p-0 pe-10 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-safe:animate-[levuche-marquee_var(--marquee)_linear_infinite] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-4 motion-reduce:pe-0 rtl:[--marquee-to:50%]"
          style={{
            ['--marquee' as string]: `${seconds}s`,
            animationPlayState: playing && onScreen ? undefined : 'paused',
          }}
        >
          {children}
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
