import type {
  AnchorHTMLAttributes,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import { ArrowRightIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Thumb } from '../atoms/thumb';
import { cn } from '../system/cn';
import { editable, type EditPaths } from '../system/edit';
import type { LinkBehavior } from '../system/href';
import { cssImageUrl, type ImageSrc } from '../system/image';
import { isSafeColor } from '../system/theme';

/** How a link tile looks. */
export type LinkTileStyle = 'filled' | 'outline' | 'soft' | 'plain';

/**
 * The shape of a link tile:
 *
 * - row: a full-width row, the words beside a small icon or picture
 * - icon: a square tile with a big logo or picture, and a small arrow badge
 *   in the corner
 * - chip: a small tile, four to a row, tinted in the link's brand colour
 */
export const LINK_TILE_VARIANTS = ['row', 'icon', 'chip'] as const;
export type LinkTileVariant = (typeof LINK_TILE_VARIANTS)[number];

/**
 * What a link tile shows of the site it links to. The app reads the site's
 * preview picture and icon from its address and passes them in as `image`
 * and `favicon`; the tile never fetches anything itself.
 *
 * - preview: the site's preview picture (or its icon when there's none)
 * - favicon: only the site's small icon (or `icon` when there's none)
 * - text: words only
 *
 * Left out, the tile shows `image` or `icon` as given.
 */
export const LINK_TILE_LOOKS = ['preview', 'favicon', 'text'] as const;
export type LinkTileLook = (typeof LINK_TILE_LOOKS)[number];

const TILE_STYLES: Record<LinkTileStyle, string> = {
  filled: 'bg-site-surface text-site-text',
  outline: 'border-site-border text-site-text border-2',
  soft: 'bg-site-surface-2 text-site-text',
  plain: 'text-site-text',
};

/** A light wash of the brand colour (or the accent) over the card colour. */
const TINTED =
  'text-site-text bg-[color-mix(in_oklab,var(--tile-tint,var(--site-accent))_14%,var(--site-surface))]';

/**
 * A picture address the tile may show: http(s), the same site, or the
 * editor's local previews, as cssImageUrl allows. Anything else is dropped.
 */
function safePicture(src: ImageSrc | null | undefined) {
  return src && cssImageUrl(src) ? src : null;
}

/** The brand colour as a CSS variable, when it's a plain colour. */
function tintStyle(tint: string | undefined, style?: CSSProperties) {
  if (!tint || !isSafeColor(tint)) return style;
  return { ...style, '--tile-tint': tint.trim() } as CSSProperties;
}

/** What sits beside or above the words. */
type Mark =
  | { type: 'picture'; src: ImageSrc | null }
  | { type: 'favicon'; src: ImageSrc }
  | { type: 'icon' }
  | null;

/**
 * Picks what a tile shows from its look. With no look, `image` (even an
 * empty one, which keeps its space) or else `icon`. A preview with no
 * picture falls back to the site's icon; a favicon with no icon file falls
 * back to `icon`.
 */
function pickMark(
  look: LinkTileLook | undefined,
  image: ImageSrc | null | undefined,
  picture: ImageSrc | null,
  favicon: ImageSrc | null,
  icon: ReactNode
): Mark {
  if (look === 'text') return null;
  if (look === undefined) {
    if (image !== undefined) return { type: 'picture', src: picture };
    return icon ? { type: 'icon' } : null;
  }
  if (look === 'preview' && picture) return { type: 'picture', src: picture };
  if (favicon) return { type: 'favicon', src: favicon };
  return look === 'favicon' && icon ? { type: 'icon' } : null;
}

/** The small arrow in a square tile's corner: it says the tile goes somewhere. */
function ArrowBadge() {
  return (
    <span
      aria-hidden
      data-arrow-badge=""
      className="bg-site-surface text-site-text border-site-border absolute end-2 top-2 z-10 flex size-7 items-center justify-center rounded-full border"
    >
      <ArrowRightIcon
        size={14}
        className="-rotate-45 rtl:-scale-x-100 rtl:rotate-45"
      />
    </span>
  );
}

/**
 * One link on a creator's page, such as their YouTube channel or an app,
 * with an optional icon and a second line. The link is checked first, and
 * other sites open in a new tab unless `newTab` says otherwise.
 *
 * `variant` picks its shape (a row, a square logo tile or a small chip) and
 * `look` what it shows of the site: its preview picture, its icon or only
 * words.
 */
export function LinkTile({
  href,
  icon,
  image,
  imageAlt = '',
  favicon,
  detail,
  trailing,
  tileStyle = 'filled',
  align = 'start',
  variant = 'row',
  look,
  tint,
  action = 'link_click',
  edit = {},
  children,
  className,
  style,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  LinkBehavior & {
    href: string | null | undefined;
    icon?: ReactNode;
    /**
     * A picture: a small one on the start side of a row, the logo (or, with
     * `look` preview, the whole tile) on a square tile. With `look` preview,
     * the site's own preview picture.
     */
    image?: ImageSrc | null;
    /** Leave empty when the picture only repeats the words. */
    imageAlt?: string;
    /** The site's small icon, shown with `look` favicon or in place of a missing preview. */
    favicon?: ImageSrc | null;
    /** A second line, such as "New video every Friday". Rows only. */
    detail?: ReactNode;
    /**
     * Something at the far end, such as a price. `arrow` is a round arrow
     * that says the link goes somewhere. Rows only.
     */
    trailing?: ReactNode | 'arrow';
    /** Rows and square tiles; a chip is tinted instead. */
    tileStyle?: LinkTileStyle;
    /** `center` centres the words, as on many link pages. Rows only. */
    align?: 'start' | 'center';
    variant?: LinkTileVariant;
    look?: LinkTileLook;
    /**
     * The link's brand colour, as "#ff0000". A chip is washed with it (with
     * the accent when it's unset); a square tile only when it's set.
     */
    tint?: string;
    action?: string;
    /**
     * The setting paths of the link and its picture, for edit mode (see
     * edit.ts). Mark the words and `detail` where they're passed in.
     */
    edit?: EditPaths<'href' | 'image'>;
    ref?: Ref<HTMLAnchorElement>;
  }) {
  const shape: LinkTileVariant = LINK_TILE_VARIANTS.includes(variant)
    ? variant
    : 'row';
  const shows = look && LINK_TILE_LOOKS.includes(look) ? look : undefined;
  const picture = safePicture(image);
  const mark = pickMark(shows, image, picture, safePicture(favicon), icon);
  const tinted = shape === 'chip' || (shape === 'icon' && Boolean(tint));
  const link = {
    ...props,
    ...editable(edit.href, 'link'),
    href,
    action,
    'data-lift': '',
    'data-variant': shape,
    ...(shows ? { 'data-look': shows } : {}),
    style: tinted ? tintStyle(tint, style) : style,
  };
  const colours = tinted
    ? TINTED
    : (TILE_STYLES[tileStyle] ?? TILE_STYLES.filled);

  if (shape === 'chip') {
    return (
      <SiteLink
        {...link}
        className={cn(
          'rounded-block flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-1.5 py-2 text-center text-xs font-semibold no-underline hover:opacity-90',
          colours,
          className
        )}
      >
        {mark?.type === 'picture' ? (
          <Thumb
            src={mark.src}
            alt={imageAlt}
            marks={editable(edit.image, 'picture')}
            ratio="square"
            sizes="24px"
            className="size-6"
          />
        ) : mark?.type === 'favicon' ? (
          <Thumb
            src={mark.src}
            ratio="square"
            fit="contain"
            sizes="24px"
            className="size-6 rounded-none"
          />
        ) : mark ? (
          <span aria-hidden className="flex size-6 items-center justify-center">
            {icon}
          </span>
        ) : null}
        <span className="w-full truncate">{children}</span>
      </SiteLink>
    );
  }

  if (shape === 'icon') {
    // A preview picture fills the tile; any other picture is a logo.
    const cover = shows === 'preview' && mark?.type === 'picture';
    return (
      <SiteLink
        {...link}
        className={cn(
          'rounded-block relative flex aspect-square min-h-28 flex-col gap-2 overflow-hidden p-3 font-semibold no-underline hover:opacity-90',
          cover
            ? 'items-start justify-end'
            : 'items-center justify-center text-center',
          colours,
          className
        )}
      >
        {cover ? (
          <Thumb
            src={mark.src}
            alt={imageAlt}
            marks={editable(edit.image, 'picture')}
            sizes="(min-width: 768px) 288px, 50vw"
            className="absolute inset-0 size-full rounded-none"
          />
        ) : mark?.type === 'picture' ? (
          <Thumb
            src={mark.src}
            alt={imageAlt}
            marks={editable(edit.image, 'picture')}
            ratio="square"
            fit="contain"
            sizes="160px"
            className="w-3/5"
          />
        ) : mark?.type === 'favicon' ? (
          <Thumb
            src={mark.src}
            ratio="square"
            fit="contain"
            sizes="96px"
            className="w-2/5 rounded-none"
          />
        ) : mark ? (
          <span
            aria-hidden
            className="flex items-center justify-center [&_svg]:size-12"
          >
            {icon}
          </span>
        ) : null}
        <span
          className={cn(
            'max-w-full',
            cover
              ? 'bg-site-surface text-site-text relative z-10 truncate rounded-full px-2.5 py-1 text-sm'
              : mark
                ? 'line-clamp-2 text-sm'
                : 'line-clamp-3 text-lg'
          )}
        >
          {children}
        </span>
        <ArrowBadge />
      </SiteLink>
    );
  }

  // A row. A preview picture is wider than the small square one.
  const wide = shows === 'preview' && mark?.type === 'picture';
  const markSize =
    mark?.type === 'picture' ? (wide ? 'w-24' : 'size-12') : 'size-10';
  return (
    <SiteLink
      {...link}
      className={cn(
        'rounded-block flex min-h-14 items-center gap-3 p-3 font-semibold no-underline hover:opacity-90',
        colours,
        className
      )}
    >
      {mark?.type === 'picture' ? (
        <Thumb
          src={mark.src}
          alt={imageAlt}
          marks={editable(edit.image, 'picture')}
          ratio={wide ? 'video' : 'square'}
          sizes={wide ? '96px' : '48px'}
          className={cn('rounded-block-inner flex-none', markSize)}
        />
      ) : mark ? (
        <span
          aria-hidden
          className="bg-site-surface-2 rounded-block-inner flex size-10 flex-none items-center justify-center"
        >
          {mark.type === 'favicon' ? (
            <Thumb
              src={mark.src}
              ratio="square"
              fit="contain"
              sizes="24px"
              className="size-6 rounded-none"
            />
          ) : (
            icon
          )}
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
      {align === 'center' && mark && !trailing ? (
        <span aria-hidden className={cn('flex-none', markSize)} />
      ) : null}
    </SiteLink>
  );
}
