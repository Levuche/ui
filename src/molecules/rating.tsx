import { StarIcon } from '../atoms/icons';
import { cn } from '../system/cn';

/** A score out of `max` as stars, read out as "4 out of 5 stars". */
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
  /** Replaces "{n} out of {max} stars" for screen readers. */
  label?: string;
  className?: string;
}) {
  const stars = Math.max(0, Math.min(max, Math.round(value)));
  return (
    <span
      role="img"
      aria-label={label ?? `${stars} out of ${max} stars`}
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
