'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PauseIcon, PlayIcon, SoundOnIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import { isSafeMediaSrc } from '../system/href';
import { safeImageSource, type ImageSrc } from '../system/image';
import {
  isOverCaption,
  TileCaption,
  UNDER_CAPTION,
  type CaptionStyle,
} from './tile-caption';

/** A file of captions, subtitles or descriptions for a video (WebVTT). */
export type VideoTrack = {
  /** The .vtt file's address. */
  src: string;
  /** Its language, as "en" or "hi". */
  lang: string;
  /** Its name in the player's menu, as "English". */
  label: string;
  /** Captions (the default) also describe sounds; subtitles only translate. */
  kind?: 'captions' | 'subtitles' | 'descriptions';
  /** Shown when the video starts. */
  default?: boolean;
};

export type VideoLabels = {
  /** {title} is filled in. */
  play: string;
  /** {title} is filled in. */
  pause: string;
  /** {title} is filled in. */
  soundOn: string;
};

export const VIDEO_LABELS: VideoLabels = {
  play: 'Play {title}',
  pause: 'Pause {title}',
  soundOn: 'Play {title} with sound',
};

/** The shapes a video can take. `tall` is a phone video (9:16). */
export type VideoRatio = 'video' | 'tall' | 'square' | 'portrait';

const RATIOS: Record<VideoRatio, string> = {
  video: 'aspect-video',
  tall: 'aspect-[9/16]',
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
};

/**
 * The address with "#t=0.1" added, so a phone shows the first frame as the
 * cover. Only for web addresses without a fragment of their own.
 */
const firstFrame = (src: string) =>
  /^(https?:\/\/|\/|\.\/)/i.test(src) && !src.includes('#')
    ? `${src}#t=0.1`
    : src;

/**
 * - still: the cover and a play button; nothing plays
 * - loop: playing without sound, round and round, with pause and sound buttons
 * - watch: the browser's own player, with sound, captions and a seek bar
 */
type Mode = 'still' | 'loop' | 'watch';

/**
 * A video file the creator uploaded (mp4, mov or webm), as a tile. It shows
 * the cover (`poster`, or the video's first frame) and a play button, and
 * plays with sound and the browser's own controls only when pressed.
 *
 * With `loop`, it plays without sound, round and round, while it's on the
 * screen, with buttons to pause it and to play it with sound. It never moves
 * on its own for visitors who ask their device for less motion: they get the
 * cover and the play button. Sound never starts without a press.
 */
