'use client';

import { useState } from 'react';
import { cn } from './cn';
import { PlayIcon } from './icons';
import { Thumb } from './thumb';

/** Reel thumbnails in a 3-column grid (9:14). */
export function ReelGrid({
  reels,
  className,
}: {
  reels: { image?: string | null; label?: string; href?: string }[];
  className?: string;
}) {
  return (
    <ul className={cn('m-0 grid list-none grid-cols-3 gap-2 p-0', className)}>
      {reels.map((reel, i) => {
        const tile = (
          <Thumb
            src={reel.image}
            className="block aspect-[9/14] w-full rounded-[calc(var(--site-radius)*0.6)]"
          />
        );
        return (
          <li key={i} className="m-0">
            {reel.href ? (
              <a
                href={reel.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={reel.label ?? `Reel ${i + 1}`}
              >
                {tile}
              </a>
            ) : (
              tile
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The 11-character video id from a YouTube address the creator pastes:
 * youtube.com/watch?v=, youtu.be/, /shorts/, /embed/ or /live/. Null when it
 * isn't a YouTube video.
 */
export function youtubeId(input: string): string | null {
  const ID = /^[\w-]{11}$/;
  const value = input.trim();
  if (ID.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, kind, rest] = url.pathname.split('/');
    id =
      kind === 'watch'
        ? url.searchParams.get('v')
        : ['shorts', 'embed', 'live'].includes(kind ?? '')
          ? (rest ?? null)
          : null;
  }
  return id && ID.test(id) ? id : null;
}

/**
 * A YouTube video on the creator's page. It shows the video's picture and a
 * play button first, and loads YouTube (in its privacy-enhanced mode) only
 * when the visitor presses play, so the page stays fast and sets no YouTube
 * cookies until then.
 */
export function YouTubeVideo({
  video,
  title,
  poster,
  vertical = false,
  className,
}: {
  /** The video's address or id. */
  video: string;
  /** What the video is, for screen readers, such as "How tea came to India". */
  title: string;
  /** A picture to show before play; defaults to YouTube's own. */
  poster?: string | null;
  /** True for a Short (9:16). */
  vertical?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(video);
  if (!id) return null;
  const frame = cn(
    'bg-site-surface-2 rounded-site relative block w-full overflow-hidden',
    vertical ? 'mx-auto aspect-[9/16] max-w-[360px]' : 'aspect-video',
    className
  );
  if (playing) {
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }
  const picture =
    poster === undefined
      ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      : poster;
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className={cn(frame, 'cursor-pointer border-0 p-0')}
    >
      {picture ? (
        <img
          src={picture}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <span
        aria-hidden
        className="bg-site-accent text-site-on-accent absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
      >
        <PlayIcon size={28} />
      </span>
    </button>
  );
}
