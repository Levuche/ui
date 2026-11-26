import type { FormEventHandler, ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteButton, type SiteButtonVariant } from '../atoms/button';
import { Avatar } from '../atoms/avatar';
import { ChatIcon, DownloadIcon, EmailIcon, SendIcon } from '../atoms/icons';
import { siteButtonClasses } from '../atoms/button';
import { cn } from '../system/cn';
import type { ImageSrc } from '../system/image';
import {
  cleanMessageTarget,
  cleanMessageText,
  hideText,
  messageTargetText,
  SUBJECT_MAX_LENGTH,
  type MessageChannel,
} from '../system/message';
import type { FormStatus } from '../system/state';
import { Field } from '../molecules/field';
import { FormNotice } from '../molecules/form-notice';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import { HiddenText, MessageComposer } from '../molecules/message-composer';

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

export type MessageCardLabels = Record<MessageChannel, string> & {
  /** Read out before the message bubble, for screen readers. */
  preview: string;
  /** The box for the message, when the visitor can change it. */
  message: string;
  /** Under that box. */
  hint: string;
};

/** The button's words for each channel, and the card's other words. */
export const MESSAGE_CARD_LABELS: MessageCardLabels = WORDS_EN.messageCard;

const CHANNEL_ICONS: Record<MessageChannel, ReactNode> = {
  whatsapp: <ChatIcon size={18} />,
  telegram: <SendIcon size={18} />,
  sms: <ChatIcon size={18} />,
  email: <EmailIcon size={18} />,
  messenger: <ChatIcon size={18} />,
};

/**
 * A card that opens a chat with the creator on WhatsApp, Telegram, a text,
 * email or Messenger, with a message ready to send: the name, a picture, the
 * number or handle, the message in a chat bubble and a button. `to` is a
 * phone number with its country code, a username or an email address; it's
 * checked for the channel, and with nothing valid the button has no link.
 *
 * By default the number or address stays out of the page's HTML, so
 * scrapers can't lift it: it's shown, and the button links, once the page
 * runs. `hideFromSource={false}` puts it in the HTML, so the link works
 * without JavaScript. `editable` lets the visitor change the message first.
 * A press is reported to tracking as "contact", without the message.
 *
 * Half a row wide (1x1) it stacks; a full row (2x1) puts the message and the
 * button beside the name, from 36rem wide.
 */
export function MessageCard({
  channel,
  name,
  picture,
  detail,
  to,
  message,
  subject,
  editable = false,
  showTarget = true,
  hideFromSource = true,
  buttonLabel,
  buttonVariant,
  labels,
  headingAs: Heading = 'h3',
  ...root
}: BlockRootProps & {
  channel: MessageChannel;
  /** The creator's or business's name. */
  name: string;
  /** undefined: no picture; null: their initials. */
  picture?: ImageSrc | null;
  /** A line under the name, as "Usually replies within an hour". */
  detail?: ReactNode;
  /** A phone number with its country code, a username or an email address. */
  to: string;
  /** The ready-made message, as "Hi! I'd like a quote." */
  message?: string;
  /** Email only: the subject, as "Stay request". */
  subject?: string;
  /** Let the visitor change the message before sending. */
  editable?: boolean;
  /** Show the number, handle or address under the name. */
  showTarget?: boolean;
  /** Keep the number or address out of the page's HTML. */
  hideFromSource?: boolean;
  /** The button's words; defaults to the channel's in `labels`. */
  buttonLabel?: string;
  buttonVariant?: SiteButtonVariant;
  labels?: Partial<MessageCardLabels>;
  headingAs?: HeadingTag;
}) {
  const words = usePageWords('messageCard', labels);
  const target = cleanMessageTarget(channel, to);
  const shown = messageTargetText(channel, to);
  const text = cleanMessageText(message);
  const title =
    channel === 'email'
      ? cleanMessageText(subject, SUBJECT_MAX_LENGTH)
      : undefined;
  const conceal = (value: string) => (hideFromSource ? hideText(value) : value);
  return (
    <Block
      as="article"
      name="message-card"
      data-channel={channel}
      {...root}
      className={cn('@container', root.className)}
    >
      <div className="gap-block-gap grid grid-cols-1 @xl:grid-cols-2 @xl:items-center">
        <div className="flex min-w-0 items-center gap-3">
          {picture !== undefined ? (
            <Avatar name={name} src={picture} size={52} />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Heading className="text-block-title m-0 leading-tight font-bold [overflow-wrap:anywhere]">
              {name}
            </Heading>
            {detail ? (
              <p className="text-site-text-2 m-0 text-sm">{detail}</p>
            ) : null}
            {showTarget && shown ? (
              <p className="text-site-text-2 m-0 min-h-5 text-sm [overflow-wrap:anywhere]">
                {/* A number reads left to right in any script. */}
                <span dir="ltr">
                  <HiddenText text={conceal(shown)} hidden={hideFromSource} />
                </span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="gap-block-gap flex min-w-0 flex-col">
          {text && !editable ? (
            <p className="bg-site-surface-2 text-site-text rounded-block-inner m-0 max-w-[90%] self-start rounded-ss-sm px-3.5 py-2.5 text-start text-sm [overflow-wrap:anywhere] whitespace-pre-line">
              <span className="sr-only">{words.preview}: </span>
              {text}
            </p>
          ) : null}
          <MessageComposer
            channel={channel}
            to={target ? conceal(target) : null}
            hidden={hideFromSource}
            message={text}
            subject={title}
            editable={editable}
            fieldLabel={words.message}
            hint={words.hint}
            button={buttonLabel ?? words[channel]}
            buttonVariant={buttonVariant}
            icon={CHANNEL_ICONS[channel]}
          />
        </div>
      </div>
    </Block>
  );
}
