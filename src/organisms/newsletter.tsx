import type { FormEventHandler, ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { EmailIcon } from '../atoms/icons';
import type { FormStatus } from '../system/state';
import { DialogButton } from '../molecules/dialog-button';
import { EmailForm, type EmailFormLabels } from '../molecules/email-form';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import type { HeadingTag } from '../molecules/item-head';

/** The words of the compact tile (`display="tile"`). */
export type NewsletterTileLabels = {
  /** The button that opens the sign-up. */
  open: string;
  /** The button that closes it. */
  close: string;
};

export const NEWSLETTER_TILE_LABELS: NewsletterTileLabels =
  WORDS_EN.newsletterTile;

/**
 * The newsletter sign-up, on the creator's band colour by default. `status`
 * is how the sign-up went (see EmailForm). `display="tile"` makes it a small
 * tile with one button that opens the form in a pop-up.
 */
export function NewsletterBand({
  title,
  detail,
  buttonLabel,
  placeholder,
  labels,
  layout = 'row',
  display = 'band',
  tileLabels,
  status,
  onSubmit,
  action,
  headingAs: Heading = 'h3',
  ...root
}: BlockRootProps & {
  title: ReactNode;
  /** The title's level on the page. `p` when it's only for looks. */
  headingAs?: HeadingTag;
  detail?: ReactNode;
  buttonLabel?: string;
  placeholder?: string;
  labels?: Partial<EmailFormLabels>;
  /** `row` puts the button beside the box; `stack` under it. */
  layout?: 'row' | 'stack';
  /**
   * `band` shows the form in the block; `tile` shows a compact tile with one
   * button, and the form in a pop-up.
   */
  display?: 'band' | 'tile';
  tileLabels?: Partial<NewsletterTileLabels>;
  status?: FormStatus;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string | ((data: FormData) => void | Promise<void>);
}) {
  const words = usePageWords('newsletterTile', tileLabels);
  const formLabels = {
    button: buttonLabel,
    ...(placeholder ? { placeholder } : {}),
    ...labels,
  };
  const heading = (
    <div className="flex flex-col gap-1">
      <Heading className="m-0 font-bold">{title}</Heading>
      {detail ? <p className="text-site-text-2 m-0 text-sm">{detail}</p> : null}
    </div>
  );

  if (display === 'tile') {
    return (
      <Block
        name="newsletter-band"
        data-display="tile"
        defaults={{ tone: 'band' }}
        {...root}
      >
        {heading}
        <DialogButton
          label={words.open}
          title={title}
          closeLabel={words.close}
          variant="outline"
          icon={<EmailIcon size={18} />}
          action="newsletter_open"
        >
          {detail ? (
            <p className="text-site-text-2 m-0 text-sm">{detail}</p>
          ) : null}
          <EmailForm
            layout="stack"
            status={status}
            action={action}
            onSubmit={onSubmit}
            labels={formLabels}
          />
        </DialogButton>
      </Block>
    );
  }

  return (
    <Block name="newsletter-band" defaults={{ tone: 'band' }} {...root}>
      {heading}
      <EmailForm
        layout={layout}
        status={status}
        action={action}
        onSubmit={onSubmit}
        buttonVariant="outline"
        labels={formLabels}
      />
    </Block>
  );
}
