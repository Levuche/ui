import type { FormEventHandler, ReactNode } from 'react';
import { SiteButton, type SiteButtonVariant } from '../atoms/button';
import { SiteInput } from '../atoms/input';
import { cn } from '../system/cn';
import type { FormStatus } from '../system/state';
import { FormNotice } from './form-notice';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';

/** The words an email form shows; every one can be changed. */
export type EmailFormLabels = {
  /** The box's name for screen readers. */
  email: string;
  placeholder: string;
  button: string;
  /** Shown once the app says it's sent. */
  sent: ReactNode;
  /** Shown when the app says it failed. */
  error: ReactNode;
};

export const EMAIL_FORM_LABELS: EmailFormLabels = WORDS_EN.emailForm;

/**
 * An email box and a button. It sends `email` to `action` (a URL or a React
 * server action) or hands the submit to `onSubmit`. The app tells it how the
 * send went with `status`: the button spins while sending, and a thank-you
 * or the error is read out after. Server-component safe: no state of its own.
 */
export function EmailForm({
  labels,
  layout = 'row',
  buttonVariant = 'solid',
  status = 'idle',
  hideWhenSent = true,
  action,
  onSubmit,
  children,
  className,
}: {
  labels?: Partial<EmailFormLabels>;
  /** `row` puts the button beside the box; `stack` under it. */
  layout?: 'row' | 'stack';
  buttonVariant?: SiteButtonVariant;
  status?: FormStatus;
  /** Show only the thank-you once sent. */
  hideWhenSent?: boolean;
  action?: string | ((data: FormData) => void | Promise<void>);
  onSubmit?: FormEventHandler<HTMLFormElement>;
  /** More fields or a consent line, above the button. */
  children?: ReactNode;
  className?: string;
}) {
  const words = usePageWords('emailForm', labels);
  const sent = status === 'sent' && hideWhenSent;
  return (
    <form
      action={action}
      method={typeof action === 'string' ? 'post' : undefined}
      onSubmit={onSubmit}
      className={cn('flex flex-col gap-2', className)}
    >
      {sent ? null : (
        <>
          <span
            className={cn(
              'flex gap-2',
              layout === 'stack' ? 'flex-col' : 'flex-row'
            )}
          >
            <SiteInput
              type="email"
              name="email"
              required
              aria-label={words.email}
              autoComplete="email"
              placeholder={words.placeholder}
              readOnly={status === 'sending'}
              aria-invalid={status === 'error' || undefined}
              className={layout === 'row' ? 'flex-1' : undefined}
            />
            {layout === 'row' ? (
              <SiteButton
                type="submit"
                variant={buttonVariant}
                loading={status === 'sending'}
                className="flex-none"
              >
                {words.button}
              </SiteButton>
            ) : null}
          </span>
          {children}
          {layout === 'stack' ? (
            <SiteButton
              type="submit"
              variant={buttonVariant}
              loading={status === 'sending'}
              fullWidth
            >
              {words.button}
            </SiteButton>
          ) : null}
        </>
      )}
      <FormNotice status={status} sent={words.sent} error={words.error} />
    </form>
  );
}
