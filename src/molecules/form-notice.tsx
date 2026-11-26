import type { ReactNode } from 'react';
import { cn } from '../system/cn';
import type { FormStatus } from '../system/state';

/**
 * What happened to a form, read out by screen readers as it changes: a
 * thank-you once it's sent, the reason when it failed. Stays in the page
 * while empty, so the first message is announced too.
 */
export function FormNotice({
  status,
  sent,
  error,
  className,
}: {
  status: FormStatus;
  sent?: ReactNode;
  error?: ReactNode;
  className?: string;
}) {
  const message = status === 'sent' ? sent : status === 'error' ? error : null;
  return (
    <p
      role="status"
      className={cn(
        'm-0 text-sm empty:sr-only',
        status === 'error' ? 'font-semibold' : 'text-site-text-2',
        className
      )}
    >
      {message}
    </p>
  );
}
