import type { ReactNode } from 'react';
import { cn } from '../system/cn';

/** One figure in a StatList. */
export type StatItem = {
  label: ReactNode;
  value: number | string;
  icon?: ReactNode;
};

/**
 * Small figures in a row, such as followers and repos: a number, then what
 * it counts. Numbers are written short ("12K") in `locale`.
 */
export function StatList({
  items,
  locale,
  className,
}: {
  items: StatItem[];
  locale?: string;
  className?: string;
}) {
  const write = (value: number | string) =>
    typeof value === 'number'
      ? new Intl.NumberFormat(locale, { notation: 'compact' }).format(value)
      : value;
  return (
    <dl className={cn('m-0 flex flex-wrap gap-x-5 gap-y-2', className)}>
      {items.map((item, n) => (
        <div key={n} className="flex flex-col-reverse">
          <dt className="text-site-text-2 inline-flex items-center gap-1 text-xs">
            {item.icon}
            {item.label}
          </dt>
          <dd className="m-0 font-bold tabular-nums">{write(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
