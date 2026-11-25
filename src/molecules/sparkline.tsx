import { cn } from '../system/cn';

/**
 * A small line chart of a few numbers over time, in the button colour.
 * `label` says what it shows for screen readers, as "Downloads, last 12
 * weeks: rising from 1.2K to 3.4K".
 */
export function Sparkline({
  values,
  label,
  className,
}: {
  values: number[];
  label: string;
  className?: string;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = 100 / (values.length - 1);
  const points = values
    .map(
      (v, i) =>
        `${(i * step).toFixed(2)},${(28 - ((v - min) / span) * 26).toFixed(2)}`
    )
    .join(' ');
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={cn('text-site-button block h-10 w-full', className)}
    >
      <polygon
        points={`0,30 ${points} 100,30`}
        fill="currentColor"
        opacity={0.15}
      />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}
