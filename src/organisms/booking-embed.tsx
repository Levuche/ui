'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import {
  SiteButton,
  SiteLinkButton,
  type SiteButtonVariant,
} from '../atoms/button';
import { CalendarIcon, ClockIcon } from '../atoms/icons';
import { ConsentCover } from '../molecules/consent-cover';
import { SiteDialog } from '../molecules/dialog';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { editable } from '../system/edit';
import { isSafeHref } from '../system/href';
import { useHydrated, useVisitorLocale } from '../system/locale';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import { usePreviewMode } from '../system/preview-mode';
import {
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
  /** For screen readers, before the length. */
  length: string;
  /** Before the next free time. {time} is filled in. */
  nextFree: string;
};

export const BOOKING_EMBED_LABELS: BookingEmbedLabels = WORDS_EN.bookingEmbed;

/** Only https pages go in a frame. */
const isEmbeddable = (src: string) =>
  isSafeHref(src) && /^https:\/\//i.test(src);

/**
 * The next free time as a visitor reads it, as "Thu, Nov 28, 10:00 AM GMT+5:30",
 * or null when it can't be read. In `timeZone` when it's given; otherwise in
 * the visitor's own zone, which the server doesn't know.
 */
export function formatNextFree(
  start: string,
  { locale, timeZone }: { locale?: string; timeZone?: string } = {}
): string | null {
  const at = new Date(start);
  if (Number.isNaN(at.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...(timeZone ? { timeZoneName: 'short' } : {}),
    }).format(at);
  } catch {
    // A zone or locale the browser doesn't know.
    return null;
  }
}

/**
 * A scheduling page from the booking service the creator already uses, shown
 * in the page (`inline`) or in a pop-up from a button (`popup`). It loads
 * only when shown, runs in a sandbox, and always has a plain link to the same
 * page in case it doesn't load. `duration` and `nextFree` show how long a
 * booking is and when the next free time is, before the page is opened.
 * With `consent={false}` it says which site it loads from, and what that
 * shares, before the visitor presses Load.
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
  duration,
  nextFree,
  timeZone,
  locale,
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
  /** How long a booking is, as "30 min". */
  duration?: string;
  /** When the next free time starts, as an ISO date and time, from the app. */
  nextFree?: string;
  /**
   * An IANA zone, such as "Asia/Kolkata", to show `nextFree` in. Without
   * it the time shows in the visitor's own zone once the page has loaded.
   */
  timeZone?: string;
  /** Such as "en-IN", for how the time is written. */
  locale?: string;
  headingAs?: HeadingTag;
  onOpen?: () => void;
}) {
  const words = usePageWords('bookingEmbed', labels);
  const consentWords = usePageWords('consent', consentLabels);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const preview = usePreviewMode();
  const hydrated = useHydrated();
  const shownLocale = useVisitorLocale(locale);
  // After Load, focus moves into the booking page.
  useEffect(() => {
    if (agreed) frameRef.current?.focus();
  }, [agreed]);
  if (!isEmbeddable(src)) return null;

  // Without a zone the server can't know the visitor's, so the time waits
  // for the browser rather than show a time that then changes.
  const nextTime =
    nextFree && (timeZone || hydrated)
      ? formatNextFree(nextFree, { locale: shownLocale, timeZone })
      : null;
  const [beforeTime, afterTime = ''] = words.nextFree.split('{time}');
  const facts =
    duration || nextTime ? (
      <ul className="text-site-text-2 m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-sm">
        {duration ? (
          <li className="inline-flex items-center gap-1.5">
            <ClockIcon size={16} className="flex-none" />
            <span {...editable('labels.length')} className="sr-only">
              {words.length}:{' '}
            </span>
            <span {...editable('duration')}>{duration}</span>
          </li>
        ) : null}
        {nextFree && nextTime ? (
          <li className="inline-flex items-center gap-1.5">
            <CalendarIcon size={16} className="flex-none" />
            <span>
              {beforeTime}
              <time
                dateTime={nextFree}
                className="text-site-text font-semibold"
              >
                {nextTime}
              </time>
              {afterTime}
            </span>
          </li>
        ) : null}
      </ul>
    ) : null;

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
      {...editable('src', 'link')}
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
        consentWords
      )}
      load={consentWords.load}
      title={words.frame.replace('{title}', title)}
      action="booking_load"
      onLoad={() => setAgreed(true)}
      style={pageHeight}
      edit={{ load: 'consentLabels.load' }}
    />
  );
  const fallback = (
    <SiteLinkButton
      {...editable('src', 'link')}
      href={src}
      newTab
      variant="text"
      size="sm"
      action="booking_fallback"
      className="self-center"
    >
      <span {...editable('labels.fallback')}>{words.fallback}</span>
    </SiteLinkButton>
  );

  return (
    <Block name="booking-embed" data-display={display} {...root}>
      <ItemHead
        title={title}
        detail={detail}
        headingAs={headingAs}
        edit={{ title: 'title', detail: 'detail' }}
      />
      {facts}
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
              action="booking_close"
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
