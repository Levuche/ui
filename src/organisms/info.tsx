import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLinkButton, type SiteButtonVariant } from '../atoms/button';
import { ClockIcon, MapPinIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Thumb } from '../atoms/thumb';
import { CountUp, type NumberStyle } from '../molecules/count-up';
import { ItemHead, subHeading, type HeadingTag } from '../molecules/item-head';
import { PlayFrame } from '../molecules/play-frame';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import type { ImageSrc } from '../system/image';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import { OUTSIDE_SERVICES, type ConsentLabels } from '../system/privacy';

/* ---------------------------------------------------------------- StatsRow */

/** One big number in a StatsRow. */
export type Stat = {
  value: number;
  label: ReactNode;
  /** Before the number, such as "₹" or "+". */
  prefix?: ReactNode;
  /** After the number, such as "%" or "+". */
  suffix?: ReactNode;
  /** How the number is written, such as { notation: 'compact' } for "12K". */
  format?: NumberStyle;
};

const STAT_COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 @md:grid-cols-3',
  4: 'grid-cols-2 @md:grid-cols-4',
} as const;

/**
 * Two to four big numbers with what they count, such as followers, students
 * or orders. Each counts up once when it scrolls into view, unless the
 * visitor asks for less motion or `animate` is off.
 */
