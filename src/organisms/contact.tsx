import type { FormEventHandler, ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteButton, type SiteButtonVariant } from '../atoms/button';
import { DownloadIcon } from '../atoms/icons';
import { siteButtonClasses } from '../atoms/button';
import type { FormStatus } from '../system/state';
import { Field } from '../molecules/field';
import { FormNotice } from '../molecules/form-notice';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';

export type ContactFormLabels = {
  name: string;
  email: string;
  message: string;
  button: string;
  sent: ReactNode;
  error: ReactNode;
};

export const CONTACT_FORM_LABELS: ContactFormLabels = WORDS_EN.contactForm;

/**
 * Name, email and a message, posted to `action` (a URL or a React server
 * action) or handed to `onSubmit`. It sends `name`, `email` and `message`,
 * plus `website`, a box hidden from people that only bots fill in: drop any
 * message where it isn't empty. `status` is how the send went.
 */
export function ContactForm({
  title,
  detail,
  labels,
  askName = true,
  buttonVariant,
  status = 'idle',
  hideWhenSent = true,
  maxLength = 2000,
  onSubmit,
  action,
  headingAs = 'h3',
  children,
  ...root
}: BlockRootProps & {
  title?: ReactNode;
  detail?: ReactNode;
  labels?: Partial<ContactFormLabels>;
  askName?: boolean;
  buttonVariant?: SiteButtonVariant;
  status?: FormStatus;
  /** Show only the thank-you once sent. */
  hideWhenSent?: boolean;
  /** The longest message, in characters. */
  maxLength?: number;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string | ((data: FormData) => void | Promise<void>);
  headingAs?: HeadingTag;
  /** More fields, above the button. */
  children?: ReactNode;
}) {
  const words = usePageWords('contactForm', labels);
  const sent = status === 'sent' && hideWhenSent;
  const busy = status === 'sending';
  return (
    <Block
      as="form"
      name="contact-form"
      action={action}
      method={typeof action === 'string' ? 'post' : undefined}
      onSubmit={onSubmit}
      {...root}
    >
      {title ? (
        <ItemHead title={title} detail={detail} headingAs={headingAs} />
      ) : null}
      {sent ? null : (
        <>
          {askName ? (
            <Field
              label={words.name}
              name="name"
              autoComplete="name"
              required
              readOnly={busy}
            />
          ) : null}
          <Field
            label={words.email}
            name="email"
            type="email"
            autoComplete="email"
            required
            readOnly={busy}
          />
          <Field
            label={words.message}
            name="message"
            multiline
            rows={4}
            maxLength={maxLength}
            required
            readOnly={busy}
          />
          {/* Only bots see and fill this. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute -start-[9999px] size-px opacity-0"
          />
          {children}
          <SiteButton
            type="submit"
            variant={buttonVariant}
            loading={busy}
            action="contact"
            fullWidth
          >
            {words.button}
          </SiteButton>
        </>
      )}
      <FormNotice status={status} sent={words.sent} error={words.error} />
    </Block>
  );
}

/** A person or business on a contact card. */
export type ContactCard = {
  name: string;
  /** The organisation, such as "Desi Origins". */
  org?: string;
  title?: string;
  email?: string;
  phone?: string;
  url?: string;
  address?: string;
  note?: string;
};

const escape = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/([,;])/g, '\\$1');

/** The contact as a vCard 3.0, which phones read as a new contact. */
export function toVCard(card: ContactCard) {
  const [first, ...rest] = card.name.trim().split(/\s+/);
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escape(card.name)}`,
    `N:${escape(rest.join(' '))};${escape(first ?? '')};;;`,
    card.org && `ORG:${escape(card.org)}`,
    card.title && `TITLE:${escape(card.title)}`,
    card.email && `EMAIL;TYPE=INTERNET:${escape(card.email)}`,
    card.phone && `TEL;TYPE=CELL:${escape(card.phone)}`,
    card.url && /^https?:\/\//i.test(card.url) && `URL:${escape(card.url)}`,
    card.address && `ADR;TYPE=WORK:;;${escape(card.address)};;;;`,
    card.note && `NOTE:${escape(card.note)}`,
    'END:VCARD',
  ];
  return lines.filter(Boolean).join('\r\n');
}

/**
 * "Save my contact": a button that downloads the creator's contact card, which
 * a phone offers to add to its contacts. Works without JavaScript.
 */
export function SaveContact({
  contact,
  title,
  detail,
  buttonLabel: buttonLabelProp,
  buttonVariant,
  fileName,
  headingAs = 'h3',
  ...root
}: BlockRootProps & {
  contact: ContactCard;
  title?: ReactNode;
  detail?: ReactNode;
  buttonLabel?: ReactNode;
  buttonVariant?: SiteButtonVariant;
  /** Defaults to the name, as "Desi Origins.vcf". */
  fileName?: string;
  headingAs?: HeadingTag;
}) {
  const own = usePageWords('props');
  const buttonLabel =
    buttonLabelProp === undefined ? own.saveContact : buttonLabelProp;
  const file = `${(fileName ?? contact.name).replace(/[\\/:*?"<>|]/g, '')}.vcf`;
  const href = `data:text/vcard;charset=utf-8,${encodeURIComponent(
    toVCard(contact)
  )}`;
  return (
    <Block name="save-contact" {...root}>
      {title ? (
        <ItemHead title={title} detail={detail} headingAs={headingAs} />
      ) : null}
      {/* Our own contact card, built here; not an address a creator typed. */}
      <a
        href={href}
        download={file}
        data-action="save_contact"
        className={siteButtonClasses({
          variant: buttonVariant,
          fullWidth: true,
        })}
      >
        <DownloadIcon size={18} />
        {buttonLabel}
      </a>
    </Block>
  );
}
