'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import {
  SiteButton,
  SiteLinkButton,
  type SiteButtonVariant,
} from '../atoms/button';
import { CalendarIcon } from '../atoms/icons';
import { SiteDialog } from '../molecules/dialog';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { isSafeHref } from '../system/href';

export type BookingEmbedLabels = {
  button: string;
  /** For screen readers: the booking page's name. {title} is filled in. */
  frame: string;
  /** A plain link under the booking page, for anyone it doesn't load for. */
  fallback: string;
  close: string;
};

export const BOOKING_EMBED_LABELS: BookingEmbedLabels = {
  button: 'Pick a time',
  frame: 'Booking: {title}',
  fallback: 'Open the booking page',
  close: 'Close',
};

/** Only https pages go in a frame. */
const isEmbeddable = (src: string) =>
  isSafeHref(src) && /^https:\/\//i.test(src);

/**
 * A scheduling page from the booking service the creator already uses, shown
 * in the page (`inline`) or in a pop-up from a button (`popup`). It loads
 * only when shown, runs in a sandbox, and always has a plain link to the same
 * page in case it doesn't load.
 */
export function BookingEmbed({
  src,
  title,
  detail,
  display = 'popup',
  height = 44,
  labels,
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
  buttonVariant?: SiteButtonVariant;
  headingAs?: HeadingTag;
  onOpen?: () => void;
}) {
  const words = { ...BOOKING_EMBED_LABELS, ...labels };
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  if (!isEmbeddable(src)) return null;

  const frame = (
    <iframe
      src={src}
      title={words.frame.replace('{title}', title)}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      style={{ height: `${Math.min(80, Math.max(24, height))}rem` }}
      className="bg-site-surface-2 rounded-block-inner block w-full border-0"
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
