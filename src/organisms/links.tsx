import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import { editable, editPath, editPaths } from '../system/edit';
import type { LinkBehavior } from '../system/href';
import {
  LinkTile,
  type LinkTileLook,
  type LinkTileStyle,
  type LinkTileVariant,
} from '../molecules/link-tile';
import type { ImageSrc } from '../system/image';
import { usePageWords } from '../system/page-words';

/** One link in a list. */
export type LinkItem = LinkBehavior & {
  label: string;
  href: string;
  icon?: ReactNode;
  /** A small picture on the start side, in place of the icon. */
  image?: ImageSrc | null;
  imageAlt?: string;
  /** The site's small icon, for the list's `look` favicon or preview. */
  favicon?: ImageSrc | null;
  /** The link's brand colour, as "#ff0000", for chips and square tiles. */
  tint?: string;
  detail?: ReactNode;
  /** A price, or `arrow` for a round arrow. */
  trailing?: ReactNode | 'arrow';
};

/**
 * A column of links, as on a link-in-bio page. On a tablet and desktop it
 * can show two or three to a row. Sits on the page by default (tone plain);
 * each link is a tile in `tileStyle`.
 *
 * `variant` icon shows square logo tiles, two to a row (three from a tablet
 * with `columns` 3); `variant` chip shows small tinted chips, four to a row.
 * `look` picks what every link shows of its site (see LinkTileLook).
 */
export function LinkList({
  links,
  label: labelProp,
  tileStyle = 'filled',
  tileAlign = 'start',
  columns = 1,
  variant = 'row',
  look,
  ...root
}: BlockRootProps & {
  links: LinkItem[];
  /** Accessible name for the list. */
  label?: string;
  tileStyle?: LinkTileStyle;
  tileAlign?: 'start' | 'center';
  /** Links to a row from a tablet up. Rows and square tiles. */
  columns?: 1 | 2 | 3;
  variant?: LinkTileVariant;
  look?: LinkTileLook;
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
        data-variant={variant}
        className={cn(
          'm-0 grid list-none gap-2.5 p-0',
          variant === 'chip'
            ? 'grid-cols-4 gap-2'
            : variant === 'icon'
              ? cn('grid-cols-2', columns === 3 && 'md:grid-cols-3')
              : cn(
                  columns === 2 && 'md:grid-cols-2',
                  columns === 3 && 'md:grid-cols-3'
                )
        )}
      >
        {links.map(({ label: text, href, detail, trailing, ...link }, i) => (
          <li key={`${i}-${href}`} className="m-0 min-w-0">
            <LinkTile
              href={href}
              tileStyle={tileStyle}
              align={tileAlign}
              variant={variant}
              look={look}
              {...link}
              detail={
                detail ? (
                  <span {...editable(editPath('links', i, 'detail'))}>
                    {detail}
                  </span>
                ) : (
                  detail
                )
              }
              trailing={
                trailing && trailing !== 'arrow' ? (
                  <span {...editable(editPath('links', i, 'trailing'))}>
                    {trailing}
                  </span>
                ) : (
                  trailing
                )
              }
              edit={editPaths(editPath('links', i), [
                'href',
                'image',
                'favicon',
              ])}
            >
              <span {...editable(editPath('links', i, 'label'))}>{text}</span>
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
        {...editable('href', 'link')}
        className="text-site-text flex flex-col no-underline"
      >
        <Thumb
          src={image}
          alt={imageAlt}
          ratio={ratio}
          className="w-full rounded-none"
          marks={editable('image', 'picture')}
        />
        <span className="p-block flex flex-col gap-0.5">
          <span {...editable('title')} className="font-semibold">
            {title}
          </span>
          {detail ? (
            <span
              {...editable('detail', 'longText')}
              className="text-site-text-2 text-sm"
            >
              {detail}
            </span>
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
              {...editable(editPath('links', i, 'href'), 'link')}
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
