import { cn } from '../system/cn';

/**
 * A price as the creator wrote it ("$40", "Free", "₹499"), with an optional
 * period ("/ month") and an old price struck through.
 */
export function Price({
  value,
  period,
  was,
  size = 'md',
  className,
}: {
  value: string;
  /** Shown as "/ month". */
  period?: string;
  /** The price before a discount. */
  was?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl' };
  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      {was ? (
        <s className="text-site-text-2 text-sm whitespace-nowrap tabular-nums">
          <span className="sr-only">Was </span>
          {was}
        </s>
      ) : null}
      <span
        className={cn(
          'font-bold whitespace-nowrap tabular-nums',
          sizes[size] ?? sizes.md
        )}
      >
        {value}
      </span>
      {period ? (
        <span className="text-site-text-2 text-sm">/ {period}</span>
      ) : null}
    </span>
  );
}
