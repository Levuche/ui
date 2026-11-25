'use client';

import { useId, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { ArrowsHorizontalIcon } from '../atoms/icons';
import { Badge } from '../atoms/text';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import { useControllableState } from '../system/state';
import type { ImageSrc } from '../system/image';

export type BeforeAfterLabels = {
  before: string;
  after: string;
  /** The slider's name for screen readers. */
  slider: string;
  /** Read out as the slider moves; {before} and {after} are percentages. */
  value: string;
};

export const BEFORE_AFTER_LABELS: BeforeAfterLabels = {
  before: 'Before',
  after: 'After',
  slider: 'Compare before and after',
  value: '{before}% before, {after}% after',
};

type Picture = { src: ImageSrc | null | undefined; alt: string };

/**
 * Two pictures, one over the other, with a handle to drag between them, as
 * for a room before and after, or an edit. The handle is a real slider, so
 * the arrow keys move it too and screen readers say where it is.
 */
export function BeforeAfter({
  before,
  after,
  caption,
  ratio = 'video',
  position,
  defaultPosition = 50,
  onPositionChange,
  showLabels = true,
  labels,
  ...root
}: BlockRootProps & {
  before: Picture;
  after: Picture;
  caption?: ReactNode;
  ratio?: ThumbRatio;
  /** How much of the before picture shows, 0 to 100. */
  position?: number;
  defaultPosition?: number;
  onPositionChange?: (position: number) => void;
  /** The "Before" and "After" pills on the pictures. */
  showLabels?: boolean;
  labels?: Partial<BeforeAfterLabels>;
}) {
  const words = { ...BEFORE_AFTER_LABELS, ...labels };
  const id = useId();
  const [value, setValue] = useControllableState({
    value: position,
    defaultValue: defaultPosition,
    onChange: onPositionChange,
  });
  const at = Math.min(100, Math.max(0, value));
  return (
    <Block
      as="figure"
      name="before-after"
      defaults={{ tone: 'plain' }}
      {...root}
      className={cn('m-0', root.className)}
    >
      <div className="rounded-block-inner relative overflow-hidden">
        <Thumb
          src={after.src}
          alt={after.alt}
          ratio={ratio}
          className="w-full rounded-none"
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - at}% 0 0)` }}
        >
          <Thumb
            src={before.src}
            alt={before.alt}
            ratio={ratio}
            className="size-full rounded-none"
          />
        </div>
        {showLabels ? (
          <>
            <Badge className="absolute start-2 top-2" aria-hidden>
              {words.before}
            </Badge>
            <Badge className="absolute end-2 top-2" aria-hidden>
              {words.after}
            </Badge>
          </>
        ) : null}
        <span
          aria-hidden
          className="bg-site-bg pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2"
          style={{ left: `${at}%` }}
        >
          <span className="bg-site-button text-site-on-button absolute top-1/2 left-1/2 flex size-10 -translate-1/2 items-center justify-center rounded-full shadow-md">
            <ArrowsHorizontalIcon size={20} />
          </span>
        </span>
        <input
          id={`${id}-slider`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={at}
          aria-label={words.slider}
          aria-valuetext={words.value
            .replace('{before}', String(at))
            .replace('{after}', String(100 - at))}
          data-action="compare"
          onChange={(event) => setValue(Number(event.target.value))}
          className="peer absolute inset-0 m-0 size-full cursor-ew-resize opacity-0"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2"
        />
      </div>
      {caption ? (
        <figcaption className="text-site-text-2 text-sm">{caption}</figcaption>
      ) : null}
    </Block>
  );
}
