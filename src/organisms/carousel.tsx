'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLinkButton } from '../atoms/button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from '../atoms/icons';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { useControllableState } from '../system/state';

/** One slide in an ImageCarousel. */
export type CarouselSlide = {
  src: string | null | undefined;
  /** What the picture shows. */
  alt: string;
  caption?: ReactNode;
  /** A button under the slide, such as "Shop the look". */
  button?: LinkBehavior & { label: string; href: string };
};

export type CarouselLabels = {
  previous: string;
  next: string;
  /** {n} and {total} are filled in. */
  slide: string;
  pause: string;
  play: string;
};

export const CAROUSEL_LABELS: CarouselLabels = {
  previous: 'Previous slide',
  next: 'Next slide',
  slide: 'Slide {n} of {total}',
  pause: 'Pause slides',
  play: 'Play slides',
};

const fill = (text: string, n: number, total: number) =>
  text.replace('{n}', String(n)).replace('{total}', String(total));

const prefersLessMotion = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Pictures to swipe through, or step with the arrows and the arrow keys,
 * each with an optional caption and button. It moves on its own only when
 * `autoplay` is set, stops on hover or focus, has a pause button, and never
 * moves for visitors who ask their device for less motion.
 *
 * The slide shown can be the block's own (`defaultIndex`) or the app's
 * (`index` and `onIndexChange`).
 */
