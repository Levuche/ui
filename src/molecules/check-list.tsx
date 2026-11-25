import type { ReactNode } from 'react';
import { CheckIcon } from '../atoms/icons';
import { cn } from '../system/cn';

/** What's included, one tick per line. */
export function CheckList({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  return (
    <ul
      className={cn('m-0 flex list-none flex-col gap-2 p-0 text-sm', className)}
    >
      {items.map((item, i) => (
        <li key={i} className="m-0 flex items-start gap-2">
          <CheckIcon size={18} className="text-site-link mt-px flex-none" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
