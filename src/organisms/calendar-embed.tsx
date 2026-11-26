'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLinkButton } from '../atoms/button';
import { CalendarIcon } from '../atoms/icons';
import { ConsentCover } from '../molecules/consent-cover';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { isTimeZone } from '../system/calendar';
import { isSafeHref } from '../system/href';
import { calendarEmbed, type CalendarView } from '../system/embeds';
import { usePageLocale, usePageWords } from '../system/page-words';
import { usePreviewMode } from '../system/preview-mode';
import {
  CONSENT_LABELS,
  consentNotice,
  OUTSIDE_SERVICES,
  type ConsentLabels,
} from '../system/privacy';
import { WORDS_EN } from '../system/words/en';

export type CalendarEmbedLabels = {
  /** For screen readers: the calendar's name. {title} is filled in. */
  frame: string;
  /** A plain link under the calendar, for anyone it doesn't load for. */
  fallback: string;
};

export const CALENDAR_EMBED_LABELS: CalendarEmbedLabels =
  WORDS_EN.calendarEmbed;

/** The block's background as the browser draws it, for the calendar's. */
const blockBackground = (el: Element | null) => {
  const block = el?.closest('[data-block]');
  return block ? getComputedStyle(block).backgroundColor : null;
};

/**
 * A creator's public calendar of classes or events, from the link Google
 * Calendar or Outlook gives when it's shared or published. Google's shows
 * as an agenda, a month or a week, in the page's language and on the
 * block's own background where its dark text stays readable; Outlook's
 * shows as Outlook lays it out. Any other https link shows only as a link
 * to the calendar (check it with calendarEmbed first).
 * It loads only once on screen, in a sandbox, with a plain link to the same
 * calendar under it. With `consent={false}` it says first which site it
 * loads from, and in preview mode (the page editor) it never loads.
 */
export function CalendarEmbed({
  src,
  title,
  detail,
  view = 'agenda',
  height = 36,
  timeZone,
  locale,
  labels,
  consent,
  consentLabels,
  headingAs = 'h3',
  ...root
}: BlockRootProps & {
  /** The calendar's share, embed or published link. */
  src: string;
  title: string;
  detail?: ReactNode;
  /** How Google's calendar lays out its events. Outlook's has its own. */
  view?: CalendarView;
  /** The calendar's height, in rem. */
  height?: number;
  /** An IANA zone, such as "Europe/Berlin", for Google's times. */
  timeZone?: string;
  /** The calendar's language; the page's when left out. */
  locale?: string;
  labels?: Partial<CalendarEmbedLabels>;
  /**
   * Whether the visitor agreed to the calendar's site, from the page's
   * cookie notice. False shows a notice and a Load button in its place;
   * leave it out on pages that don't ask.
   */
  consent?: boolean;
  consentLabels?: Partial<ConsentLabels>;
  headingAs?: HeadingTag;
}) {
  const words = usePageWords('calendarEmbed', labels);
  const language = usePageLocale(locale);
  const preview = usePreviewMode();
  const place = useRef<HTMLDivElement>(null);
  // Undefined until the block is drawn and its colour read.
  const [background, setBackground] = useState<string | null>();
  const [agreed, setAgreed] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  // After Load, focus moves into the calendar, as in the other frames.
  useEffect(() => {
    if (agreed) frameRef.current?.focus();
  }, [agreed, background]);
  // The colour behind the calendar is known only once it's drawn, so the
  // frame waits for it rather than load twice.
  useLayoutEffect(() => {
    setBackground(blockBackground(place.current));
  }, []);

  const options = {
    view,
    timeZone: isTimeZone(timeZone) ? timeZone : undefined,
    language,
  };
  const link = calendarEmbed(src, options);
  if (!link && !(isSafeHref(src) && /^https:\/\//i.test(src))) return null;
  const page = link && (calendarEmbed(src, { ...options, background }) ?? link);
  const name = words.frame.replace('{title}', title);
  const size = { height: `${Math.min(80, Math.max(20, height))}rem` };
  const shown = consent !== false || agreed;

  const still = (
    <div
      role="img"
      aria-label={name}
      data-preview-placeholder={preview ? '' : undefined}
      style={size}
      className="bg-site-surface-2 text-site-text-2 rounded-block-inner flex w-full items-center justify-center"
    >
      <CalendarIcon size={32} />
    </div>
  );
  const frame = !page ? null : preview ||
    (shown && background === undefined) ? (
    still
  ) : shown ? (
    <iframe
      ref={frameRef}
      src={page.src}
      title={name}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={size}
      className="bg-site-surface-2 rounded-block-inner block w-full border-0"
    />
  ) : (
    <ConsentCover
      notice={consentNotice(OUTSIDE_SERVICES[page.service].name, consentLabels)}
      load={{ ...CONSENT_LABELS, ...consentLabels }.load}
      title={name}
      action="calendar_load"
      onLoad={() => setAgreed(true)}
      style={size}
    />
  );

  return (
    <Block
      name="calendar-embed"
      data-service={page?.service}
      data-view={page?.service === 'googlecalendar' ? view : undefined}
      {...root}
    >
      <ItemHead title={title} detail={detail} headingAs={headingAs} />
      {frame ? <div ref={place}>{frame}</div> : null}
      <SiteLinkButton
        href={link?.src ?? src}
        newTab
        variant="text"
        size="sm"
        action="calendar_fallback"
        className="self-center"
      >
        {words.fallback}
      </SiteLinkButton>
    </Block>
  );
}
