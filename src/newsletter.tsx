import type { FormEventHandler, ReactNode } from 'react';
import { siteButtonClasses } from './basics';
import { cn } from './cn';

/** The newsletter sign-up, on the creator's band colour. */
export function NewsletterBand({
  title,
  buttonLabel = 'Subscribe',
  placeholder = 'you@email.com',
  onSubmit,
  action,
  className,
}: {
  title: ReactNode;
  buttonLabel?: string;
  placeholder?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      method={action ? 'post' : undefined}
      onSubmit={onSubmit}
      className={cn(
        'bg-site-band text-site-on-band rounded-site flex flex-col gap-2.5 p-4',
        className
      )}
    >
      <strong>{title}</strong>
      <span className="flex gap-2">
        {/* 16 px text on touch screens, so phones do not zoom in on focus. */}
        <input
          type="email"
          name="email"
          required
          aria-label="Email"
          autoComplete="email"
          placeholder={placeholder}
          className="bg-site-bg text-site-text rounded-site-button min-h-control-sm min-w-0 flex-1 border-0 px-3.5 font-[inherit] text-base pointer-fine:text-sm"
        />
        <button
          type="submit"
          className={siteButtonClasses({
            size: 'sm',
            variant: 'outline',
            className: 'border-site-on-band text-site-on-band',
          })}
        >
          {buttonLabel}
        </button>
      </span>
    </form>
  );
}
