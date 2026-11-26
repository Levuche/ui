import type { ButtonHTMLAttributes, FormEventHandler, ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import {
  SiteButton,
  siteButtonClasses,
  type SiteButtonSize,
  type SiteButtonVariant,
} from '../atoms/button';
import { ClockIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Badge, Ribbon } from '../atoms/text';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import type { FormStatus } from '../system/state';
import { FormNotice } from '../molecules/form-notice';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { Price } from '../molecules/price';
import {
  SellButton,
  SellField,
  type SellProps,
} from '../molecules/sell-button';
import type { SellRef, SellState } from '../system/sell';
import { columnSizes, type ImageSrc } from '../system/image';

/**
 * A pack in a list: thumbnail, title, what's in it, price. The row links to
 * `href`, or with `sell` gets a small buy button for BuildBase selling.
 */
export function PackRow({
  title,
  detail,
  price,
  was,
  image,
  href,
  newTab,
  sponsored,
  nofollow,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  buttonLabel = 'Buy',
  saveLabel,
  duration,
  ...root
}: BlockRootProps &
  LinkBehavior &
  SellProps & {
    /** With `was`, what the visitor saves ("Save {amount}"); null hides it. */
    saveLabel?: string | null;
    /** The words on the buy button, with `sell`. */
    buttonLabel?: ReactNode;
    title: string;
    detail?: ReactNode;
    /** How long a service takes, as "4.5 h", shown with a clock. */
    duration?: ReactNode;
    price: string;
    was?: string;
    image?: ImageSrc | null;
    href?: string;
  }) {
  const body = (
    <>
      <Thumb src={image} ratio="square" sizes="52px" className="size-13" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        {detail ? (
          <span className="text-site-text-2 text-sm">{detail}</span>
        ) : null}
        {duration ? (
          <span className="text-site-text-2 inline-flex items-center gap-1.5 text-sm">
            <ClockIcon size={14} className="flex-none" />
            {duration}
          </span>
        ) : null}
      </span>
      <Price saveLabel={saveLabel} value={price} was={was} />
    </>
  );
  const row = 'text-site-text flex items-center gap-3 no-underline';
  return (
    <Block name="pack-row" {...root}>
      {sell ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className={cn(row, 'min-w-48 flex-1')}>{body}</div>
          <SellButton
            sell={sell}
            sellState={sellState}
            sellLabels={sellLabels}
            renderBuy={renderBuy}
            size="sm"
            fullWidth={false}
          >
            {buttonLabel}
          </SellButton>
        </div>
      ) : href ? (
        <SiteLink
          href={href}
          newTab={newTab}
          sponsored={sponsored}
          nofollow={nofollow}
          action="view_product"
          className={row}
        >
          {body}
        </SiteLink>
      ) : (
        <div className={row}>{body}</div>
      )}
    </Block>
  );
}

/** "I'll take it": the creator's buy button, in their colours and shape. */
export function BuyButton({
  variant = 'solid',
  size = 'lg',
  children = 'I’ll take it',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  loading?: boolean;
}) {
  return (
    <SiteButton
      type={type}
      variant={variant}
      size={size}
      action="buy"
      fullWidth
      {...props}
    >
      {children}
    </SiteButton>
  );
}

/** The words a checkout shows. */
export type PackCheckoutLabels = {
  error: ReactNode;
};

export const PACK_CHECKOUT_LABELS: PackCheckoutLabels = {
  error: 'The payment didn’t go through. Please try again.',
};

/**
 * Checkout for a digital pack: the consent to start the download now (the
 * buyer gives up the 14-day right to cancel) must be ticked before the buy
 * button sends the form. `status` is how the payment went.
 */
