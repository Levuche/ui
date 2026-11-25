import type { FormEventHandler, ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import type { FormStatus } from '../system/state';
import { EmailForm, type EmailFormLabels } from '../molecules/email-form';

/**
 * The newsletter sign-up, on the creator's band colour by default. `status`
 * is how the sign-up went (see EmailForm).
 */
export function NewsletterBand({
  title,
  detail,
  buttonLabel = 'Subscribe',
  placeholder,
  labels,
  layout = 'row',
  status,
  onSubmit,
  action,
  ...root
}: BlockRootProps & {
  title: ReactNode;
  detail?: ReactNode;
  buttonLabel?: string;
  placeholder?: string;
  labels?: Partial<EmailFormLabels>;
  /** `row` puts the button beside the box; `stack` under it. */
  layout?: 'row' | 'stack';
  status?: FormStatus;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string | ((data: FormData) => void | Promise<void>);
}) {
  return (
    <Block name="newsletter-band" defaults={{ tone: 'band' }} {...root}>
      <div className="flex flex-col gap-1">
        <strong>{title}</strong>
        {detail ? (
          <p className="text-site-text-2 m-0 text-sm">{detail}</p>
        ) : null}
      </div>
      <EmailForm
        layout={layout}
        status={status}
        action={action}
        onSubmit={onSubmit}
        buttonVariant="outline"
        labels={{
          button: buttonLabel,
          ...(placeholder ? { placeholder } : {}),
          ...labels,
        }}
      />
    </Block>
  );
}
