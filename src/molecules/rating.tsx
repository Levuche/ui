import { StarIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import { usePageLocale, usePageWords } from '../system/page-words';

/**
 * A score out of `max` as stars, read out in the page's language as "4.8 out
 * of 5 stars": the stars are rounded, the words aren't.
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
  const stars = Math.max(0, Math.min(max, Math.round(value)));
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
      {Array.from({ length: max }, (_, s) => (
        <StarIcon
          key={s}
          size={size}
          fill={s < stars ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}
