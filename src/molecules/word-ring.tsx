'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../system/cn';
import { useOnScreen } from '../system/effects';
import { motionSeconds, wordRingShape } from '../system/motion';
import { MotionToggle, type MotionToggleLabels } from './motion-toggle';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';

export type WordRingLabels = MotionToggleLabels;

export const WORD_RING_LABELS: WordRingLabels = WORDS_EN.wordRing;

/**
 * Words in a ring that turns slowly around a picture, as CreatorHeader's
 * `wordRing` draws them. It has a pause button, holds still while it's off
 * screen, and doesn't turn for visitors who ask for less motion. Screen
 * readers hear the words once, in order; the drawn ring is hidden from them.
 */
export function WordRing({
  words,
  size,
  speed,
  separator = '•',
  labels,
  className,
  children,
}: {
  words: string;
  /** The picture's width in px; the ring sits just outside it. */
  size: number;
  /** Seconds for one turn, at least 5. 24 when left out. */
  speed?: number;
  /** Drawn between each time the words go round. */
  separator?: string;
  labels?: Partial<WordRingLabels>;
  className?: string;
  /** The picture. */
  children: ReactNode;
}) {
  const text = usePageWords('wordRing', labels);
  // useId's characters aren't all safe in a url(#id) reference.
  const pathId = `ring-${useId().replace(/[^\w-]/g, '')}`;
  const box = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(box);
  const [playing, setPlaying] = useState(true);
  const shape = wordRingShape(size, words, separator);
  return (
    <div
      ref={box}
      data-word-ring=""
      className={cn(
        'relative inline-grid flex-none place-items-center',
        className
      )}
      style={{ width: shape.size, height: shape.size }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${shape.size} ${shape.size}`}
        width={shape.size}
        height={shape.size}
        className="text-site-text absolute inset-0 motion-safe:animate-[levuche-turn_var(--ring-turn)_linear_infinite]"
        style={{
          ['--ring-turn' as string]: `${motionSeconds(speed, 24)}s`,
          animationPlayState: playing && onScreen ? undefined : 'paused',
        }}
      >
        <defs>
          <path id={pathId} d={shape.path} fill="none" />
        </defs>
        <text
          fill="currentColor"
          fontSize={shape.fontSize}
          fontWeight={700}
          letterSpacing="0.08em"
        >
          <textPath
            href={`#${pathId}`}
            textLength={shape.length}
            lengthAdjust="spacing"
          >
            {shape.text}
          </textPath>
        </text>
      </svg>
      {children}
      <span className="sr-only">{words}</span>
      <MotionToggle
        playing={playing}
        onToggle={() => setPlaying(!playing)}
        labels={text}
        className="bg-site-surface absolute -end-1 -bottom-1 shadow-sm"
      />
    </div>
  );
}
