import type { ReactNode } from 'react';
import { cn } from '../system/cn';

/** One choice in a Segmented control. */
export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** A small note after the label, such as "Save 20%". */
  note?: ReactNode;
};

/**
 * Two to four choices side by side, one picked: radio buttons that look like
 * a switch, so the arrow keys move between them. The parent keeps the value.
 */
export function Segmented<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  className,
}: {
  /** What's being chosen, for screen readers, such as "Billing". */
  legend: string;
  name: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <fieldset
      className={cn(
        'bg-site-surface-2 rounded-site-button m-0 inline-flex gap-1 border-0 p-1',
        className
      )}
    >
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="text-site-text has-checked:bg-site-button has-checked:text-site-on-button has-focus-visible:outline-site-button rounded-site-button min-h-control inline-flex cursor-pointer items-center gap-2 px-4 text-sm font-bold has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
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
          {option.note ? (
            <span className="text-xs font-semibold">{option.note}</span>
          ) : null}
        </label>
      ))}
    </fieldset>
  );
}
