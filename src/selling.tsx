import type { ButtonHTMLAttributes, FormEventHandler, ReactNode } from 'react';
import {
  siteButtonClasses,
  type SiteButtonSize,
  type SiteButtonVariant,
} from './basics';
import { cn } from './cn';
import { Thumb } from './thumb';

/** A pack in a list: thumbnail, title, what's in it, price. */
export function PackRow({
  title,
  detail,
  price,
  image,
  href,
  className,
}: {
  title: string;
  detail?: ReactNode;
  price: string;
  image?: string | null;
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <Thumb
        src={image}
        className="size-[52px] rounded-[calc(var(--site-radius)*0.75)]"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{title}</span>
        {detail ? (
          <span className="text-site-text-2 text-[13px]">{detail}</span>
        ) : null}
      </span>
      <span className="font-bold tabular-nums">{price}</span>
    </>
  );
  const classes = cn(
    'bg-site-surface text-site-text rounded-site flex items-center gap-3 p-3 no-underline',
    className
  );
  return href ? (
    <a href={href} className={classes}>
      {body}
    </a>
  ) : (
    <div className={classes}>{body}</div>
  );
}

/** "I'll take it": the creator's buy button, in their colours and shape. */
export function BuyButton({
  variant = 'solid',
  size = 'lg',
  className,
  children = 'I’ll take it',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
}) {
  return (
    <button
      type={type}
      className={siteButtonClasses({
        variant,
        size,
        fullWidth: true,
        className,
      })}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Checkout for a digital pack: the consent to start the download now (the
 * buyer gives up the 14-day right to cancel) must be ticked before the buy
 * button sends the form.
 */
export function PackCheckout({
  price,
  consent = 'I want to download now and understand I lose my 14-day right to cancel.',
  buttonLabel,
  onSubmit,
  action,
  className,
}: {
  price: string;
  consent?: ReactNode;
  /** Defaults to "I'll take it, {price}". */
  buttonLabel?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      method={action ? 'post' : undefined}
      onSubmit={onSubmit}
      className={cn('flex flex-col gap-3.5', className)}
    >
      <label className="text-site-text-2 flex items-start gap-2.5 text-[13px] leading-normal">
        <input
          type="checkbox"
          name="consent"
          required
          className="accent-site-accent m-0 size-[22px] flex-none"
        />
        {consent}
      </label>
      <BuyButton type="submit">
        {buttonLabel ?? <>I’ll take it, {price}</>}
      </BuyButton>
    </form>
  );
}

/** The featured pack: big picture, title, what's in it, price and buy. */
export function FeaturedPack({
  title,
  detail,
  price,
  image,
  action,
  headingAs: Heading = 'h2',
  className,
}: {
  title: string;
  detail?: ReactNode;
  price: string;
  image?: string | null;
  /** The buy control; defaults to an "I'll take it" pill that does nothing. */
  action?: ReactNode;
  headingAs?: 'h2' | 'h3' | 'p';
  className?: string;
}) {
  return (
    <article
      className={cn(
        'bg-site-surface text-site-text rounded-site flex flex-col gap-2 p-3.5',
        className
      )}
    >
      <Thumb
        src={image}
        className="h-[110px] w-full rounded-[calc(var(--site-radius)*0.75)]"
      />
      <Heading className="m-0 text-lg font-bold">{title}</Heading>
      {detail ? (
        <p className="text-site-text-2 m-0 text-[13px]">{detail}</p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xl font-bold tabular-nums">{price}</span>
        {action ?? (
          <span className={siteButtonClasses({ size: 'sm' })}>
            I’ll take it
          </span>
        )}
      </div>
    </article>
  );
}

/** Smaller packs, two to a row. */
export function PackGrid({
  packs,
  className,
}: {
  packs: {
    title: string;
    price: string;
    image?: string | null;
    href?: string;
  }[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'm-0 grid list-none grid-cols-2 gap-2.5 p-0 text-[13px]',
        className
      )}
    >
      {packs.map((pack, i) => {
        const body = (
          <>
            <Thumb
              src={pack.image}
              className="h-[60px] w-full rounded-[calc(var(--site-radius)*0.6)]"
            />
            <strong>{pack.title}</strong>
            <span className="tabular-nums">{pack.price}</span>
          </>
        );
        const classes =
          'bg-site-surface text-site-text rounded-site flex h-full flex-col gap-1.5 p-2.5 no-underline';
        return (
          <li key={`${i}-${pack.title}`} className="m-0">
            {pack.href ? (
              <a href={pack.href} className={classes}>
                {body}
              </a>
            ) : (
              <div className={classes}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
