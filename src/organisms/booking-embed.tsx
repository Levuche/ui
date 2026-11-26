'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import {
  SiteButton,
  SiteLinkButton,
  type SiteButtonVariant,
} from '../atoms/button';
import { CalendarIcon } from '../atoms/icons';
import { ConsentCover } from '../molecules/consent-cover';
import { SiteDialog } from '../molecules/dialog';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { isSafeHref } from '../system/href';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import { usePreviewMode } from '../system/preview-mode';
import {
  CONSENT_LABELS,
  consentNotice,
  OUTSIDE_SERVICES,
  siteName,
  type ConsentLabels,
} from '../system/privacy';

export type BookingEmbedLabels = {
  button: string;
  /** For screen readers: the booking page's name. {title} is filled in. */
  frame: string;
  /** A plain link under the booking page, for anyone it doesn't load for. */
  fallback: string;
  close: string;
};

export const BOOKING_EMBED_LABELS: BookingEmbedLabels = WORDS_EN.bookingEmbed;

/** Only https pages go in a frame. */
const isEmbeddable = (src: string) =>
  isSafeHref(src) && /^https:\/\//i.test(src);

/**
 * A scheduling page from the booking service the creator already uses, shown
 * in the page (`inline`) or in a pop-up from a button (`popup`). It loads
 * only when shown, runs in a sandbox, and always has a plain link to the same
 * page in case it doesn't load. With `consent={false}` it says which site it
 * loads from, and what that shares, before the visitor presses Load.
 * In preview mode (the page editor) the booking page never loads: a still
 * placeholder takes its place, and the button opens nothing.
 */
export function BookingEmbed({
  src,
  title,
  detail,
  display = 'popup',
  height = 44,
  labels,
  consent,
  consentLabels,
  buttonVariant,
  headingAs = 'h3',
  onOpen,
  ...root
}: BlockRootProps & {
  /** The booking page's https address. */
  src: string;
  title: string;
  detail?: ReactNode;
  display?: 'inline' | 'popup';
  /** The booking page's height, in rem. */
  height?: number;
  labels?: Partial<BookingEmbedLabels>;
  /**
   * Whether the visitor agreed to the booking site, from the page's cookie
   * notice. False shows a notice and a Load button in place of the booking
   * page; leave it out on pages that don't ask.
   */
  consent?: boolean;
  consentLabels?: Partial<ConsentLabels>;
  buttonVariant?: SiteButtonVariant;
  headingAs?: HeadingTag;
  onOpen?: () => void;
}) {
  const words = usePageWords('bookingEmbed', labels);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const preview = usePreviewMode();
  // After Load, focus moves into the booking page.
  useEffect(() => {
    if (agreed) frameRef.current?.focus();
  }, [agreed]);
  if (!isEmbeddable(src)) return null;

  const pageHeight = { height: `${Math.min(80, Math.max(24, height))}rem` };
  const shown = consent !== false || agreed;
  const frame = preview ? (
    <div
      role="img"
      aria-label={words.frame.replace('{title}', title)}
      data-preview-placeholder=""
      style={pageHeight}
      className="bg-site-surface-2 text-site-text-2 rounded-block-inner flex w-full items-center justify-center"
    >
      <CalendarIcon size={32} />
    </div>
  ) : shown ? (
    <iframe
      ref={frameRef}
      src={src}
      title={words.frame.replace('{title}', title)}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      style={pageHeight}
      className="bg-site-surface-2 rounded-block-inner block w-full border-0"
    />
  ) : (
    <ConsentCover
      notice={consentNotice(
        siteName(src) ?? OUTSIDE_SERVICES.booking.name,
        consentLabels
      )}
      load={{ ...CONSENT_LABELS, ...consentLabels }.load}
      title={words.frame.replace('{title}', title)}
      action="booking_load"
      onLoad={() => setAgreed(true)}
      style={pageHeight}
    />
  );
  const fallback = (
    <SiteLinkButton
      href={src}
      newTab
      variant="text"
      size="sm"
      action="booking_fallback"
      className="self-center"
    >
      {words.fallback}
    </SiteLinkButton>
  );

  return (
    <Block name="booking-embed" data-display={display} {...root}>
      <ItemHead title={title} detail={detail} headingAs={headingAs} />
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
            icon={<CalendarIcon size={18} />}
            action="booking_open"
            aria-haspopup="dialog"
            fullWidth
            onClick={() => {
              if (preview) return;
              setOpen(true);
              dialog.current?.showModal();
              onOpen?.();
            }}
          >
            {words.button}
          </SiteButton>
          <SiteDialog
            ref={dialog}
            title={title}
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
              action="booking_close"
              fullWidth
              onClick={() => dialog.current?.close()}
            >
              {words.close}
            </SiteButton>
          </SiteDialog>
        </>
      )}
    </Block>
  );
}
