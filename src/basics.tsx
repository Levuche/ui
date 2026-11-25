import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { cn } from './cn';

export type SiteButtonVariant = 'solid' | 'outline' | 'soft' | 'text';
export type SiteButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<SiteButtonVariant, string> = {
  solid: 'bg-site-accent text-site-on-accent border-2 border-transparent',
  outline: 'border-site-accent text-site-link border-2 bg-transparent',
  soft: 'bg-site-surface-2 text-site-text border-2 border-transparent',
  text: 'text-site-link border-2 border-transparent bg-transparent underline-offset-4 hover:underline',
};

const sizes: Record<SiteButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-12 px-5 text-[15px]',
  lg: 'min-h-[52px] px-6 text-base',
};

/**
 * The classes for a button or a link that looks like one, in the creator's
 * colours and button shape. Every size is at least 44 px tall to tap.
 */
export function siteButtonClasses({
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    'rounded-site-button inline-flex cursor-pointer items-center justify-center gap-2 font-[inherit] font-bold no-underline transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );
}

type ButtonLook = {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
};

/** A button on a creator's page. */
export function SiteButton({
  variant,
  size,
  fullWidth,
  icon,
  className,
  type = 'button',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonLook) {
  return (
    <button
      type={type}
      className={siteButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * A link that looks like a button, such as "Shop my presets" or "Book a
 * call". Links to other sites open in a new tab.
 */
export function SiteLinkButton({
  variant,
  size,
  fullWidth,
  icon,
  className,
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & ButtonLook & { href: string }) {
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={siteButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {icon}
      {children}
    </a>
  );
}

/** A heading on a creator's page. */
export function SiteHeading({
  as: Tag = 'h2',
  size = 'md',
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };
  return (
    <Tag
      className={cn(
        'text-site-text m-0 leading-tight font-bold',
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

/** A paragraph on a creator's page. */
export function SiteText({
  muted = false,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return (
    <p
      className={cn(
        'm-0 text-[15px] leading-relaxed',
        muted ? 'text-site-text-2' : 'text-site-text',
        className
      )}
      {...props}
    />
  );
}

/** A block on the page with an optional heading above it. */
export function SiteSection({
  title,
  headingAs = 'h2',
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  headingAs?: 'h2' | 'h3';
}) {
  return (
    <section className={cn('flex flex-col gap-3', className)} {...props}>
      {title ? (
        <SiteHeading as={headingAs} size="sm">
          {title}
        </SiteHeading>
      ) : null}
      {children}
    </section>
  );
}

/** A thin line between blocks. */
export function SiteDivider({ className }: { className?: string }) {
  return (
    <hr className={cn('border-site-border m-0 border-0 border-t', className)} />
  );
}
