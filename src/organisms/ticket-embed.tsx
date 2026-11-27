'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import {
  SiteButton,
  SiteLinkButton,
  type SiteButtonVariant,
} from '../atoms/button';
import { TicketIcon } from '../atoms/icons';
import { ConsentCover } from '../molecules/consent-cover';
import { SiteDialog } from '../molecules/dialog';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { ticketsFor } from '../system/embeds';
import { editable } from '../system/edit';
import { isSafeHref } from '../system/href';
import { usePageWords } from '../system/page-words';
import { usePreviewMode } from '../system/preview-mode';
import {
  consentNotice,
  OUTSIDE_SERVICES,
  type ConsentLabels,
} from '../system/privacy';
import { WORDS_EN } from '../system/words/en';

export type TicketEmbedLabels = {
  button: string;
  /** For screen readers: the ticket page's name. {title} is filled in. */
  frame: string;
  /** A plain link under the tickets, for anyone they don't load for. */
  fallback: string;
  close: string;
};

export const TICKET_EMBED_LABELS: TicketEmbedLabels = WORDS_EN.ticketEmbed;

/**
 * An event's tickets from the service the creator sells them on, shown in
 * the page (`inline`) or in a pop-up from a button (`popup`). A Luma event
 * (its embed link or evt- id) shows Luma's registration and checkout in a
 * sandbox, with a plain link to the event under it. Eventbrite shows its
 * checkout in a page only through its own script, which no block loads, so
 * an Eventbrite event's button opens its ticket page in a new tab, as any
 * other https ticket link does (check it with ticketsFor first).
 * With `consent={false}` it says which site it loads from before the
 * visitor presses Load; in preview mode the checkout never loads.
 */
export function TicketEmbed({
  src,
  title,
  detail,
  display = 'popup',
  height = 40,
  labels,
  consent,
  consentLabels,
  buttonVariant,
  headingAs = 'h3',
  onOpen,
  ...root
}: BlockRootProps & {
  /** The event's ticket link: Luma's embed link or evt- id, or Eventbrite's event page. */
  src: string;
  title: string;
  detail?: ReactNode;
  display?: 'inline' | 'popup';
  /** The checkout's height, in rem. */
  height?: number;
  labels?: Partial<TicketEmbedLabels>;
  /**
   * Whether the visitor agreed to the ticket site, from the page's cookie
   * notice. False shows a notice and a Load button in place of the
   * checkout; leave it out on pages that don't ask.
   */
  consent?: boolean;
  consentLabels?: Partial<ConsentLabels>;
  buttonVariant?: SiteButtonVariant;
  headingAs?: HeadingTag;
  onOpen?: () => void;
}) {
  const words = usePageWords('ticketEmbed', labels);
  const consentWords = usePageWords('consent', consentLabels);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const preview = usePreviewMode();
  // After Load, focus moves into the checkout.
  useEffect(() => {
    if (agreed) frameRef.current?.focus();
  }, [agreed]);
  const tickets = ticketsFor(src);
  if (!tickets && !(isSafeHref(src) && /^https:\/\//i.test(src))) return null;
  const href = tickets?.href ?? src;

  const head = (
    <ItemHead
      title={title}
      detail={detail}
      headingAs={headingAs}
      edit={{ title: 'title', detail: 'detail' }}
    />
  );
  const fallback = (
    <SiteLinkButton
      {...editable('src', 'link')}
      href={href}
      newTab
      variant="text"
      size="sm"
      action="tickets_fallback"
      className="self-center"
    >
      <span {...editable('labels.fallback')}>{words.fallback}</span>
    </SiteLinkButton>
  );

  if (!tickets?.src) {
    return (
      <Block
        name="ticket-embed"
        data-service={tickets?.service}
        data-display="link"
        {...root}
      >
        {head}
        <SiteLinkButton
          {...editable('src', 'link')}
          href={href}
          newTab
          variant={buttonVariant}
          icon={<TicketIcon size={18} />}
          action="tickets_open"
          fullWidth
          // In the editor's preview the link goes nowhere, so nothing opened.
          onClick={preview ? undefined : onOpen}
        >
          <span {...editable('labels.button')}>{words.button}</span>
        </SiteLinkButton>
      </Block>
    );
  }

  const name = words.frame.replace('{title}', title);
  const size = { height: `${Math.min(80, Math.max(24, height))}rem` };
  const shown = consent !== false || agreed;
  const frame = preview ? (
    <div
      role="img"
      aria-label={name}
      data-preview-placeholder=""
      style={size}
      className="bg-site-surface-2 text-site-text-2 rounded-block-inner flex w-full items-center justify-center"
    >
      <TicketIcon size={32} />
    </div>
  ) : shown ? (
    <iframe
      {...editable('src', 'link')}
      ref={frameRef}
      src={tickets.src}
      title={name}
      loading="lazy"
      allow="payment"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      style={size}
      className="bg-site-surface-2 rounded-block-inner block w-full border-0"
    />
  ) : (
    <ConsentCover
      notice={consentNotice(
        OUTSIDE_SERVICES[tickets.service].name,
        consentWords
      )}
      load={consentWords.load}
      title={name}
      action="tickets_load"
      onLoad={() => setAgreed(true)}
      style={size}
      edit={{ load: 'consentLabels.load' }}
    />
  );

  return (
    <Block
      name="ticket-embed"
      data-service={tickets.service}
      data-display={display}
      {...root}
    >
      {head}
      {display === 'inline' ? (
        <>
          {frame}
          {fallback}
        </>
      ) : (
        <>
          <SiteButton
            ref={trigger}
            variant={buttonVariant}
            icon={<TicketIcon size={18} />}
            action="tickets_open"
            aria-haspopup="dialog"
            fullWidth
            onClick={() => {
              if (preview) return;
              setOpen(true);
              dialog.current?.showModal();
              onOpen?.();
            }}
          >
            <span {...editable('labels.button')}>{words.button}</span>
          </SiteButton>
          <SiteDialog
            ref={dialog}
            title={<span {...editable('title')}>{title}</span>}
            size="lg"
            onClose={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
          >
            {open ? frame : null}
            {fallback}
            <SiteButton
              variant="outline"
              action="tickets_close"
              fullWidth
              onClick={() => dialog.current?.close()}
            >
              <span {...editable('labels.close')}>{words.close}</span>
            </SiteButton>
          </SiteDialog>
        </>
      )}
    </Block>
  );
}
