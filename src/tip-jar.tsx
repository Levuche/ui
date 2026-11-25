'use client';

import { useId, useState, type FormEventHandler, type ReactNode } from 'react';
import { SiteButton } from './basics';
import { cn } from './cn';
import { HeartIcon } from './icons';

/**
 * A tip jar: preset amounts to pick, or any other amount. The form sends
 * `amount` (a whole number) to `action`, or hands it to `onSubmit`.
 */
export function TipJar({
  title = 'Leave a tip',
  detail,
  amounts = [3, 5, 10],
  currency = '$',
  buttonLabel = 'Tip',
  onSubmit,
  action,
  className,
}: {
  title?: ReactNode;
  detail?: ReactNode;
  amounts?: number[];
  /** Put before the amount, as "$" or "€". */
  currency?: string;
  /** The button reads "{buttonLabel} {currency}{amount}". */
  buttonLabel?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string;
  className?: string;
}) {
  const id = useId();
  const [picked, setPicked] = useState<string>(
    String(amounts[1] ?? amounts[0] ?? '')
  );
  const [other, setOther] = useState('');
  const amount = other || picked;
  return (
    <form
      action={action}
      method={action ? 'post' : undefined}
      onSubmit={onSubmit}
      className={cn(
        'bg-site-surface text-site-text rounded-site flex flex-col gap-3 p-3.5',
        className
      )}
    >
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-1 flex items-center gap-2 p-0 text-lg font-bold">
          <HeartIcon size={20} className="text-site-link" />
          {title}
        </legend>
        {detail ? (
          <p className="text-site-text-2 m-0 text-sm">{detail}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {amounts.map((value) => (
            <label
              key={value}
              className="bg-site-surface-2 text-site-text has-checked:bg-site-accent has-checked:text-site-on-accent has-focus-visible:outline-site-accent rounded-site-button min-h-control-sm inline-flex cursor-pointer items-center px-4 font-bold tabular-nums has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
            >
              <input
                type="radio"
                name={other ? undefined : 'amount'}
                value={value}
                checked={!other && picked === String(value)}
                onChange={() => {
                  setPicked(String(value));
                  setOther('');
                }}
                className="sr-only"
              />
              {currency}
              {value}
            </label>
          ))}
        </div>
        <label
          htmlFor={`${id}-other`}
          className="text-site-text-2 flex flex-col gap-1 text-sm"
        >
          Other amount
          <input
            id={`${id}-other`}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            name={other ? 'amount' : undefined}
            value={other}
            onChange={(event) => setOther(event.target.value)}
            className="bg-site-bg text-site-text border-site-border rounded-site-button min-h-control-sm w-full border-2 px-3.5 font-[inherit] text-base pointer-fine:text-sm"
          />
        </label>
      </fieldset>
      <SiteButton type="submit" fullWidth disabled={!amount}>
        {buttonLabel} {amount ? `${currency}${amount}` : ''}
      </SiteButton>
    </form>
  );
}
