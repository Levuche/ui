import { useId, type ChangeEvent, type ReactNode } from 'react';
import { SiteInput, SiteTextarea } from '../atoms/input';
import { cn } from '../system/cn';

/**
 * A labelled text box: the label above, an optional hint under it. `multiline`
 * makes it a bigger box for a message. Everything else goes to the input.
 */
export function Field({
  label,
  hint,
  multiline = false,
  id,
  className,
  ...input
}: {
  label: ReactNode;
  hint?: ReactNode;
  multiline?: boolean;
  id?: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  /** With onChange, the field's value, for a field the block keeps. */
  value?: string;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  rows?: number;
  maxLength?: number;
  readOnly?: boolean;
  className?: string;
}) {
  const auto = useId();
  const fieldId = id ?? auto;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={fieldId} className="text-sm font-semibold">
        {label}
      </label>
      {multiline ? (
        <SiteTextarea id={fieldId} aria-describedby={hintId} {...input} />
      ) : (
        <SiteInput id={fieldId} aria-describedby={hintId} {...input} />
      )}
      {hint ? (
        <p id={hintId} className="text-site-text-2 m-0 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