export function StatsRow({
  stats,
  title,
  columns,
  locale,
  animate = true,
  headingAs = 'h2',
  ...root
}: BlockRootProps & {
  stats: Stat[];
  title?: ReactNode;
  /** Defaults to the number of stats, up to 4. */
  columns?: 2 | 3 | 4;
  /** Such as "en-IN", for how numbers are written. */
  locale?: string;
  animate?: boolean;
  headingAs?: HeadingTag;
}) {
  const cols = columns ?? (Math.min(4, Math.max(2, stats.length)) as 2 | 3 | 4);
  return (
    <Block name="stats-row" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <dl className={cn('@container m-0 grid gap-4', STAT_COLUMNS[cols])}>
        {stats.map((stat, n) => (
          <div key={n} className="flex flex-col-reverse gap-1 text-center">
            <dt className="text-site-text-2 text-sm">{stat.label}</dt>
            <dd className="text-block-title m-0 font-bold">
              {stat.prefix}
              <CountUp
                value={stat.value}
                locale={locale}
                format={stat.format}
                animate={animate}
              />
              {stat.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </Block>
  );
}

/* ---------------------------------------------------------------- Timeline */

/** One milestone on a Timeline. */
export type TimelineItem = {
  /** As the visitor reads it, such as "2021" or "March 2024". */
  date: ReactNode;
  /** The same date for machines, such as "2024-03", when there is one. */
  dateTime?: string;
  title: ReactNode;
  detail?: ReactNode;
  /** Makes the title a link. */
  href?: string;
} & LinkBehavior;

/**
 * Dated milestones, newest or oldest first as given: a career, a brand's
 * story or a course's path. A line joins the dots.
 */
export function Timeline({
  items,
  title,
  headingAs = 'h2',
  ...root
}: BlockRootProps & {
  items: TimelineItem[];
  title?: ReactNode;
  headingAs?: HeadingTag;
}) {
  const ItemHeading = subHeading(headingAs);
  return (
    <Block name="timeline" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <ol className="m-0 flex list-none flex-col p-0">
        {items.map((item, n) => (
          <li
            key={n}
            className="border-site-border relative ms-2 border-s-2 ps-6 pb-6 last:border-transparent last:pb-0"
          >
            <span
              aria-hidden
              className="bg-site-button border-site-surface absolute -start-[0.5625rem] top-1 size-4 rounded-full border-2"
            />
            <time
              dateTime={item.dateTime}
              className="text-site-text-2 block text-sm font-semibold"
            >
              {item.date}
            </time>
            <ItemHeading className="m-0 text-base font-bold">
              {item.href ? (
                <SiteLink
                  href={item.href}
                  newTab={item.newTab}
                  sponsored={item.sponsored}
                  nofollow={item.nofollow}
                  action="timeline_click"
                >
                  {item.title}
                </SiteLink>
              ) : (
                item.title
              )}
            </ItemHeading>
            {item.detail ? (
              <p className="text-site-text-2 m-0 mt-1">{item.detail}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </Block>
  );
}

/* ----------------------------------------------------------------- MapCard */

export type MapCardLabels = {
  /** The button that loads the map. {place} is filled in. */
  showMap: string;
  /** The map's name for screen readers. {place} is filled in. */
  map: string;
  directions: string;
  hours: string;
};

export const MAP_CARD_LABELS: MapCardLabels = WORDS_EN.mapCard;

/** A day or days and when the place is open, such as Mon–Fri, 10 am–7 pm. */
export type OpeningHours = { days: ReactNode; time: ReactNode };

const fill = (text: string, place: string) => text.replace('{place}', place);

/** An OpenStreetMap embed around a point, with a pin. Needs no key. */
export function mapEmbedUrl(lat: number, lng: number, zoom = 0.006) {
  const box = [lng - zoom, lat - zoom * 0.6, lng + zoom, lat + zoom * 0.6]
    .map((n) => n.toFixed(5))
    .join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`;
}

/** How the map looks: the usual map, a pale or a dark one, or from above. */
export type MapStyle = 'standard' | 'light' | 'dark' | 'satellite';

/** The site a map in this style loads from. */
export function mapService(style?: MapStyle) {
  return style === 'satellite' ? 'googlemaps' : 'openstreetmap';
}

/**
 * The map's address for a style. The street map comes from OpenStreetMap;
 * the view from above from Google Maps, as OpenStreetMap has none. Neither
 * needs a key.
 */
export function mapFrameUrl(lat: number, lng: number, style?: MapStyle) {
  if (style === 'satellite') {
    return `https://maps.google.com/maps?q=${lat.toFixed(5)},${lng.toFixed(5)}&t=k&z=17&output=embed`;
  }
  return mapEmbedUrl(lat, lng);
}

/*
 * The light and dark maps are the street map, toned down or turned over, so
 * they need no other map site. Only the loaded map is changed, never the
 * picture of the place before it.
 */
const MAP_STYLE_CLASSES: Record<MapStyle, string | undefined> = {
  standard: undefined,
  light: 'grayscale contrast-90 brightness-105',
  // Turned over first, then dimmed, so the land ends up dark grey.
  dark: '[filter:invert(1)_hue-rotate(180deg)_grayscale(0.3)_brightness(0.9)]',
  satellite: undefined,
};

/** A directions link that opens the visitor's maps app or site. */
export function directionsUrl(place: {
  lat?: number;
  lng?: number;
  address?: string;
}) {
  const to =
    Number.isFinite(place.lat) && Number.isFinite(place.lng)
      ? `${place.lat},${place.lng}`
      : (place.address ?? '');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(to)}`;
}

/**
 * A shop, studio or venue: its name, address, opening hours and a directions
 * button. The map is a picture and a button until the visitor taps it, so the
 * page stays fast and the map site sets no cookies before then.
 */
export function MapCard({
  place,
  address,
  lat,
  lng,
  hours,
  image,
  directionsHref,
  showMap = true,
  mapStyle = 'standard',
  mapCaption,
  labels,
  consent,
  consentLabels,
  buttonVariant,
  headingAs = 'h3',
  children,
  ...root
}: BlockRootProps & {
  place: string;
  address?: ReactNode;
  /** Where the pin goes. Without them there's no map, only the address. */
  lat?: number;
  lng?: number;
  hours?: OpeningHours[];
  /** A picture of the place: until the map loads, or on its own with no map. */
  image?: ImageSrc | null;
  /** Your own directions link. Built from the pin or address if left out. */
  directionsHref?: string;
  showMap?: boolean;
  /** `light` and `dark` tone the street map down; `satellite` shows it from above. */
  mapStyle?: MapStyle;
  /** A short line laid over the map's corner, such as "Upstairs, blue door". */
  mapCaption?: ReactNode;
  labels?: Partial<MapCardLabels>;
  /**
   * Whether the visitor agreed to the map's site (OpenStreetMap, or Google
   * Maps for `satellite`), from the page's cookie notice. False shows a notice and a Load button in place of the map's
   * button; leave it out on pages that don't ask.
   */
  consent?: boolean;
  consentLabels?: Partial<ConsentLabels>;
  buttonVariant?: SiteButtonVariant;
  headingAs?: HeadingTag;
  /** More, under the hours, such as a phone number. */
  children?: ReactNode;
}) {
  const words = usePageWords('mapCard', labels);
  const hasPin =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  // A cleared field can be saved as an empty string: build the link then.
  const directions =
    directionsHref?.trim() ||
    directionsUrl({
      lat,
      lng,
      address: typeof address === 'string' ? address : place,
    });
  return (
    <Block name="map-card" {...root}>
      {showMap && hasPin ? (
        <div className="relative" data-map-style={mapStyle}>
          <PlayFrame
            src={mapFrameUrl(lat, lng, mapStyle)}
            title={fill(words.map, place)}
            playLabel={fill(words.showMap, place)}
            poster={image}
            playIcon={<MapPinIcon size={28} />}
            action="map_load"
            allow=""
            frameClassName={MAP_STYLE_CLASSES[mapStyle]}
            consent={consent}
            site={OUTSIDE_SERVICES[mapService(mapStyle)].name}
            consentLabels={consentLabels}
          />
          {mapCaption ? (
            // Over the map's corner; taps go through to the map under it.
            <p className="bg-site-surface text-site-text rounded-block-inner pointer-events-none absolute start-2 bottom-2 m-0 max-w-[calc(100%-1rem)] px-2.5 py-1 text-sm font-semibold shadow-md">
              {mapCaption}
            </p>
          ) : null}
        </div>
      ) : image !== undefined && image !== null ? (
        // No map to load: the picture of the place on its own.
        <Thumb src={image} ratio="video" className="w-full" />
      ) : null}
      <ItemHead title={place} headingAs={headingAs} />
      {address ? (
        <address className="text-site-text-2 flex gap-2 not-italic">
          <MapPinIcon size={18} className="mt-0.5 flex-none" />
          <span>{address}</span>
        </address>
      ) : null}
      {hours?.length ? (
        <div className="flex gap-2">
          <ClockIcon size={18} className="text-site-text-2 mt-0.5 flex-none" />
          <dl
            aria-label={words.hours}
            className="m-0 grid flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm"
          >
            {hours.map((row, n) => (
              <div key={n} className="contents">
                <dt className="font-semibold">{row.days}</dt>
                <dd className="text-site-text-2 m-0">{row.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {children}
      <SiteLinkButton
        href={directions}
        newTab
        variant={buttonVariant}
        action="directions"
        fullWidth
      >
        {words.directions}
      </SiteLinkButton>
    </Block>
  );
}