export function PackCheckout({
  price,
  consent = 'I want to download now and understand I lose my 14-day right to cancel.',
  buttonLabel,
  buttonVariant,
  labels,
  status = 'idle',
  onSubmit,
  action,
  sell,
  ...root
}: BlockRootProps & {
  price: string;
  /** What the form buys through BuildBase, sent as a hidden `sell` field. */
  sell?: SellRef;
  consent?: ReactNode;
  /** Defaults to "I'll take it, {price}". */
  buttonLabel?: ReactNode;
  buttonVariant?: SiteButtonVariant;
  labels?: Partial<PackCheckoutLabels>;
  status?: FormStatus;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string | ((data: FormData) => void | Promise<void>);
}) {
  return (
    <Block
      as="form"
      name="pack-checkout"
      data-action="buy"
      defaults={{ tone: 'plain' }}
      action={action}
      method={typeof action === 'string' ? 'post' : undefined}
      onSubmit={onSubmit}
      {...root}
    >
      <SellField sell={sell} />
      <label className="text-site-text-2 flex items-start gap-2.5 text-sm leading-normal">
        <input
          type="checkbox"
          name="consent"
          required
          className="accent-site-button m-0 size-5.5 flex-none"
        />
        {consent}
      </label>
      <BuyButton
        type="submit"
        variant={buttonVariant}
        loading={status === 'sending'}
      >
        {buttonLabel ?? <>I’ll take it, {price}</>}
      </BuyButton>
      <FormNotice
        status={status}
        error={labels?.error ?? PACK_CHECKOUT_LABELS.error}
      />
    </Block>
  );
}

/**
 * The featured pack: big picture, title, what's in it, price and buy. With
 * `sell` the button checks out through BuildBase; with `href` it links to a
 * checkout on another site.
 */
