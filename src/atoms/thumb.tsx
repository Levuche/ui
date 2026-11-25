import type { CSSProperties } from 'react';
import { cn } from '../system/cn';

/** The shapes a picture can take. `auto` keeps the picture's own shape. */
export type ThumbRatio =
  'auto' | 'square' | 'video' | 'portrait' | 'reel' | 'wide';

const RATIOS: Record<ThumbRatio, string> = {
  auto: '',
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[4/5]',
  reel: 'aspect-[9/14]',
  wide: 'aspect-[21/9]',
};

/**
 * A picture, or a plain tile in the creator's second surface colour when
 * there is none. Corners follow the block (`rounded-block-inner`) unless the
 * class says otherwise.
 */
export function Thumb({
  src,
  alt = '',
  ratio = 'auto',
  fit = 'cover',
  className,
  style,
}: {
  src?: string | null;
  /** Leave empty when the picture only repeats words next to it. */
  alt?: string;
  ratio?: ThumbRatio;
  /** `contain` shows all of the picture, as for a logo. */
  fit?: 'cover' | 'contain';
  className?: string;
  style?: CSSProperties;
}) {
  const classes = cn(
    'rounded-block-inner block flex-none',
    RATIOS[ratio] ?? '',
    className
  );
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={style}
        className={cn(
          fit === 'contain' ? 'object-contain' : 'object-cover',
          classes
        )}
      />
    );
  }
  // A missing picture with a description still tells screen readers what
  // it would show; a decorative one is hidden.
  return alt ? (
    <span
      role="img"
      aria-label={alt}
      style={style}
      className={cn('bg-site-surface-2', classes)}
    />
  ) : (
    <span
      aria-hidden
      style={style}
      className={cn('bg-site-surface-2', classes)}
    />
  );
}
