'use client';

import { useRef, useState, type ReactNode } from 'react';
import { PauseIcon, PlayIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Thumb } from '../atoms/thumb';
import { cn } from '../system/cn';
import { isSafeMediaSrc } from '../system/href';
import type { ImageSrc } from '../system/image';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';

export type AudioBarLabels = {
  /** {title} is filled in. */
  play: string;
  /** {title} is filled in. */
  pause: string;
  seek: string;
  /** {time} and {total} are filled in. */
  position: string;
  transcript: string;
};

export const AUDIO_BAR_LABELS: AudioBarLabels = WORDS_EN.audioBar;

/** Seconds as "4:05" or "1:02:03". */
export function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const two = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}

/**
 * One track or episode: play and pause, a bar to move through it, and the
 * time. Nothing downloads until play is pressed, and starting one player on
 * the page pauses the others.
 */
export function AudioBar({
  src,
  title,
  detail,
  image,
  transcriptHref,
  labels,
  onPlay,
  className,
}: {
  /** The audio file's address. */
  src: string;
  title: string;
  /** Such as the artist, or the episode's date. */
  detail?: ReactNode;
  image?: ImageSrc | null;
  /** A page with the words, for visitors who can't listen. */
  transcriptHref?: string;
  labels?: Partial<AudioBarLabels>;
  onPlay?: () => void;
  className?: string;
}) {
  const words = usePageWords('audioBar', labels);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);
  if (!isSafeMediaSrc(src)) return null;

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      document.querySelectorAll('audio').forEach((other) => {
        if (other !== el) other.pause();
      });
      // A browser may refuse to play (no tap yet, or a broken file): the
      // button then stays on Play rather than throwing.
      el.play().catch(() => setPlaying(false));
      onPlay?.();
    } else {
      el.pause();
    }
  };

  return (
    <div
      data-audio-bar=""
      className={cn(
        'bg-site-surface-2 rounded-block-inner flex items-center gap-3 p-2',
        className
      )}
    >
      {image !== undefined ? (
        <Thumb
          src={image}
          alt=""
          ratio="square"
          sizes="56px"
          className="w-14 flex-none"
        />
      ) : null}
      <button
        type="button"
        data-action={playing ? 'audio_pause' : 'audio_play'}
        aria-label={(playing ? words.pause : words.play).replace(
          '{title}',
          title
        )}
        onClick={toggle}
        className="bg-site-button text-site-on-button min-h-control min-w-control flex flex-none cursor-pointer items-center justify-center rounded-full border-0"
      >
        {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="m-0 truncate text-sm font-semibold">{title}</p>
        {detail ? (
          <p className="text-site-text-2 m-0 truncate text-xs">{detail}</p>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={total || 0}
            step={1}
            value={Math.min(time, total || 0)}
            disabled={!total}
            aria-label={words.seek}
            aria-valuetext={words.position
              .replace('{time}', clock(time))
              .replace('{total}', clock(total))}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (audio.current) audio.current.currentTime = next;
              setTime(next);
            }}
            className="accent-site-button h-6 min-w-0 flex-1 cursor-pointer disabled:cursor-default"
          />
          <span className="text-site-text-2 flex-none text-xs tabular-nums">
            {clock(time)} / {clock(total)}
          </span>
        </div>
        {transcriptHref ? (
          <SiteLink
            href={transcriptHref}
            action="audio_transcript"
            className="self-start text-xs font-semibold"
          >
            {words.transcript}
          </SiteLink>
        ) : null}
      </div>
      {/* Audio has no captions track; the transcript link is its text. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setTotal(event.currentTarget.duration)}
      />
    </div>
  );
}
