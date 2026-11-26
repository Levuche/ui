'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PlayIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import {
  CONSENT_LABELS,
  consentNotice,
  siteName,
  type ConsentLabels,
} from '../system/privacy';
import { ConsentCover } from './consent-cover';
import {
  columnSizes,
  imageAttrs,
  toImageSource,
  type ImageSrc,
} from '../system/image';

/** The shape of an embedded player. */
export type FrameRatio = 'video' | 'vertical' | 'square' | 'audio' | 'tall';

const FRAME_RATIOS: Record<FrameRatio, string> = {
  video: 'aspect-video',
  vertical: 'mx-auto aspect-[9/16] max-w-90',
  square: 'aspect-square',
  audio: 'h-38',
  tall: 'h-88',
};

/* The consent cover grows to fit its words, so heights are minimums. */
const COVER_RATIOS: Record<FrameRatio, string> = {
  ...FRAME_RATIOS,
  audio: 'min-h-38',
  tall: 'min-h-88',
};

/**
 * A player from another site (YouTube, Spotify, a podcast) that loads only
 * when the visitor presses play. Until then it's a picture and a button, so
 * the page stays fast and the other site sets no cookies. `autoLoad` skips
 * the button, for players that are only a few kilobytes.
 *
 * With `consent={false}` (the visitor hasn't agreed to the site yet) it shows
 * `notice`, a line on what loading will share, and a Load button instead;
 * the press loads it.
 */
export function PlayFrame({
  src,
  title,
  poster,
  playLabel,
  ratio = 'video',
  allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen',
  autoLoad = false,
  playIcon,
  sandbox,
  action = 'play',
  onPlay,
  consent,
  notice,
  consentLabels,
  className,
}: {
  /** The player's address, from a trusted maker (see each block). */
  src: string;
  /** What's playing, for screen readers, such as "How tea came to India". */
  title: string;
  poster?: ImageSrc | null;
  /** The play button's name; defaults to "Play: {title}". */
  playLabel?: string;
  ratio?: FrameRatio;
  allow?: string;
  autoLoad?: boolean;
  playIcon?: ReactNode;
  /** Limits what the player may do, as the iframe's sandbox. */
  sandbox?: string;
  /** What the press is called in `onAction`. */
  action?: string;
  onPlay?: () => void;
  /** False until the visitor agrees to the site; see above. */
  consent?: boolean;
  /** What loading shares; defaults to consentNotice with the player's host. */
  notice?: string;
  consentLabels?: Partial<ConsentLabels>;
  className?: string;
}) {
  const [playing, setPlaying] = useState(autoLoad && consent !== false);
  const [pressed, setPressed] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  // After a press, focus moves into what loaded, not back to the page.
  useEffect(() => {
    if (pressed) frameRef.current?.focus();
  }, [pressed]);
  const frame = cn(
    'bg-site-surface-2 rounded-block-inner relative block w-full overflow-hidden',
    FRAME_RATIOS[ratio] ?? FRAME_RATIOS.video,
    className
  );
  const cover = toImageSource(poster);
  if (playing) {
    return (
      <div className={frame}>
        <iframe
          ref={frameRef}
          src={src}
          sandbox={sandbox}
          title={title}
          allow={allow}
          allowFullScreen
          loading={autoLoad ? 'lazy' : undefined}
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }
  const press = () => {
    setPlaying(true);
    setPressed(true);
    onPlay?.();
  };
  if (consent === false) {
    const words = { ...CONSENT_LABELS, ...consentLabels };
    return (
      <ConsentCover
        notice={notice ?? consentNotice(siteName(src) ?? src, consentLabels)}
        load={words.load}
        title={title}
        action={action}
        onLoad={press}
        className={cn(COVER_RATIOS[ratio] ?? COVER_RATIOS.video, className)}
        cover={
          cover ? (
            <img
              {...imageAttrs(cover, columnSizes())}
              alt=""
              className="rounded-block-inner absolute inset-0 size-full object-cover"
            />
          ) : null
        }
      />
    );
  }
  return (
    <button
      type="button"
      data-action={action}
      onClick={press}
      aria-label={playLabel ?? `Play: ${title}`}
      className={cn(frame, 'cursor-pointer border-0 p-0')}
    >
      {cover ? (
        <img
          {...imageAttrs(cover, columnSizes())}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <span
        aria-hidden
        className="bg-site-button text-site-on-button absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
      >
        {playIcon ?? <PlayIcon size={28} />}
      </span>
    </button>
  );
}
