import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLinkButton } from '../atoms/button';
import { CalendarIcon, MapPinIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Badge } from '../atoms/text';
import { Thumb } from '../atoms/thumb';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { LiveData } from '../molecules/live-data';
import { PlayFrame } from '../molecules/play-frame';
import { Rating } from '../molecules/rating';
import { cn } from '../system/cn';
import type { LiveProps } from '../system/live';

const subHeading = (tag: HeadingTag): HeadingTag =>
  tag === 'h2' ? 'h3' : tag === 'h3' ? 'h4' : 'p';

/* ------------------------------------------------------------ LatestVideos */

/** A video in LatestVideos, as the app reads it from the channel. */
export type VideoItem = {
  title: string;
  href: string;
  thumbnail?: string | null;
  /** As the visitor reads it, such as "3 days ago". */
  detail?: string;
};

/** The newest uploads from a channel, as pictures that open each video. */
export function LatestVideos({
  data,
  loading,
  error,
  title,
  limit = 4,
  columns = 2,
  channelHref,
  channelLabel = 'See the channel',
  headingAs = 'h2',
  ...root
}: BlockRootProps &
  LiveProps<VideoItem[]> & {
    title?: ReactNode;
    limit?: number;
    columns?: 1 | 2 | 3;
    channelHref?: string;
    channelLabel?: ReactNode;
    headingAs?: HeadingTag;
  }) {
  const Item = subHeading(headingAs);
  return (
    <Block name="latest-videos" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <LiveData data={data} loading={loading} error={error}>
        {(videos) => (
          <>
            <ul
              className={cn(
                '@container m-0 grid list-none gap-3 p-0',
                columns >= 2 && '@md:grid-cols-2',
                columns === 3 && '@3xl:grid-cols-3'
              )}
            >
              {videos.slice(0, limit).map((video) => (
                <li key={video.href}>
                  <SiteLink
                    href={video.href}
                    newTab
                    action="video_click"
                    className="flex flex-col gap-2 no-underline"
                  >
                    <Thumb src={video.thumbnail} alt="" ratio="video" />
                    <Item className="text-site-text m-0 text-sm font-semibold">
                      {video.title}
                    </Item>
                  </SiteLink>
                  {video.detail ? (
                    <p className="text-site-text-2 m-0 text-xs">
                      {video.detail}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            {channelHref ? (
              <SiteLinkButton
                href={channelHref}
                newTab
                variant="outline"
                action="channel_click"
                fullWidth
              >
                {channelLabel}
              </SiteLinkButton>
            ) : null}
          </>
        )}
      </LiveData>
    </Block>
  );
}

/* ------------------------------------------------------------- LatestPosts */

/** A post in LatestPosts, from the creator's blog or any feed. */
export type PostItem = {
  title: string;
  href: string;
  /** As the visitor reads it, such as "12 Nov 2026". */
  date?: string;
  dateTime?: string;
  excerpt?: string;
  image?: string | null;
};

/** The newest posts from the creator's blog or any feed. */
export function LatestPosts({
  data,
  loading,
  error,
  title,
  limit = 3,
  showImages = true,
  newTab = false,
  headingAs = 'h2',
  ...root
}: BlockRootProps &
  LiveProps<PostItem[]> & {
    title?: ReactNode;
    limit?: number;
    showImages?: boolean;
    /** Posts on another site open in a new tab anyway. */
    newTab?: boolean;
    headingAs?: HeadingTag;
  }) {
  const Item = subHeading(headingAs);
  return (
    <Block name="latest-posts" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <LiveData data={data} loading={loading} error={error}>
        {(posts) => (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {posts.slice(0, limit).map((post) => (
              <li key={post.href} className="flex gap-3">
                {showImages && post.image !== undefined ? (
                  <Thumb
                    src={post.image}
                    alt=""
                    ratio="square"
                    className="w-16 flex-none"
                  />
                ) : null}
                <div className="flex min-w-0 flex-col gap-0.5">
                  {post.date ? (
                    <time
                      dateTime={post.dateTime}
                      className="text-site-text-2 text-xs"
                    >
                      {post.date}
                    </time>
                  ) : null}
                  <Item className="m-0 text-base font-semibold">
                    <SiteLink
                      href={post.href}
                      newTab={newTab || undefined}
                      action="post_click"
                    >
                      {post.title}
                    </SiteLink>
                  </Item>
                  {post.excerpt ? (
                    <p className="text-site-text-2 m-0 line-clamp-2 text-sm">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </LiveData>
    </Block>
  );
}

/* -------------------------------------------------------------- LiveStatus */

/** Whether the creator is streaming now. */
export type LiveStatusData = {
  live: boolean;
  /** The channel's name on the service. */
  channel: string;
  /** The channel's page. */
  url: string;
  /** The stream's title, while live. */
  title?: string;
  viewers?: number;
  /** For when they're offline, such as "Live Tuesdays at 8 pm". */
  schedule?: string;
};

export type LiveStatusLabels = {
  live: string;
  offline: string;
  /** {n} is filled in. */
  viewers: string;
  watch: string;
  /** {channel} is filled in. */
  play: string;
};

export const LIVE_STATUS_LABELS: LiveStatusLabels = {
  live: 'Live now',
  offline: 'Offline',
  viewers: '{n} watching',
  watch: 'Watch on the channel',
  play: 'Watch {channel} live',
};

/**
 * Live or offline, from data the app reads from the streaming service. While
 * live it shows the title, the viewers and a player that loads on a tap
 * (Twitch: pass `parents`, the sites the page is on, as Twitch asks).
 */
export function LiveStatus({
  data,
  loading,
  error,
  parents,
  labels,
  locale,
  headingAs = 'h3',
  ...root
}: BlockRootProps &
  LiveProps<LiveStatusData> & {
    /** The page's own hosts, such as ["levuche.com"], for Twitch's player. */
    parents?: string[];
    labels?: Partial<LiveStatusLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const words = { ...LIVE_STATUS_LABELS, ...labels };
  const Heading = headingAs;
  const hosts = (parents ?? []).filter((h) => /^[a-z0-9.-]+$/i.test(h));
  return (
    <Block name="live-status" {...root}>
      <LiveData data={data} loading={loading} error={error}>
        {(status) => {
          const twitch =
            status.live &&
            hosts.length &&
            /^[a-z0-9_]{3,25}$/i.test(status.channel)
              ? `https://player.twitch.tv/?channel=${status.channel}&${hosts
                  .map((h) => `parent=${h}`)
                  .join('&')}`
              : null;
          return (
            <>
              <div className="flex items-center justify-between gap-2">
                <Heading className="text-block-title m-0 font-bold">
                  {status.channel}
                </Heading>
                <Badge tone={status.live ? 'solid' : 'outline'}>
                  {status.live ? (
                    <span
                      aria-hidden
                      className="bg-site-on-button size-2 rounded-full motion-safe:animate-pulse"
                    />
                  ) : null}
                  {status.live ? words.live : words.offline}
                </Badge>
              </div>
              {status.live && status.title ? (
                <p className="m-0">{status.title}</p>
              ) : null}
              {status.live && status.viewers != null ? (
                <p className="text-site-text-2 m-0 text-sm">
                  {words.viewers.replace(
                    '{n}',
                    new Intl.NumberFormat(locale, {
                      notation: 'compact',
                    }).format(status.viewers)
                  )}
                </p>
              ) : null}
              {!status.live && status.schedule ? (
                <p className="text-site-text-2 m-0 text-sm">
                  {status.schedule}
                </p>
              ) : null}
              {twitch ? (
                <PlayFrame
                  src={twitch}
                  title={status.title ?? status.channel}
                  playLabel={words.play.replace('{channel}', status.channel)}
                  action="play_live"
                />
              ) : null}
              <SiteLinkButton
                href={status.url}
                newTab
                variant={status.live ? 'solid' : 'outline'}
                action="live_channel"
                fullWidth
              >
                {words.watch}
              </SiteLinkButton>
            </>
          );
        }}
      </LiveData>
    </Block>
  );
}

/* --------------------------------------------------------------- EventList */

/** An event or tour date. */
export type EventItem = {
  /** As the visitor reads it, such as "Sat 6 Dec". */
  date: string;
  dateTime?: string;
  title: string;
  venue?: string;
  city?: string;
  /** Where tickets are sold. */
  href?: string;
  soldOut?: boolean;
};

export type EventListLabels = { tickets: string; soldOut: string };

export const EVENT_LIST_LABELS: EventListLabels = {
  tickets: 'Tickets',
  soldOut: 'Sold out',
};

/**
 * Upcoming events or tour dates with ticket links. Type them in, or let the
 * app pass them from a tour-dates feed.
 */
export function EventList({
  data,
  loading,
  error,
  title,
  labels,
  headingAs = 'h2',
  ...root
}: BlockRootProps &
  LiveProps<EventItem[]> & {
    title?: ReactNode;
    labels?: Partial<EventListLabels>;
    headingAs?: HeadingTag;
  }) {
  const words = { ...EVENT_LIST_LABELS, ...labels };
  const Item = subHeading(headingAs);
  return (
    <Block name="event-list" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <LiveData data={data} loading={loading} error={error}>
        {(events) => (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {events.map((event, n) => (
              <li
                key={n}
                className="border-site-border flex flex-wrap items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <time
                    dateTime={event.dateTime}
                    className="inline-flex items-center gap-1.5 text-sm font-bold"
                  >
                    <CalendarIcon size={16} />
                    {event.date}
                  </time>
                  <Item className="m-0 text-base font-semibold">
                    {event.title}
                  </Item>
                  {event.venue || event.city ? (
                    <p className="text-site-text-2 m-0 inline-flex items-center gap-1.5 text-sm">
                      <MapPinIcon size={14} />
                      {[event.venue, event.city].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
                </div>
                {event.soldOut ? (
                  <Badge tone="outline">{words.soldOut}</Badge>
                ) : event.href ? (
                  <SiteLinkButton
                    href={event.href}
                    newTab
                    size="sm"
                    action="event_tickets"
                    aria-label={`${words.tickets}: ${event.title}, ${event.date}`}
                  >
                    {words.tickets}
                  </SiteLinkButton>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </LiveData>
    </Block>
  );
}

/* ----------------------------------------------------------- ReviewSummary */

const oneDecimal = (n: number, locale?: string) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(n);

/** Reviews from a review site, as the app reads them. */
export type ReviewSummaryData = {
  rating: number;
  count: number;
  /** The site's page of reviews. */
  url: string;
  reviews: { author: string; rating: number; text: string; date?: string }[];
};

export type ReviewSummaryLabels = {
  /** {rating} and {count} are filled in. */
  summary: string;
  all: string;
};

export const REVIEW_SUMMARY_LABELS: ReviewSummaryLabels = {
  summary: '{rating} from {count} reviews',
  all: 'Read all reviews',
};

/**
 * The star rating and a few recent reviews from a review site. `attribution`
 * is the line the site's terms ask for, such as "Reviews from Google"; it
 * always shows.
 */
export function ReviewSummary({
  data,
  loading,
  error,
  title,
  attribution,
  limit = 3,
  labels,
  locale,
  headingAs = 'h2',
  ...root
}: BlockRootProps &
  LiveProps<ReviewSummaryData> & {
    title?: ReactNode;
    attribution: ReactNode;
    limit?: number;
    labels?: Partial<ReviewSummaryLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const words = { ...REVIEW_SUMMARY_LABELS, ...labels };
  return (
    <Block name="review-summary" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <LiveData data={data} loading={loading} error={error}>
        {(summary) => (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-block-title font-bold tabular-nums">
                {oneDecimal(summary.rating, locale)}
              </span>
              <Rating value={summary.rating} />
              <span className="text-site-text-2 text-sm">
                {words.summary
                  .replace('{rating}', oneDecimal(summary.rating, locale))
                  .replace(
                    '{count}',
                    new Intl.NumberFormat(locale).format(summary.count)
                  )}
              </span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {summary.reviews.slice(0, limit).map((review, n) => (
                <li key={n} className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {review.author}
                    <Rating value={review.rating} size={12} />
                  </span>
                  <blockquote className="m-0 line-clamp-3 text-sm">
                    {review.text}
                  </blockquote>
                  {review.date ? (
                    <span className="text-site-text-2 text-xs">
                      {review.date}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="text-site-text-2 m-0 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span>{attribution}</span>
              <SiteLink href={summary.url} newTab action="reviews_all">
                {words.all}
              </SiteLink>
            </p>
          </>
        )}
      </LiveData>
    </Block>
  );
}

/* -------------------------------------------------------------- NowPlaying */

export type NowPlayingKind = 'listening' | 'reading' | 'watching';

export const NOW_PLAYING_LABELS: Record<NowPlayingKind, string> = {
  listening: 'Listening to',
  reading: 'Reading',
  watching: 'Watching',
};

/** A small card for what the creator is listening to, reading or watching. */
export function NowPlaying({
  kind,
  title,
  by,
  image,
  href,
  labels,
  ...root
}: BlockRootProps & {
  kind: NowPlayingKind;
  title: string;
  /** The artist, author or show. */
  by?: string;
  image?: string | null;
  href?: string;
  labels?: Partial<Record<NowPlayingKind, string>>;
}) {
  const words = { ...NOW_PLAYING_LABELS, ...labels };
  const body = (
    <>
      {image !== undefined ? (
        <Thumb src={image} alt="" ratio="square" className="w-14 flex-none" />
      ) : null}
      <span className="flex min-w-0 flex-col">
        <span className="text-site-text-2 text-xs font-semibold tracking-wide uppercase">
          {words[kind]}
        </span>
        <span className="text-site-text truncate font-semibold">{title}</span>
        {by ? (
          <span className="text-site-text-2 truncate text-sm">{by}</span>
        ) : null}
      </span>
    </>
  );
  return (
    <Block name="now-playing" {...root}>
      {href ? (
        <SiteLink
          href={href}
          newTab
          action="now_playing"
          className="flex items-center gap-3 no-underline"
        >
          {body}
        </SiteLink>
      ) : (
        <div className="flex items-center gap-3">{body}</div>
      )}
    </Block>
  );
}
