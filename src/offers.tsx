import type { FormEventHandler, ReactNode } from 'react';
import { SiteButton, SiteLinkButton } from './basics';
import { cn } from './cn';
import { CheckIcon, ClockIcon } from './icons';
import { Thumb } from './thumb';

const card =
  'bg-site-surface text-site-text rounded-site flex flex-col gap-3 p-3.5';

/** A call or session to book: what it is, how long, the price and a link. */
export function BookingCard({
  title,
  detail,
  duration,
  price,
  href,
  buttonLabel = 'Book a call',
  image,
  headingAs: Heading = 'h3',
  className,
}: {
  title: string;
  detail?: ReactNode;
  /** As "30 min". */
  duration: string;
  /** As "$40" or "Free". */
  price: string;
  /** The booking page. */
  href: string;
  buttonLabel?: string;
  image?: string | null;
  headingAs?: 'h2' | 'h3' | 'p';
  className?: string;
}) {
  return (
    <article className={cn(card, className)}>
      <div className="flex items-start gap-3">
        {image !== undefined ? (
          <Thumb
            src={image}
            className="size-13 rounded-[calc(var(--site-radius)*0.75)]"
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading className="m-0 text-lg font-bold">{title}</Heading>
          {detail ? (
            <p className="text-site-text-2 m-0 text-sm">{detail}</p>
          ) : null}
        </div>
      </div>
      <p className="m-0 flex items-center justify-between gap-3 text-sm">
        <span className="text-site-text-2 inline-flex items-center gap-1.5">
          <ClockIcon size={16} />
          {duration}
        </span>
        <span className="text-base font-bold tabular-nums">{price}</span>
      </p>
      <SiteLinkButton href={href} fullWidth>
        {buttonLabel}
      </SiteLinkButton>
    </article>
  );
}

/** A membership tier: the price per period, what members get and a link. */
export function MembershipCard({
  title,
  price,
  period = 'month',
  perks,
  href,
  buttonLabel = 'Join',
  featured = false,
  headingAs: Heading = 'h3',
  className,
}: {
  title: string;
  price: string;
  /** Shown as "/ month". */
  period?: string;
  perks: ReactNode[];
  href: string;
  buttonLabel?: string;
  /** Outlines the tier in the accent colour, for the one to pick. */
  featured?: boolean;
  headingAs?: 'h2' | 'h3' | 'p';
  className?: string;
}) {
  return (
    <article
      className={cn(
        card,
        'border-2',
        featured ? 'border-site-accent' : 'border-transparent',
        className
      )}
    >
      <Heading className="m-0 text-lg font-bold">{title}</Heading>
      <p className="m-0">
        <span className="text-2xl font-bold tabular-nums">{price}</span>
        <span className="text-site-text-2 text-sm"> / {period}</span>
      </p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
        {perks.map((perk, i) => (
          <li key={i} className="m-0 flex items-start gap-2">
            <CheckIcon size={18} className="text-site-link mt-px flex-none" />
            <span>{perk}</span>
          </li>
        ))}
      </ul>
      <SiteLinkButton
        href={href}
        variant={featured ? 'solid' : 'outline'}
        fullWidth
      >
        {buttonLabel}
      </SiteLinkButton>
    </article>
  );
}

/**
 * Something free in return for an email address, such as a guide: the
 * visitor types their address and the creator's app sends it.
 */
export function LeadMagnet({
  title,
  detail,
  image,
  buttonLabel = 'Send it to me',
  placeholder = 'you@email.com',
  onSubmit,
  action,
  headingAs: Heading = 'h3',
  className,
}: {
  title: string;
  detail?: ReactNode;
  image?: string | null;
  buttonLabel?: string;
  placeholder?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string;
  headingAs?: 'h2' | 'h3' | 'p';
  className?: string;
}) {
  return (
    <article className={cn(card, className)}>
      {image !== undefined ? (
        <Thumb
          src={image}
          className="h-28 w-full rounded-[calc(var(--site-radius)*0.75)]"
        />
      ) : null}
      <div className="flex flex-col gap-1">
        <p className="text-site-link m-0 text-xs font-bold tracking-wide uppercase">
          Free
        </p>
        <Heading className="m-0 text-lg font-bold">{title}</Heading>
        {detail ? (
          <p className="text-site-text-2 m-0 text-sm">{detail}</p>
        ) : null}
      </div>
      <form
        action={action}
        method={action ? 'post' : undefined}
        onSubmit={onSubmit}
        className="flex flex-col gap-2"
      >
        {/* 16 px text on touch screens, so phones do not zoom in on focus. */}
        <input
          type="email"
          name="email"
          required
          aria-label="Email"
          autoComplete="email"
          placeholder={placeholder}
          className="bg-site-bg text-site-text border-site-border rounded-site-button min-h-control-md w-full min-w-0 border-2 px-3.5 font-[inherit] text-base pointer-fine:text-sm"
        />
        <SiteButton type="submit" fullWidth>
          {buttonLabel}
        </SiteButton>
      </form>
    </article>
  );
}