export function FeaturedPack({
  title,
  detail,
  duration,
  price,
  was,
  image,
  imageAlt = '',
  ratio,
  action,
  buttonLabel = 'I’ll take it',
  headingAs = 'h2',
  ribbon,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  saveLabel,
  href,
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior &
  SellProps & {
    /** With `was`, what the visitor saves ("Save {amount}"); null hides it. */
    saveLabel?: string | null;
    /** A small tilted label over the top corner, such as "Most popular". */
    ribbon?: ReactNode;
    title: string;
    detail?: ReactNode;
    /** How long a service takes, as "4.5 h", shown with a clock. */
    duration?: ReactNode;
    price: string;
    was?: string;
    image?: ImageSrc | null;
    imageAlt?: string;
    ratio?: ThumbRatio;
    /**
     * The buy control. Defaults to a buy button for `sell`, a link to `href`,
     * or else a pill with `buttonLabel` that does nothing.
     */
    action?: ReactNode;
    /**
     * A checkout on another site, for a product not sold through BuildBase.
     * Not used with `sell`.
     */
    href?: string;
    buttonLabel?: ReactNode;
    headingAs?: HeadingTag;
  }) {
  return (
    <Block
      as="article"
      name="featured-pack"
      {...root}
      className={cn('relative', root.className)}
    >
      {ribbon ? <Ribbon>{ribbon}</Ribbon> : null}
      <ItemHead
        title={title}
        detail={detail}
        image={image === undefined ? null : image}
        imageAlt={imageAlt}
        ratio={ratio}
        media="top"
        headingAs={headingAs}
      />
      {duration ? (
        <p className="text-site-text-2 m-0 inline-flex items-center gap-1.5 text-sm">
          <ClockIcon size={16} className="flex-none" />
          {duration}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <Price saveLabel={saveLabel} value={price} was={was} size="lg" />
        {action ??
          (sell || href ? (
            <SellButton
              sell={sell}
              sellState={sellState}
              sellLabels={sellLabels}
              renderBuy={renderBuy}
              href={href}
              newTab={newTab}
              sponsored={sponsored}
              nofollow={nofollow}
              size="sm"
              fullWidth={false}
            >
              {buttonLabel}
            </SellButton>
          ) : (
            <span className={siteButtonClasses({ size: 'sm' })}>
              {buttonLabel}
            </span>
          ))}
      </div>
    </Block>
  );
}

/** Smaller packs, two to a row on a phone and up to four on a desktop. */
export function PackGrid({
  packs,
  columns = 2,
  buttonLabel = 'Buy',
  sellLabels,
  renderBuy,
  saveLabel,
  ...root
}: BlockRootProps &
  Pick<SellProps, 'sellLabels' | 'renderBuy'> & {
    /** With `was`, what the visitor saves ("Save {amount}"); null hides it. */
    saveLabel?: string | null;
    packs: (LinkBehavior & {
      title: string;
      price: string;
      was?: string;
      image?: ImageSrc | null;
      href?: string;
      /** Sells the pack through BuildBase, with a buy button on the tile. */
      sell?: SellRef;
      sellState?: SellState;
    })[];
    /** The words on each buy button, for packs with `sell`. */
    buttonLabel?: ReactNode;
    /** Packs to a row from a tablet up; two on a phone. */
    columns?: 2 | 3 | 4;
  }) {
  return (
    <Block name="pack-grid" defaults={{ tone: 'plain' }} {...root}>
      <ul
        className={cn(
          'm-0 grid list-none grid-cols-2 gap-2.5 p-0 text-sm',
          columns === 3 && 'md:grid-cols-3',
          columns === 4 && 'md:grid-cols-4'
        )}
      >
        {packs.map(
          ({ title, price, was, image, href, sell, sellState, ...link }, i) => {
            const body = (
              <>
                <Thumb
                  src={image}
                  sizes={columnSizes(1 / columns, 1 / 2)}
                  className="h-15 w-full"
                />
                <strong>{title}</strong>
                <Price
                  saveLabel={saveLabel}
                  value={price}
                  was={was}
                  size="sm"
                />
              </>
            );
            const tile =
              'bg-site-surface text-site-text rounded-block flex h-full flex-col gap-1.5 p-2.5 no-underline';
            return (
              <li key={`${i}-${title}`} className="m-0">
                {sell ? (
                  <div className={tile}>
                    {body}
                    <SellButton
                      sell={sell}
                      sellState={sellState}
                      sellLabels={sellLabels}
                      renderBuy={renderBuy}
                      size="sm"
                      className="mt-auto"
                    >
                      {buttonLabel}
                    </SellButton>
                  </div>
                ) : href ? (
                  <SiteLink
                    href={href}
                    newTab={link.newTab}
                    sponsored={link.sponsored}
                    nofollow={link.nofollow}
                    action="view_product"
                    className={tile}
                  >
                    {body}
                  </SiteLink>
                ) : (
                  <div className={tile}>{body}</div>
                )}
              </li>
            );
          }
        )}
      </ul>
    </Block>
  );
}

/** The words a credit pack shows. */
export type CreditPackLabels = {
  /** {n} is filled in. */
  credits: string;
  /** {n} is filled in. */
  bonus: string;
  button: string;
};

export const CREDIT_PACK_LABELS: CreditPackLabels = {
  credits: '{n} credits',
  bonus: '+{n} bonus',
  button: 'Buy credits',
};

/**
 * A pack of credits: how many, any bonus, the price, how long they last and
 * a buy button. With `sell` (a BuildBase credit package) the press reports
 * it; otherwise the button links to `href`.
 */
export function CreditPack({
  credits,
  bonus,
  price,
  was,
  detail,
  expires,
  href,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  featured = false,
  featuredLabel,
  labels,
  locale,
  headingAs: Heading = 'h3',
  saveLabel,
  ...root
}: BlockRootProps &
  SellProps & {
    /** With `was`, what the visitor saves ("Save {amount}"); null hides it. */
    saveLabel?: string | null;
    credits: number;
    bonus?: number;
    /** As "₹499". */
    price: string;
    was?: string;
    detail?: ReactNode;
    /** As "Credits last a year". */
    expires?: ReactNode;
    href?: string;
    /** Outlines the pack in the button colour, for the one to pick. */
    featured?: boolean;
    featuredLabel?: string;
    labels?: Partial<CreditPackLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const words = { ...CREDIT_PACK_LABELS, ...labels };
  const count = new Intl.NumberFormat(locale);
  return (
    <Block
      as="article"
      name="credit-pack"
      {...root}
      className={cn(
        'border-2',
        featured ? 'border-site-button' : 'border-transparent',
        root.className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading className="text-block-title m-0 font-bold tabular-nums">
          {words.credits.replace('{n}', count.format(credits))}
        </Heading>
        {featured && featuredLabel ? (
          <Badge tone="solid">{featuredLabel}</Badge>
        ) : bonus ? (
          <Badge tone="outline">
            {words.bonus.replace('{n}', count.format(bonus))}
          </Badge>
        ) : null}
      </div>
      {featured && featuredLabel && bonus ? (
        <p className="m-0 text-sm font-semibold">
          {words.bonus.replace('{n}', count.format(bonus))}
        </p>
      ) : null}
      {detail ? <p className="text-site-text-2 m-0 text-sm">{detail}</p> : null}
      <p className="m-0">
        <Price saveLabel={saveLabel} value={price} was={was} size="lg" />
      </p>
      {expires ? (
        <p className="text-site-text-2 m-0 text-sm">{expires}</p>
      ) : null}
      <SellButton
        href={href}
        sell={sell}
        sellState={sellState}
        sellLabels={sellLabels}
        renderBuy={renderBuy}
        variant={featured ? 'solid' : 'outline'}
        action="buy_credits"
      >
        {words.button}
      </SellButton>
    </Block>
  );
}
