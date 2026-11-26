import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { AppIcon, PlayIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Thumb } from '../atoms/thumb';
import {
  LinkTile,
  type LinkTileLook,
  type LinkTileStyle,
} from '../molecules/link-tile';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { cssImageUrl, type ImageSrc } from '../system/image';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';

/*
 * Single links in their own shapes, each a block the creator places on the
 * grid by itself: a card that shows the linked site's preview, a square logo
 * tile, a small chip, and badges for an app's store pages. The app reads a
 * site's preview picture and icon from its address and passes them in; none
 * of these fetch anything.
 */

/**
 * One link as a card that shows the site it goes to: its preview picture,
 * only its icon, or only words (`look`). Sits on the page by default (tone
 * plain), like a link in a list.
 */
export function LinkCard({
  href,
  title,
  detail,
  image,
  imageAlt = '',
  favicon,
  look = 'preview',
  tileStyle = 'filled',
  arrow = true,
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior & {
    href: string;
    title: string;
    /** A second line, such as the site's own description. */
    detail?: ReactNode;
    /** The site's preview picture. */
    image?: ImageSrc | null;
    /** Leave empty when the picture only repeats the title. */
    imageAlt?: string;
    /** The site's small icon. */
    favicon?: ImageSrc | null;
    look?: LinkTileLook;
    tileStyle?: LinkTileStyle;
    /** A round arrow at the end that says the link goes somewhere. */
    arrow?: boolean;
  }) {
  return (
    <Block name="link-card" defaults={{ tone: 'plain' }} {...root}>
      <LinkTile
        href={href}
        image={image}
        imageAlt={imageAlt}
        favicon={favicon}
        look={look}
        detail={detail}
        trailing={arrow ? 'arrow' : undefined}
        tileStyle={tileStyle}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
      >
        {title}
      </LinkTile>
    </Block>
  );
}

/**
 * One link as a square tile: a big logo or picture, the link's name under
 * it, and a small arrow badge in the corner. Two sit side by side on the
 * grid. `look` preview lets the picture fill the tile.
 */
export function LogoTile({
  href,
  title,
  image,
  imageAlt = '',
  favicon,
  icon,
  look,
  tileStyle = 'filled',
  tint,
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior & {
    href: string;
    title: string;
    /** The logo, or with `look` preview a picture that fills the tile. */
    image?: ImageSrc | null;
    /** Leave empty when the picture only repeats the title. */
    imageAlt?: string;
    /** The site's small icon, shown big with `look` favicon. */
    favicon?: ImageSrc | null;
    /** An icon from the app, when there's no picture. */
    icon?: ReactNode;
    /** Left out, `image` shows as a logo. */
    look?: LinkTileLook;
    tileStyle?: LinkTileStyle;
    /** The brand colour the tile is washed with, as "#ff0000". */
    tint?: string;
  }) {
  return (
    <Block name="logo-tile" defaults={{ tone: 'plain' }} {...root}>
      <LinkTile
        variant="icon"
        href={href}
        image={image}
        imageAlt={imageAlt}
        favicon={favicon}
        icon={icon}
        look={look}
        tileStyle={tileStyle}
        tint={tint}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
      >
        {title}
      </LinkTile>
    </Block>
  );
}

/**
 * One link as a small chip, tinted in its brand colour (the accent when
 * there's none): an icon over a short name. Four fit across a phone.
 */
export function LinkChip({
  href,
  title,
  image,
  imageAlt = '',
  favicon,
  icon,
  look,
  tint,
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior & {
    href: string;
    /** Short, as "Shop": a chip has room for a word or two. */
    title: string;
    image?: ImageSrc | null;
    /** Leave empty when the picture only repeats the title. */
    imageAlt?: string;
    /** The site's small icon, shown with `look` favicon. */
    favicon?: ImageSrc | null;
    /** An icon from the app, when there's no picture. */
    icon?: ReactNode;
    look?: LinkTileLook;
    /** The brand colour, as "#ff0000". */
    tint?: string;
  }) {
  return (
    <Block name="link-chip" defaults={{ tone: 'plain' }} {...root}>
      <LinkTile
        variant="chip"
        href={href}
        image={image}
        imageAlt={imageAlt}
        favicon={favicon}
        icon={icon}
        look={look}
        tint={tint}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
      >
        {title}
      </LinkTile>
    </Block>
  );
}

/** The app stores a badge can link to. */
export const APP_STORES = ['app-store', 'google-play'] as const;
export type AppStoreName = (typeof APP_STORES)[number];

export type AppBadgeLabels = {
  /** The list's name, for screen readers. */
  list: string;
  /** The small line over the store's name. */
  appStoreLead: string;
  appStore: string;
  googlePlayLead: string;
  googlePlay: string;
};

export const APP_BADGE_LABELS: AppBadgeLabels = WORDS_EN.appBadges;

/** One app store link. */
export type AppBadgeLink = LinkBehavior & {
  store: AppStoreName;
  /** The app's page in that store. */
  href: string;
  /**
   * The store's own badge picture, when the app has it. Without one, the
   * badge is drawn in the page's colours.
   */
  badge?: ImageSrc | null;
};

const STORE_WORDS: Record<
  AppStoreName,
  { lead: keyof AppBadgeLabels; name: keyof AppBadgeLabels; icon: ReactNode }
> = {
  'app-store': {
    lead: 'appStoreLead',
    name: 'appStore',
    icon: <AppIcon size={24} />,
  },
  'google-play': {
    lead: 'googlePlayLead',
    name: 'googlePlay',
    icon: <PlayIcon size={24} />,
  },
};

/**
 * Badges that link to an app's pages in the App Store and Google Play, side
 * by side. Each is drawn in the page's text colour, or shows the store's own
 * badge picture when the app passes one.
 */
export function AppBadges({
  apps,
  labels: given,
  ...root
}: BlockRootProps & {
  apps: AppBadgeLink[];
  labels?: Partial<AppBadgeLabels>;
}) {
  const labels = usePageWords('appBadges', given);
  return (
    <Block
      as="nav"
      name="app-badges"
      aria-label={labels.list}
      defaults={{ tone: 'plain' }}
      {...root}
    >
      <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
        {apps
          .filter((app) => APP_STORES.includes(app.store))
          .map(({ store, href, badge, ...link }, i) => {
            const words = STORE_WORDS[store];
            const lead = labels[words.lead];
            const name = labels[words.name];
            const picture = badge && cssImageUrl(badge) ? badge : null;
            return (
              <li key={`${i}-${store}`} className="m-0">
                <SiteLink
                  href={href}
                  action="app_store_click"
                  data-store={store}
                  data-lift=""
                  {...link}
                  className={cn(
                    'rounded-block inline-flex min-h-12 items-center no-underline hover:opacity-90',
                    picture
                      ? ''
                      : 'bg-site-text text-site-bg gap-2.5 py-1.5 ps-3 pe-4'
                  )}
                >
                  {picture ? (
                    <Thumb
                      src={picture}
                      alt={`${lead} ${name}`}
                      fit="contain"
                      sizes="180px"
                      className="h-12 w-auto rounded-none"
                    />
                  ) : (
                    <>
                      {words.icon}
                      <span className="flex flex-col text-start leading-tight">
                        <span className="text-xs">{lead}</span>{' '}
                        <span className="text-lg font-semibold">{name}</span>
                      </span>
                    </>
                  )}
                </SiteLink>
              </li>
            );
          })}
      </ul>
    </Block>
  );
}
