import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { Spinner } from './icons';
import { SiteLink } from './link';

export type SiteButtonVariant = 'solid' | 'outline' | 'soft' | 'text';
export type SiteButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<SiteButtonVariant, string> = {
  solid: 'bg-site-button text-site-on-button border-2 border-transparent',
  outline: 'border-site-button text-site-link border-2 bg-transparent',
  soft: 'bg-site-surface-2 text-site-text border-2 border-transparent',
  text: 'text-site-link border-2 border-transparent bg-transparent underline-offset-4 hover:underline',
};

const sizes: Record<SiteButtonSize, string> = {
  sm: 'min-h-control px-4 text-sm',
  md: 'min-h-control-md px-5 text-sm',
  lg: 'min-h-control-lg px-6 text-base',
};

/** How a button looks. */
export type ButtonLook = {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  fullWidth?: boolean;
  /** An icon before the words. */
  icon?: ReactNode;
  /** An icon after the words, such as an arrow. */
  iconEnd?: ReactNode;
};

/**
 * The classes for a button or a link that looks like one, in the creator's
 * colours and button shape. Inside a block with a coloured tone, solid
 * buttons turn inside out so they still stand out. Heights come from the
 * control presets: 40 to 48 px with a mouse, 44 to 52 px on touch screens.
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
    'rounded-site-button inline-flex cursor-pointer items-center justify-center gap-2 font-[inherit] font-bold no-underline transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 aria-busy:cursor-progress motion-reduce:transition-none',
    variants[variant] ?? variants.solid,
    sizes[size] ?? sizes.md,
    fullWidth && 'w-full',
    className
  );
}

/**
 * A button on a creator's page. `loading` shows a spinner, keeps the words
 * and stops a second press, for a form that's sending.
 */
export function SiteButton({
  variant,
  size,
  fullWidth,
  icon,
  iconEnd,
  loading = false,
  action,
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonLook & {
    loading?: boolean;
    /** Names the press for analytics (see useBlockActions). */
    action?: string;
    ref?: Ref<HTMLButtonElement>;
  }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...(action ? { 'data-action': action } : {})}
      className={siteButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? <Spinner size={18} /> : icon}
      {children}
      {iconEnd}
    </button>
  );
}

/**
 * A link that looks like a button, such as "Shop my presets" or "Book a
 * call". Unsafe addresses show the words without a link; other sites open in
 * a new tab unless `newTab` says otherwise.
 */
export function SiteLinkButton({
  variant,
  size,
  fullWidth,
  icon,
  iconEnd,
  className,
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  ButtonLook &
  LinkBehavior & {
    href: string | null | undefined;
    action?: string;
    ref?: Ref<HTMLAnchorElement>;
  }) {
  return (
    <SiteLink
      className={siteButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {icon}
      {children}
      {iconEnd}
    </SiteLink>
  );
}
