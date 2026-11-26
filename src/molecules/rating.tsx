import { StarIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import { usePageLocale, usePageWords } from '../system/page-words';

/**
 * How full each of `max` stars is, from 0 to 1, for a score of `value`:
 * 4.8 of 5 is four full stars and one 80% full, to the tenth.
 */
export function starFills(value: number, max = 5): number[] {
  const score = Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
  return Array.from(
    { length: max },
    (_, s) => Math.round(Math.max(0, Math.min(1, score - s)) * 10) / 10
  );
}

/**
 * A score out of `max` as stars, read out in the page's language as "4.8 out
 * of 5 stars". A part score fills part of a star, so 4.8 doesn't look like 5.
 */
export function Rating({
  value,
  max = 5,
  size = 16,
  label,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  /** Replaces the page's "{n} out of {max} stars" for screen readers. */
  label?: string;
  className?: string;
}) {
  const words = usePageWords('rating');
  const locale = usePageLocale();
  const score = Number.isFinite(value)
    ? new Intl.NumberFormat(locale ?? 'en-US', {
        maximumFractionDigits: 1,
      }).format(Math.max(0, Math.min(max, value)))
    : '0';
  return (
    <span
      role="img"
      aria-label={
        label ?? words.stars.replace('{n}', score).replace('{max}', String(max))
      }
      className={cn('text-site-link inline-flex gap-0.5', className)}
    >
      {starFills(value, max).map((fill, s) =>
        fill === 1 || fill === 0 ? (
          <StarIcon
            key={s}
            size={size}
            fill={fill === 1 ? 'currentColor' : 'none'}
          />
        ) : (
          <span key={s} className="relative inline-flex">
            <StarIcon size={size} fill="none" />
            <span
              className="absolute inset-y-0 start-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon size={size} fill="currentColor" />
            </span>
          </span>
        )
      )}
    </span>
  );
}
