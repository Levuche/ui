import type { ReactNode } from 'react';
import { Avatar } from '../atoms/avatar';
import { Block, type BlockRootProps } from '../atoms/block';
import { ArrowRightIcon } from '../atoms/icons';
import { Ribbon } from '../atoms/text';
import { Thumb } from '../atoms/thumb';
import { SellButton, type SellProps } from '../molecules/sell-button';
import type { HeadingTag } from '../molecules/item-head';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { usePageWords } from '../system/page-words';
import { sellJson } from '../system/sell';

/**
 * What sits beside an action card's title:
 *
 * - picture: one picture, such as a cover
 * - covers: up to three covers fanned out, for a bundle
 * - photo: the creator's photo, with a dot when they're live
 */
export type ActionCardMedia =
  | { type: 'picture'; src: string | null; alt?: string }
  | { type: 'covers'; covers: { src: string | null; alt?: string }[] }
  | {
      type: 'photo';
      name: string;
      src?: string | null;
      /** Shows a dot on the photo, named by `liveLabel`. */
      live?: boolean;
      liveLabel?: string;
    };

const FAN = [
  'z-0 -rotate-8 rtl:rotate-8 start-0',
  'z-10 start-5',
  'z-20 rotate-8 rtl:-rotate-8 start-10',
];

function Media({ media }: { media: ActionCardMedia }) {
  const live = usePageWords('liveStatus').live;
  if (media.type === 'picture') {
    return (
      <Thumb
        src={media.src}
        alt={media.alt ?? ''}
        ratio="square"
        className="size-18 flex-none"
      />
    );
  }
  if (media.type === 'covers') {
    // Saved settings can leave the list out.
    const covers = (Array.isArray(media.covers) ? media.covers : []).slice(
      0,
      3
    );
    if (covers.length === 0) return null;
    return (
      <span className="relative isolate block h-20 w-24 flex-none">
        {covers.map((cover, i) => (
          <Thumb
            key={i}
            src={cover.src}
            alt={cover.alt ?? ''}
            ratio="portrait"
            className={cn(
              'ring-site-surface absolute top-1 w-13 shadow-md ring-2',
              FAN[covers.length === 1 ? 1 : i]
            )}
          />
        ))}
      </span>
    );
  }
  return (
    <span className="relative block flex-none">
      <Avatar name={media.name} src={media.src} size={64} />
      {media.live ? (
        <span
          role="img"
          aria-label={media.liveLabel ?? live}
          className="bg-site-button ring-site-surface absolute end-0.5 bottom-0.5 size-4 rounded-full ring-3"
        >
          <span className="bg-site-button absolute inset-0 rounded-full motion-safe:animate-ping" />
        </span>
      ) : null}
    </span>
  );
}

/**
 * A bold card that leads the eye to one of the creator's main offers: a
 * title, a line of detail, something to look at beside them, and a bar
 * across the bottom that says what happens next. It's in the accent colour
 * unless the creator picks another tone.
 *
 * The whole card is one press: a link to `href`, or with `sell` a button that
 * reports what it buys and lets the app start the checkout, as the selling
 * blocks do.
 */
export function ActionCard({
  title,
  detail,
  buttonLabel,
  href,
  media,
  ribbon,
  headingAs: Heading = 'h2',
  action,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior &
  SellProps & {
    title: string;
    detail?: ReactNode;
    /** The words on the bar, such as "Book a call". */
    buttonLabel: ReactNode;
    /** Where the card goes. Not needed with `sell`. */
    href?: string | null;
    media?: ActionCardMedia;
    /** A small tilted label over the top corner, such as "Most popular". */
    ribbon?: ReactNode;
    headingAs?: HeadingTag;
    /** The press's name in tracking. Defaults to buy with `sell`, else link_click. */
    action?: string;
  }) {
  // A sell that can't check out falls back to the link, as SellButton does.
  const selling = Boolean(sellJson(sell));
  return (
    <Block
      as="article"
      name="action-card"
      defaults={{ tone: 'accent' }}
      {...root}
      className={cn('relative', root.className)}
    >
      {ribbon ? <Ribbon>{ribbon}</Ribbon> : null}
      <div className="flex items-center gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading className="text-block-title m-0 font-bold">{title}</Heading>
          {detail ? <p className="text-site-text-2 m-0">{detail}</p> : null}
        </div>
        {media ? <Media media={media} /> : null}
      </div>
      <SellButton
        href={href}
        sell={sell}
        sellState={sellState}
        sellLabels={sellLabels}
        renderBuy={renderBuy}
        action={action ?? (selling ? 'buy' : 'link_click')}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
        // The bar's ::after covers the card, so a press anywhere on the card
        // is a press on it.
        className={
          selling
            ? "[&>button]:after:absolute [&>button]:after:inset-0 [&>button]:after:content-['']"
            : "after:absolute after:inset-0 after:content-['']"
        }
      >
        <span className="flex w-full items-center justify-between gap-3">
          {buttonLabel}
          <span
            aria-hidden
            className="bg-site-on-button text-site-button flex size-7 flex-none items-center justify-center rounded-full"
          >
            <ArrowRightIcon size={16} className="rtl:-scale-x-100" />
          </span>
        </span>
      </SellButton>
    </Block>
  );
}