export function VideoFrame({
  src,
  title,
  poster,
  loop = false,
  tracks = [],
  ratio,
  caption,
  captionStyle = 'below',
  labels,
  className,
}: {
  /** The video file's address. */
  src: string;
  /** What the video is, for screen readers, such as "Pouring chai". */
  title: string;
  /** The cover; left empty, the video's first frame. */
  poster?: ImageSrc | null;
  /** Play without sound, round and round, while on the screen. */
  loop?: boolean;
  /**
   * Captions for the video. When given, the video and the files are fetched
   * as CORS requests, so they must come from this site or a host that allows
   * it, as most file storage does.
   */
  tracks?: VideoTrack[];
  /** The frame's shape. Left empty, it fills the height it's given. */
  ratio?: VideoRatio;
  caption?: ReactNode;
  captionStyle?: CaptionStyle;
  labels?: Partial<VideoLabels>;
  className?: string;
}) {
  const words = { ...VIDEO_LABELS, ...labels };
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('still');
  const [paused, setPaused] = useState(false);
  // Once the visitor watches it with sound, the loop never takes over again.
  const watching = useRef(false);
  const fill = (text: string) => text.replace('{title}', title);

  // Loop without sound while on the screen, unless less motion is asked for
  // or the visitor paused it. Starts after the page loads, so the server's
  // page and the first render match.
  useEffect(() => {
    const el = video.current;
    const box = frame.current;
    if (!loop || !el || !box || watching.current) return;
    if (paused) {
      el.pause();
      return;
    }
    const motion =
      typeof matchMedia === 'function'
        ? matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let visible = typeof IntersectionObserver !== 'function';
    const update = () => {
      if (watching.current) return;
      if (motion?.matches || !visible) {
        el.pause();
        setMode('still');
        return;
      }
      el.muted = true;
      el.play().then(
        () => {
          if (!watching.current) setMode('loop');
        },
        // A browser may refuse even a silent video (power saving): show the
        // cover and the play button instead.
        () => {
          if (!watching.current) setMode('still');
        }
      );
    };
    const watcher =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            visible = Boolean(entry?.isIntersecting);
            update();
          })
        : null;
    watcher?.observe(box);
    motion?.addEventListener('change', update);
    if (!watcher) update();
    return () => {
      watcher?.disconnect();
      motion?.removeEventListener('change', update);
    };
  }, [loop, paused]);

  if (!isSafeMediaSrc(src, 'video')) return null;
  const cover = safeImageSource(poster);
  const captionFiles = tracks.filter((track) =>
    isSafeMediaSrc(track.src, 'video')
  );

  /** Watch it with sound and the browser's controls, after a press. */
  const watch = () => {
    const el = video.current;
    if (!el) return;
    // One video with sound at a time.
    document.querySelectorAll('video').forEach((other) => {
      if (other !== el && !other.muted) other.pause();
    });
    el.muted = false;
    watching.current = true;
    setMode('watch');
    el.play().catch(() => undefined);
    el.focus();
  };

  const over = Boolean(caption) && isOverCaption(captionStyle);
  const button =
    'bg-site-surface/85 text-site-text size-control inline-flex cursor-pointer items-center justify-center rounded-full border-0 backdrop-blur-md';

  return (
    <figure
      className={cn(
        'm-0 grid min-w-0 grid-cols-1 gap-2',
        !ratio &&
          (caption && !over
            ? 'h-full grid-rows-[minmax(0,1fr)_auto]'
            : 'h-full grid-rows-1'),
        className
      )}
    >
      <div
        ref={frame}
        data-video-mode={mode}
        className={cn(
          'bg-site-surface-2 rounded-block-inner relative min-h-0 overflow-hidden',
          UNDER_CAPTION,
          ratio ? RATIOS[ratio] : 'h-full'
        )}
      >
        {/* Captions come from `tracks`; a creator may have none to give. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={video}
          src={cover ? src : firstFrame(src)}
          poster={cover?.src}
          preload={cover ? 'none' : 'metadata'}
          loop={loop}
          playsInline
          controls={mode === 'watch'}
          crossOrigin={captionFiles.length ? 'anonymous' : undefined}
          aria-label={title}
          tabIndex={mode === 'watch' ? 0 : -1}
          onEnded={() => {
            if (!loop) {
              watching.current = false;
              setMode('still');
            }
          }}
          className="absolute inset-0 size-full object-cover"
        >
          {captionFiles.map((track) => (
            <track
              key={`${track.lang}-${track.src}`}
              src={track.src}
              srcLang={track.lang}
              label={track.label}
              kind={track.kind ?? 'captions'}
              default={track.default}
            />
          ))}
        </video>
        {mode === 'still' ? (
          <button
            type="button"
            data-action="video_play"
            aria-label={fill(words.play)}
            onClick={watch}
            className="absolute inset-0 flex size-full cursor-pointer items-center justify-center border-0 bg-transparent p-0 focus-visible:outline-offset-[-4px]"
          >
            <span
              aria-hidden
              className="bg-site-button text-site-on-button flex size-14 items-center justify-center rounded-full shadow-md"
            >
              <PlayIcon size={26} />
            </span>
          </button>
        ) : null}
        {mode === 'loop' ? (
          <div className="absolute end-2 top-2 flex gap-2">
            <button
              type="button"
              data-action={paused ? 'video_play' : 'video_pause'}
              aria-label={fill(paused ? words.play : words.pause)}
              onClick={() => setPaused(!paused)}
              className={button}
            >
              {paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
            </button>
            <button
              type="button"
              data-action="video_sound"
              aria-label={fill(words.soundOn)}
              onClick={watch}
              className={button}
            >
              <SoundOnIcon size={18} />
            </button>
          </div>
        ) : null}
      </div>
      {caption && !(over && mode === 'watch') ? (
        <TileCaption captionStyle={captionStyle}>{caption}</TileCaption>
      ) : null}
    </figure>
  );
}