export function ImageCarousel({
  slides,
  title,
  ratio = 'video',
  index,
  defaultIndex = 0,
  onIndexChange,
  autoplay,
  loop = true,
  showDots = true,
  labels,
  label = 'Pictures',
  ...root
}: BlockRootProps & {
  slides: CarouselSlide[];
  title?: ReactNode;
  ratio?: ThumbRatio;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Seconds per slide, to move on its own. Off by default. */
  autoplay?: number;
  /** Next from the last slide goes back to the first. */
  loop?: boolean;
  showDots?: boolean;
  labels?: Partial<CarouselLabels>;
  /** The carousel's name for screen readers, when there's no title. */
  label?: string;
}) {
  const words = { ...CAROUSEL_LABELS, ...labels };
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const total = slides.length;
  const [chosen, setCurrent] = useControllableState({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });
  // Kept to the slides there are, so a slide always shows when slides are
  // taken away or the app passes an index past the end.
  const current = Math.min(Math.max(0, chosen), Math.max(0, total - 1));
  const [playing, setPlaying] = useState(Boolean(autoplay));
  const [held, setHeld] = useState(false);

  const go = (next: number) => {
    if (total === 0) return;
    const to = loop
      ? (next + total) % total
      : Math.min(Math.max(0, next), total - 1);
    setCurrent(to);
  };

  // Where a button or the app is scrolling the track to, while it scrolls.
  // Midway, the track shows part of the slide it is leaving, so its scroll
  // events must not set the slide back.
  const moving = useRef<number | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const release = () => {
    moving.current = null;
    clearTimeout(settle.current);
  };

  // Show the current slide when it changes, from a button or the app.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const left = current * el.clientWidth;
    if (Math.abs(el.scrollLeft - left) > 2) {
      moving.current = left;
      clearTimeout(settle.current);
      // In case the scroll never lands, as when the track is resized.
      settle.current = setTimeout(release, 1000);
      el.scrollTo({ left, behavior: prefersLessMotion() ? 'auto' : 'smooth' });
    }
  }, [current]);
  useEffect(() => release, []);

  // Move on its own, unless paused, held, or less motion is asked for.
  useEffect(() => {
    if (!autoplay || !playing || held || total < 2 || prefersLessMotion()) {
      return;
    }
    const timer = setTimeout(() => go(current + 1), autoplay * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, playing, held, current, total]);

  // A swipe moves the track; read the slide it settled on.
  const onScroll = () => {
    const el = track.current;
    if (!el || el.clientWidth === 0) return;
    if (moving.current !== null) {
      if (Math.abs(el.scrollLeft - moving.current) <= 2) release();
      return;
    }
    const shown = Math.round(el.scrollLeft / el.clientWidth);
    if (shown !== current && shown >= 0 && shown < total) setCurrent(shown);
  };

  // Arrow keys anywhere in the carousel, except in the slide's own button.
  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.target as HTMLElement).closest('a')) return;
    if (event.key === 'ArrowRight') go(current + 1);
    else if (event.key === 'ArrowLeft') go(current - 1);
    else return;
    event.preventDefault();
  };

  const arrow =
    'bg-site-surface text-site-text size-control-md absolute top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 shadow-md disabled:opacity-40';

  return (
    <Block
      as="section"
      name="image-carousel"
      aria-roledescription="carousel"
      aria-label={typeof title === 'string' ? title : label}
      defaults={{ tone: 'plain' }}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onKeyDown={onKeyDown}
      {...root}
    >
      {title ? <p className="text-block-title m-0 font-bold">{title}</p> : null}
      <div className="relative">
        {/* A scrolling area must be reachable with the keyboard (WCAG 2.1.1). */}
        <div
          ref={track}
          id={`${id}-track`}
          aria-live={playing && autoplay ? 'off' : 'polite'}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          onScroll={onScroll}
          // A swipe or wheel takes over from a scroll a button started.
          onPointerDown={release}
          onWheel={release}
          className="rounded-block-inner flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <div
              key={`${i}-${slide.alt}`}
              role="group"
              aria-roledescription="slide"
              aria-label={fill(words.slide, i + 1, total)}
              aria-hidden={i !== current || undefined}
              inert={i !== current || undefined}
              className="flex w-full flex-none snap-start flex-col gap-2"
            >
              <Thumb
                src={slide.src}
                alt={slide.alt}
                ratio={ratio}
                className="w-full"
              />
              {slide.caption ? (
                <p className="text-site-text-2 m-0 text-sm">{slide.caption}</p>
              ) : null}
              {slide.button ? (
                <SiteLinkButton
                  href={slide.button.href}
                  newTab={slide.button.newTab}
                  sponsored={slide.button.sponsored}
                  nofollow={slide.button.nofollow}
                  action="slide_button"
                  size="sm"
                  className="self-start"
                >
                  {slide.button.label}
                </SiteLinkButton>
              ) : null}
            </div>
          ))}
        </div>
        {total > 1 ? (
          <>
            <button
              type="button"
              aria-controls={`${id}-track`}
              aria-label={words.previous}
              data-action="carousel_previous"
              disabled={!loop && current === 0}
              onClick={() => go(current - 1)}
              className={cn(arrow, 'start-2')}
            >
              <ChevronLeftIcon size={20} />
            </button>
            <button
              type="button"
              aria-controls={`${id}-track`}
              aria-label={words.next}
              data-action="carousel_next"
              disabled={!loop && current === total - 1}
              onClick={() => go(current + 1)}
              className={cn(arrow, 'end-2')}
            >
              <ChevronRightIcon size={20} />
            </button>
          </>
        ) : null}
      </div>
      {total > 1 && (showDots || autoplay) ? (
        <div className="flex items-center justify-center gap-1">
          {autoplay ? (
            <button
              type="button"
              aria-label={playing ? words.pause : words.play}
              onClick={() => setPlaying(!playing)}
              className="text-site-text size-control inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent"
            >
              {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>
          ) : null}
          {showDots
            ? slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={fill(words.slide, i + 1, total)}
                  aria-current={i === current || undefined}
                  onClick={() => go(i)}
                  className="group size-control inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'block size-2 rounded-full transition-all motion-reduce:transition-none',
                      i === current
                        ? 'bg-site-button w-5'
                        : 'bg-site-border group-hover:bg-site-text-2'
                    )}
                  />
                </button>
              ))
            : null}
        </div>
      ) : null}
    </Block>
  );
}
