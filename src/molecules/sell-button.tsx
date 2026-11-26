import type { ReactNode } from 'react';
import {
  SiteButton,
  SiteLinkButton,
  type SiteButtonSize,
  type SiteButtonVariant,
} from '../atoms/button';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import {
  sellJson,
  type SellLabels,
  type SellRef,
  type SellState,
} from '../system/sell';
import { usePageWords } from '../system/page-words';

/** What `renderBuy` gets, to draw the app's own buy button in its place. */
export type BuyRender = {
  sell: SellRef;
  state: SellState;
  /** The words the block's own button would show. */
  label: ReactNode;
  /** The press's name, such as "buy" or "book". */
  action: string;
};

/** The props every selling block shares. */
export type SellProps = {
  /** What BuildBase selling checks out; the button then reports it. */
  sell?: SellRef;
  /** Where the sale stands, from the app. */
  sellState?: SellState;
  sellLabels?: Partial<SellLabels>;
  /** Draws the app's own buy button instead of the block's. */
  renderBuy?: (buy: BuyRender) => ReactNode;
};

/**
 * The buy control of a selling block. With `sell`, a button that reports the
 * press with what it buys (data-sell) and follows no link; the app starts
 * the checkout. Without it, a link to `href`. `sellState` disables the button
 * while sending, when sold out or not on sale, and says so under it.
 */
export function SellButton({
  sell,
  sellState = 'idle',
  sellLabels,
  renderBuy,
  href,
  action = 'buy',
  variant,
  size,
  fullWidth = true,
  className,
  disabled = false,
  children,
  newTab,
  sponsored,
  nofollow,
}: SellProps &
  LinkBehavior & {
    href?: string | null;
    action?: string;
    variant?: SiteButtonVariant;
    size?: SiteButtonSize;
    fullWidth?: boolean;
    className?: string;
    /** Off until the visitor has chosen, such as a time. */
    disabled?: boolean;
    children: ReactNode;
  }) {
  const words = usePageWords('sell', sellLabels);
  const json = sellJson(sell);
  if (sell && json) {
    if (renderBuy) {
      return (
        <>{renderBuy({ sell, state: sellState, label: children, action })}</>
      );
    }
    const closed = sellState === 'sold_out' || sellState === 'unavailable';
    const note =
      sellState === 'sold_out'
        ? words.soldOut
        : sellState === 'unavailable'
          ? words.unavailable
          : sellState === 'error'
            ? words.error
            : null;
    return (
      <span
        className={cn(
          'flex flex-col',
          fullWidth ? 'w-full' : 'items-end',
          className
        )}
      >
        <SiteButton
          type="button"
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          action={action}
          data-sell={json}
          data-sell-state={sellState}
          disabled={closed || disabled}
          loading={sellState === 'sending'}
        >
          {sellState === 'sold_out' ? words.soldOut : children}
        </SiteButton>
        <span
          role="status"
          className={cn(
            'text-sm not-empty:mt-1.5',
            sellState === 'error' ? 'text-site-text' : 'text-site-text-2'
          )}
        >
          {sellState === 'sold_out' ? null : note}
        </span>
      </span>
    );
  }
  if (!href) return null;
  return (
    <SiteLinkButton
      href={href}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      action={action}
      newTab={newTab}
      sponsored={sponsored}
      nofollow={nofollow}
      className={className}
    >
      {children}
    </SiteLinkButton>
  );
}

/** A hidden field that carries what a form sells, for its server action. */
export function SellField({ sell }: { sell?: SellRef }) {
  const json = sellJson(sell);
  return json ? <input type="hidden" name="sell" value={json} /> : null;
}
