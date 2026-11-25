import type { ReactNode } from 'react';
import { cn } from '../system/cn';

/** One chip in ChoiceChips. */
export type ChipOption = { value: string; label: ReactNode };

/**
 * Chips to pick one of, such as amounts or times: radio buttons that look
 * like chips, so the arrow keys move between them. The parent keeps the
 * value; with no `legend`, the parent's own fieldset names them.
 */
export function ChoiceChips({
  legend,
  name,
  options,
  value,
  onChange,
  className,
}: {
  /** What's being chosen, shown above the chips. */
  legend?: ReactNode;
  /** The field's name in a form; leave it out to send nothing. */
  name?: string;
  options: ChipOption[];
  /** The picked value; '' for none. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const chips = (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className="bg-site-surface-2 text-site-text has-checked:bg-site-button has-checked:text-site-on-button has-focus-visible:outline-site-button rounded-site-button min-h-control inline-flex cursor-pointer items-center px-4 font-bold tabular-nums has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
  if (!legend) return chips;
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="text-site-text-2 mb-2 p-0 text-sm font-semibold">
        {legend}
      </legend>
      {chips}
    </fieldset>
  );
}
