import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { LinkTile, type LinkTileStyle } from '../molecules/link-tile';
import type { ImageSrc } from '../system/image';
import { usePageWords } from '../system/page-words';

/** One link in a list. */
export type LinkItem = LinkBehavior & {
  label: string;
  href: string;
  icon?: ReactNode;
  /** A small picture on the start side, in place of the icon. */
  image?: string | null;
  imageAlt?: string;
  detail?: ReactNode;
  /** A price, or `arrow` for a round arrow. */
  trailing?: ReactNode | 'arrow';
};

/**
 * A column of links, as on a link-in-bio page. On a tablet and desktop it
 * can show two or three to a row. Sits on the page by default (tone plain);
 * each link is a tile in `tileStyle`.
 */
export function LinkList({
  links,
  label: labelProp,
  tileStyle = 'filled',
  tileAlign = 'start',
  columns = 1,
  ...root
}: BlockRootProps & {
  links: LinkItem[];
  /** Accessible name for the list. */
  label?: string;
  tileStyle?: LinkTileStyle;
  tileAlign?: 'start' | 'center';
  /** Links to a row from a tablet up. */
  columns?: 1 | 2 | 3;
}) {
  const own = usePageWords('props');
  const label = labelProp === undefined ? own.links : labelProp;
  return (
    <Block
      as="nav"
      name="link-list"
      aria-label={label}
      defaults={{ tone: 'plain' }}
      {...root}
    >
      <ul
        className={cn(
          'm-0 grid list-none gap-2.5 p-0',
          columns === 2 && 'md:grid-cols-2',
          columns === 3 && 'md:grid-cols-3'
        )}
      >
        {links.map(({ label: text, href, ...link }, i) => (
          <li key={`${i}-${href}`} className="m-0">
            <LinkTile
              href={href}
              tileStyle={tileStyle}
              align={tileAlign}
              {...link}
            >
              {text}
            </LinkTile>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/**
 * A link shown big: a picture over its title, for the one link a creator
 * wants seen first (a new video, a launch).
 */
export function FeaturedLink({
  href,
  title,
  detail,
  image,
  imageAlt = '',
  ratio = 'video',
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior & {
    href: string;
    title: string;
    detail?: ReactNode;
    image?: ImageSrc | null;
    /** Leave empty when the picture only repeats the title. */
    imageAlt?: string;
    ratio?: ThumbRatio;
  }) {
  return (
    <Block
      name="featured-link"
      defaults={{ tone: 'surface' }}
      data-lift=""
      {...root}
      className={cn('overflow-hidden p-0', root.className)}
    >
      <SiteLink
        href={href}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
        action="link_click"
        className="text-site-text flex flex-col no-underline"
      >
        <Thumb
          src={image}
          alt={imageAlt}
          ratio={ratio}
          className="w-full rounded-none"
        />
        <span className="p-block flex flex-col gap-0.5">
          <span className="font-semibold">{title}</span>
          {detail ? (
            <span className="text-site-text-2 text-sm">{detail}</span>
          ) : null}
        </span>
      </SiteLink>
    </Block>
  );
}

/** A row of icon links to the creator's social accounts. */
export function SocialIcons({
  links,
  label: labelProp,
  iconStyle = 'plain',
  ...root
}: BlockRootProps & {
  /** `label` names each link for screen readers, as "Instagram". */
  links: (LinkBehavior & { label: string; href: string; icon: ReactNode })[];
  label?: string;
  /**
   * `filled` puts each icon on a round tile, `outline` in a ring, and `chip`
   * on a round chip in the card colour with a thin line.
   */
  iconStyle?: 'plain' | 'filled' | 'outline' | 'chip';
}) {
  const own = usePageWords('props');
  const label = labelProp === undefined ? own.socialAccounts : labelProp;
  return (
    <Block
      as="nav"
      name="social-icons"
      aria-label={label}
      defaults={{ tone: 'plain', align: 'center' }}
      {...root}
    >
      <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
        {links.map(({ label: name, href, icon, ...link }, i) => (
          <li key={`${i}-${href}`} className="m-0">
            <SiteLink
              href={href}
              aria-label={name}
              title={name}
              action="social_click"
              data-lift=""
              {...link}
              className={cn(
                'text-site-text size-control-md inline-flex items-center justify-center rounded-full',
                iconStyle === 'plain' && 'hover:bg-site-surface-2',
                iconStyle === 'filled' && 'bg-site-surface-2',
                iconStyle === 'outline' && 'border-site-border border-2',
                iconStyle === 'chip' &&
                  'bg-site-surface border-site-border hover:bg-site-surface-2 border'
              )}
            >
              {icon}
            </SiteLink>
          </li>
        ))}
      </ul>
    </Block>
  );
}
