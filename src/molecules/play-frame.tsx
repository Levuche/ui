'use client';

import { useState, type ReactNode } from 'react';
import { PlayIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import { tintedSrc } from '../system/embeds';
import {
  columnSizes,
  imageAttrs,
  toImageSource,
  type ImageSrc,
} from '../system/image';

/** The shape of an embedded player. */
export type FrameRatio =
  'video' | 'vertical' | 'square' | 'audio' | 'track' | 'tall';

const FRAME_RATIOS: Record<FrameRatio, string> = {
  video: 'aspect-video',
  vertical: 'mx-auto aspect-[9/16] max-w-90',
  square: 'aspect-square',
  audio: 'h-38',
  track: 'h-44',
  tall: 'h-88',
};

/**
 * A player from another site (YouTube, Spotify, a podcast) that loads only
 * when the visitor presses play. Until then it's a picture and a button, so
 * the page stays fast and the other site sets no cookies. `autoLoad` skips
 * the button, for players that are only a few kilobytes.
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
  tint,
  onPlay,
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
  /**
   * For a player that takes a colour: the setting in `src` that gets the
   * page's button colour, as #rrggbb, when play is pressed.
   */
  tint?: string;
  onPlay?: () => void;
  className?: string;
}) {
  const [playing, setPlaying] = useState(autoLoad);
  // Read from the page when play is pressed, so the server and the first
  // render agree and the player matches the theme around it.
  const [color, setColor] = useState<string | null>(null);
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
          src={tintedSrc(src, tint, color)}
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
  return (
    <button
      type="button"
      data-action={action}
      onClick={(event) => {
        if (tint) {
          setColor(
            getComputedStyle(event.currentTarget)
              .getPropertyValue('--site-button')
              .trim() || null
          );
        }
        setPlaying(true);
        onPlay?.();
      }}
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
