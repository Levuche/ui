import { cn } from './cn';

/** A picture, or a plain tile in the creator's surface colour. */
export function Thumb({
  src,
  alt = '',
  className,
}: {
  src?: string | null;
  alt?: string;
  className: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('flex-none object-cover', className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn('bg-site-surface-2 flex-none', className)}
    />
  );
}
