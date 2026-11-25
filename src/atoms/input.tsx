import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';
import { cn } from '../system/cn';

/*
 * Inputs keep 16 px text on touch screens, so phones don't zoom in on focus,
 * and 14 px with a mouse.
 */
export function siteInputClasses(className?: string) {
  return cn(
    'bg-site-field text-site-on-field border-site-border rounded-site-button min-h-control-md w-full min-w-0 border-2 px-3.5 font-[inherit] text-base pointer-fine:text-sm',
    'focus-visible:border-site-button focus-visible:outline-none',
    className
  );
}

/** A text box on a creator's page. */
export function SiteInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input className={siteInputClasses(className)} {...props} />;
}

/** A bigger text box, for a message. */
export function SiteTextarea({
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: Ref<HTMLTextAreaElement>;
}) {
  return (
    <textarea
      rows={rows}
      className={siteInputClasses(cn('rounded-block-inner py-2.5', className))}
      {...props}
    />
  );
}
