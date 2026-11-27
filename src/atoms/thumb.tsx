import type { CSSProperties } from 'react';
import { cn } from '../system/cn';
import {
  columnSizes,
  imageAttrs,
  toImageSource,
  type ImageSrc,
} from '../system/image';
import type { EditMarks } from '../system/edit';

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
 * class says otherwise. Its space is kept while it loads, from `ratio` or the
 * picture's own width and height, and it loads only when near the screen
 * unless the picture asks for `priority`.
 */
export function Thumb({
  src,
  alt = '',
  ratio = 'auto',
  fit = 'cover',
  sizes = columnSizes(),
  className,
  style,
  marks,
}: {
  src?: ImageSrc | null;
  /** Leave empty when the picture only repeats words next to it. */
  alt?: string;
  ratio?: ThumbRatio;
  /** `contain` shows all of the picture, as for a logo. */
  fit?: 'cover' | 'contain';
  /** How wide it shows on each screen, for a picture with `srcSet`. */
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  /** Marks the picture for edit mode, as editable(path, 'picture'). */
  marks?: EditMarks;
}) {
  const classes = cn(
    'rounded-block-inner block flex-none',
    RATIOS[ratio] ?? '',
    className
  );
  const source = toImageSource(src);
  if (source) {
    // With no ratio, the picture's own shape keeps its space.
    const shape =
      ratio === 'auto' && source.width && source.height
        ? { aspectRatio: `${source.width} / ${source.height}` }
        : null;
    return (
      <img
        {...marks}
        {...imageAttrs(source, sizes)}
        alt={alt}
        style={shape ? { ...shape, ...style } : style}
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
      {...marks}
      role="img"
      aria-label={alt}
      style={style}
      className={cn('bg-site-surface-2', classes)}
    />
  ) : (
    <span
      {...marks}
      aria-hidden
      style={style}
      className={cn('bg-site-surface-2', classes)}
    />
  );
}
