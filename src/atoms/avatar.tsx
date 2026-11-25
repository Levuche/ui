import { cn } from '../system/cn';

/** First letters of up to two words: "Desi Origins" becomes "DO". */
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * A round profile picture, or initials when there is no picture. Decorative
 * by default, since the name is shown next to it; give `alt` when it isn't.
 */
export function Avatar({
  name,
  src,
  size = 48,
  shape = 'circle',
  ring = false,
  alt = '',
  className,
}: {
  name: string;
  src?: string | null;
  /** Width and height in px. */
  size?: number;
  /** `rounded` follows the block's corners. */
  shape?: 'circle' | 'rounded' | 'square';
  /** A ring in the button colour around it. */
  ring?: boolean;
  alt?: string;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size / 3) };
  const classes = cn(
    'flex-none',
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'rounded'
        ? 'rounded-block-inner'
        : 'rounded-none',
    // An outline leaves a see-through gap, so the ring works on any background.
    ring && 'outline-site-button outline-2 outline-offset-2',
    className
  );
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={style}
        className={cn('object-cover', classes)}
      />
    );
  }
  return (
    <span
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      style={style}
      className={cn(
        'bg-site-button text-site-on-button inline-flex items-center justify-center font-bold',
        classes
      )}
    >
      {initials(name)}
    </span>
  );
}
