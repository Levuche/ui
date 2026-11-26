import { cn } from '../system/cn';
import {
  filledSteps,
  formatPercent,
  progressOf,
  progressSteps,
} from '../system/progress';

/** How thick a ProgressBar is. */
export type ProgressBarSize = 'sm' | 'md' | 'lg';

const HEIGHTS: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

/**
 * How far along something is, as a bar in the theme's button colour (the
 * accent, turned round on a coloured block). Smooth, or in `steps` (2 to 20)
 * that fill one by one.
 *
 * Screen readers hear it as a progress bar with its value: give it a name
 * with `label` or `labelledBy`, and `valueText` for what they read out
 * ("3 of 10 done"); left out, they hear the percentage. The value is held
 * between 0 and `max`, and a `max` of 0 or less shows an empty bar (see
 * progressOf). It never moves for visitors who ask for less motion, and
 * renders the same on the server and in the browser.
 */
export function ProgressBar({
  value,
  max = 100,
  steps,
  label,
  labelledBy,
  valueText,
  locale,
  size = 'md',
  className,
}: {
  value: number;
  /** What counts as done. */
  max?: number;
  /** A bar in this many steps, from 2 to 20. Left out, a smooth bar. */
  steps?: number;
  /** The bar's name for screen readers. Or `labelledBy`. */
  label?: string;
  /** The id of the words that name the bar. */
  labelledBy?: string;
  /** What screen readers read as its value. Left out, the percentage. */
  valueText?: string;
  /** For the percentage screen readers hear. Left out, en-US. */
  locale?: string;
  size?: ProgressBarSize;
  className?: string;
}) {
  const progress = progressOf(value, max);
  const count = progressSteps(steps);
  const filled = filledSteps(progress.percent, count);
  return (
    <div
      role="progressbar"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-valuemin={0}
      aria-valuemax={progress.max}
      aria-valuenow={progress.value}
      aria-valuetext={valueText ?? formatPercent(progress.percent, locale)}
      data-progress={progress.percent}
      data-done={progress.done ? '' : undefined}
      className={cn(
        'rounded-block-inner relative w-full overflow-hidden',
        HEIGHTS[size] ?? HEIGHTS.md,
        count ? 'flex gap-0.5' : 'bg-site-surface-2',
        className
      )}
    >
      {count ? (
        Array.from({ length: count }, (_, step) => (
          <span
            key={step}
            data-filled={step < filled ? '' : undefined}
            className={cn(
              'h-full flex-1',
              step < filled ? 'bg-site-button' : 'bg-site-surface-2'
            )}
          />
        ))
      ) : (
        <span
          className="bg-site-button block h-full rounded-[inherit] motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      )}
    </div>
  );
}
