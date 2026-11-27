import type { ReactNode } from 'react';
import { CheckIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import { editable, editPath } from '../system/edit';

/**
 * What's included, one tick per line. `path` is the list's setting path,
 * for edit mode (see edit.ts): with 'perks', each line is 'perks.0'...
 */
export function CheckList({
  items,
  path,
  className,
}: {
  items: ReactNode[];
  path?: string;
  className?: string;
}) {
  return (
    <ul
      className={cn('m-0 flex list-none flex-col gap-2 p-0 text-sm', className)}
    >
      {items.map((item, i) => (
        <li key={i} className="m-0 flex items-start gap-2">
          <CheckIcon size={18} className="text-site-link mt-px flex-none" />
          <span {...editable(path ? editPath(path, i) : undefined)}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
