import type { HTMLAttributes, Ref } from 'react';
import { cn } from '../system/cn';

/** A heading on a creator's page. `block` follows the block's title size. */
export function SiteHeading({
  as: Tag = 'h2',
  size = 'md',
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  size?: 'sm' | 'md' | 'lg' | 'block';
  ref?: Ref<HTMLHeadingElement>;
}) {
  const sizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    block: 'text-block-title',
  };
  return (
    <Tag
      className={cn(
        'text-site-text m-0 leading-tight font-bold',
        sizes[size] ?? sizes.md,
        className
      )}
      {...props}
    />
  );
}

/** A paragraph on a creator's page. `muted` is the quieter second colour. */
export function SiteText({
  muted = false,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  muted?: boolean;
  ref?: Ref<HTMLParagraphElement>;
}) {
  return (
    <p
      className={cn(
        'm-0 leading-relaxed',
        muted ? 'text-site-text-2' : 'text-site-text',
        className
      )}
      {...props}
    />
  );
}

/** A small line above a title, such as "Free" or "New". */
export function Eyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-site-link m-0 text-xs font-bold tracking-wide uppercase',
        className
      )}
      {...props}
    />
  );
}

/** A thin line between blocks. */
export function SiteDivider({
  className,
  ...props
}: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn('border-site-border m-0 border-0 border-t', className)}
      {...props}
    />
  );
}

/** A short label in a pill, such as "Live", "New" or "Sold out". */
export function Badge({
  tone = 'soft',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'soft' | 'solid' | 'outline';
}) {
  const tones = {
    soft: 'bg-site-surface-2 text-site-text',
    solid: 'bg-site-button text-site-on-button',
    outline: 'border-site-border text-site-text border',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
        tones[tone] ?? tones.soft,
        className
      )}
      {...props}
    />
  );
}

/**
 * A small tilted label over a card's top corner, such as "Most popular". The
 * card needs `relative` (the blocks that take a `ribbon` prop set it). It
 * tilts the other way in right-to-left text, so it always leans off the
 * corner.
 */
export function Ribbon({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'bg-site-notice text-site-on-notice absolute -end-2 -top-2.5 z-10 rotate-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm rtl:-rotate-3',
        className
      )}
      {...props}
    />
  );
}
