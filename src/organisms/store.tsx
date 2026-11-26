import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import type { SiteButtonVariant } from '../atoms/button';
import { ClockIcon, VideoIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Badge } from '../atoms/text';
import { Thumb } from '../atoms/thumb';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { Price } from '../molecules/price';
import { SellButton, type SellProps } from '../molecules/sell-button';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import type { ImageSrc } from '../system/image';

/* -------------------------------------------------------------- CourseCard */

export type CourseCardLabels = {
  /** {n} is filled in. */
  lessons: string;
  button: string;
};

export const COURSE_CARD_LABELS: CourseCardLabels = {
  lessons: '{n} lessons',
  button: 'Start learning',
};

/**
 * A course: its picture, title, how many lessons, how long, the price and a
 * button to the checkout or course page. Prices come from the app as text,
 * so "₹499" or "Free" show as written.
 */
export function CourseCard({
  title,
  detail,
  image,
  imageAlt,
  lessons,
  duration,
  level,
  price,
  was,
  href,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  labels,
  buttonVariant = 'solid',
  headingAs = 'h3',
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior &
  SellProps & {
    title: ReactNode;
    detail?: ReactNode;
    image?: ImageSrc | null;
    imageAlt?: string;
    lessons?: number;
    /** As "3 h 20 min". */
    duration?: ReactNode;
    /** As "Beginner". */
    level?: ReactNode;
    price: string;
    was?: string;
    /** The checkout or course page. Not needed with `sell`. */
    href?: string;
    labels?: Partial<CourseCardLabels>;
    buttonVariant?: SiteButtonVariant;
    headingAs?: HeadingTag;
  }) {
  const words = { ...COURSE_CARD_LABELS, ...labels };
  return (
    <Block as="article" name="course-card" {...root}>
      <ItemHead
        title={title}
        detail={detail}
        eyebrow={level}
        image={image}
        imageAlt={imageAlt}
        media="top"
        ratio="video"
        headingAs={headingAs}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-site-text-2 inline-flex flex-wrap items-center gap-x-3 gap-y-1">
          {lessons != null ? (
            <span className="inline-flex items-center gap-1.5">
              <VideoIcon size={16} />
              {words.lessons.replace('{n}', String(lessons))}
            </span>
          ) : null}
          {duration ? (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon size={16} />
              {duration}
            </span>
          ) : null}
        </span>
        <Price value={price} was={was} />
      </div>
      <SellButton
        href={href}
        sell={sell}
        sellState={sellState}
        sellLabels={sellLabels}
        renderBuy={renderBuy}
        variant={buttonVariant}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
        action="buy_course"
      >
        {words.button}
      </SellButton>
    </Block>
  );
}

/* ---------------------------------------------------------------- TopPicks */

/** One recommended product. */
export type TopPick = {
  name: ReactNode;
  href: string;
  image?: ImageSrc | null;
  /** What the picture shows. Empty when the name says it. */
  imageAlt?: string;
  /** Why the creator likes it, in a line. */
  note?: ReactNode;
  price?: string;
  /** The creator earns from the link: marked, and sent as rel="sponsored". */
  affiliate?: boolean;
};

export type TopPicksLabels = {
  affiliate: string;
  /** Shown under the list when any pick is an affiliate link. */
  disclosure: ReactNode;
};

export const TOP_PICKS_LABELS: TopPicksLabels = {
  affiliate: 'Affiliate',
  disclosure: 'I may earn a commission from links marked Affiliate.',
};

const PICK_COLUMNS = {
  1: '',
  2: '@md:grid-cols-2',
  3: '@md:grid-cols-2 @3xl:grid-cols-3',
} as const;

/**
 * Products the creator recommends, each with a picture, a short note and a
 * link. Affiliate links are marked on the card, sent with rel="sponsored",
 * and the list says so under it, as advertising rules ask.
 */
export function TopPicks({
  picks,
  title,
  columns = 1,
  labels,
  newTab = true,
  headingAs = 'h2',
  ...root
}: BlockRootProps & {
  picks: TopPick[];
  title?: ReactNode;
  columns?: 1 | 2 | 3;
  labels?: Partial<TopPicksLabels>;
  newTab?: boolean;
  headingAs?: HeadingTag;
}) {
  const words = { ...TOP_PICKS_LABELS, ...labels };
  const anyAffiliate = picks.some((pick) => pick.affiliate);
  return (
    <Block name="top-picks" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <ul
        className={cn(
          '@container m-0 grid list-none gap-3 p-0',
          PICK_COLUMNS[columns]
        )}
      >
        {picks.map((pick, n) => (
          <li key={n}>
            <SiteLink
              href={pick.href}
              newTab={newTab}
              sponsored={pick.affiliate}
              action="pick_click"
              className="bg-site-surface-2 rounded-block-inner flex items-center gap-3 p-2 no-underline transition-opacity hover:opacity-90 motion-reduce:transition-none"
            >
              {pick.image !== undefined ? (
                <Thumb
                  src={pick.image}
                  alt={pick.imageAlt ?? ''}
                  ratio="square"
                  sizes="64px"
                  className="w-16 flex-none"
                />
              ) : null}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-site-text font-semibold">
                  {pick.name}
                </span>
                {pick.note ? (
                  <span className="text-site-text-2 text-sm">{pick.note}</span>
                ) : null}
              </span>
              <span className="flex flex-none flex-col items-end gap-1">
                {pick.price ? (
                  <Price
                    value={pick.price}
                    size="sm"
                    className="text-site-text"
                  />
                ) : null}
                {pick.affiliate ? (
                  <Badge tone="outline">{words.affiliate}</Badge>
                ) : null}
              </span>
            </SiteLink>
          </li>
        ))}
      </ul>
      {anyAffiliate ? (
        <p className="text-site-text-2 m-0 text-xs">{words.disclosure}</p>
      ) : null}
    </Block>
  );
}
