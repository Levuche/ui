import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { ArrowRightIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Thumb } from '../atoms/thumb';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';

/** How a link tile looks. */
export type LinkTileStyle = 'filled' | 'outline' | 'soft' | 'plain';

const TILE_STYLES: Record<LinkTileStyle, string> = {
  filled: 'bg-site-surface text-site-text',
  outline: 'border-site-border text-site-text border-2',
  soft: 'bg-site-surface-2 text-site-text',
  plain: 'text-site-text',
};

/**
 * One link on a creator's page, such as their YouTube channel or an app,
 * with an optional icon and a second line. The link is checked first, and
 * other sites open in a new tab unless `newTab` says otherwise.
 */
export function LinkTile({
  href,
  icon,
  image,
  imageAlt = '',
  detail,
  trailing,
  tileStyle = 'filled',
  align = 'start',
  action = 'link_click',
  children,
  className,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  LinkBehavior & {
    href: string | null | undefined;
    icon?: ReactNode;
    /** A small picture on the start side, such as a cover, in place of the icon. */
    image?: string | null;
    /** Leave empty when the picture only repeats the words. */
    imageAlt?: string;
    /** A second line, such as "New video every Friday". */
    detail?: ReactNode;
    /**
     * Something at the far end, such as a price. `arrow` is a round arrow
     * that says the link goes somewhere.
     */
    trailing?: ReactNode | 'arrow';
    tileStyle?: LinkTileStyle;
    /** `center` centres the words, as on many link pages. */
    align?: 'start' | 'center';
    action?: string;
    ref?: Ref<HTMLAnchorElement>;
  }) {
  return (
    <SiteLink
      href={href}
      action={action}
      data-lift=""
      className={cn(
        'rounded-block flex min-h-14 items-center gap-3 p-3 font-semibold no-underline hover:opacity-90',
        TILE_STYLES[tileStyle] ?? TILE_STYLES.filled,
        className
      )}
      {...props}
    >
      {image !== undefined ? (
        <Thumb
          src={image}
          alt={imageAlt}
          ratio="square"
          className="rounded-block-inner size-12 flex-none"
        />
      ) : icon ? (
        <span
          aria-hidden
          className="bg-site-surface-2 rounded-block-inner flex size-10 flex-none items-center justify-center"
        >
          {icon}
        </span>
      ) : null}
      <span
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-0.5',
          align === 'center' && 'items-center text-center'
        )}
      >
        {children}
        {detail ? (
          <span className="text-site-text-2 text-sm font-normal">{detail}</span>
        ) : null}
      </span>
      {trailing === 'arrow' ? (
        <span
          aria-hidden
          className="bg-site-surface-2 flex size-8 flex-none items-center justify-center rounded-full"
        >
          <ArrowRightIcon size={16} className="rtl:-scale-x-100" />
        </span>
      ) : trailing ? (
        <span className="flex-none">{trailing}</span>
      ) : null}
      {/* Keeps centred words centred when there's an icon on one side. */}
      {align === 'center' && (icon || image !== undefined) && !trailing ? (
        <span
          aria-hidden
          className={cn(
            'flex-none',
            image !== undefined ? 'size-12' : 'size-10'
          )}
        />
      ) : null}
    </SiteLink>
  );
}
