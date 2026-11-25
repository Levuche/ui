import type { ButtonHTMLAttributes, FormEventHandler, ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import {
  SiteButton,
  siteButtonClasses,
  type SiteButtonSize,
  type SiteButtonVariant,
} from '../atoms/button';
import { SiteLink } from '../atoms/link';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import type { FormStatus } from '../system/state';
import { FormNotice } from '../molecules/form-notice';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { Price } from '../molecules/price';

/** A pack in a list: thumbnail, title, what's in it, price. */
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
  ...root
}: BlockRootProps &
  LinkBehavior & {
    title: string;
    detail?: ReactNode;
    price: string;
    was?: string;
    image?: string | null;
    href?: string;
  }) {
  const body = (
    <>
      <Thumb src={image} ratio="square" className="size-13" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        {detail ? (
          <span className="text-site-text-2 text-sm">{detail}</span>
        ) : null}
      </span>
      <Price value={price} was={was} />
    </>
  );
  const row = 'text-site-text flex items-center gap-3 no-underline';
  return (
    <Block name="pack-row" {...root}>
      {href ? (
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
  ...root
}: BlockRootProps & {
  price: string;
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
      defaults={{ tone: 'plain' }}
      action={action}
      method={typeof action === 'string' ? 'post' : undefined}
      onSubmit={onSubmit}
      {...root}
    >
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
        error={
          labels?.error ?? 'The payment didn’t go through. Please try again.'
        }
      />
    </Block>
  );
}

/** The featured pack: big picture, title, what's in it, price and buy. */
export function FeaturedPack({
  title,
  detail,
  price,
  was,
  image,
  imageAlt = '',
  ratio,
  action,
  buttonLabel = 'I’ll take it',
  headingAs = 'h2',
  ...root
}: BlockRootProps & {
  title: string;
  detail?: ReactNode;
  price: string;
  was?: string;
  image?: string | null;
  imageAlt?: string;
  ratio?: ThumbRatio;
  /** The buy control; defaults to a pill with `buttonLabel` that does nothing. */
  action?: ReactNode;
  buttonLabel?: ReactNode;
  headingAs?: HeadingTag;
}) {
  return (
    <Block as="article" name="featured-pack" {...root}>
      <ItemHead
        title={title}
        detail={detail}
        image={image === undefined ? null : image}
        imageAlt={imageAlt}
        ratio={ratio}
        media="top"
        headingAs={headingAs}
      />
      <div className="flex items-center justify-between gap-3">
        <Price value={price} was={was} size="lg" />
        {action ?? (
          <span className={siteButtonClasses({ size: 'sm' })}>
            {buttonLabel}
          </span>
        )}
      </div>
    </Block>
  );
}

/** Smaller packs, two to a row on a phone and up to four on a desktop. */
export function PackGrid({
  packs,
  columns = 2,
  ...root
}: BlockRootProps & {
  packs: (LinkBehavior & {
    title: string;
    price: string;
    was?: string;
    image?: string | null;
    href?: string;
  })[];
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
        {packs.map(({ title, price, was, image, href, ...link }, i) => {
          const body = (
            <>
              <Thumb src={image} className="h-15 w-full" />
              <strong>{title}</strong>
              <Price value={price} was={was} size="sm" />
            </>
          );
          const tile =
            'bg-site-surface text-site-text rounded-block flex h-full flex-col gap-1.5 p-2.5 no-underline';
          return (
            <li key={`${i}-${title}`} className="m-0">
              {href ? (
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
        })}
      </ul>
    </Block>
  );
}
