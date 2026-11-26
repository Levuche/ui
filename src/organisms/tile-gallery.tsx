import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { Thumb } from '../atoms/thumb';
import { TileCaption, UNDER_CAPTION } from '../molecules/tile-caption';
import {
  VideoFrame,
  type VideoLabels,
  type VideoTrack,
} from '../molecules/video-frame';
import { cn } from '../system/cn';
import {
  isOverCaption,
  type CaptionStyle,
  type GallerySpan,
} from '../system/gallery';
import { isSafeMediaSrc, type LinkBehavior } from '../system/href';
import { columnSizes, type ImageSrc } from '../system/image';

/** One tile in a TileGallery: a picture, or a video the creator uploaded. */
export type GalleryItem = LinkBehavior & {
  /** The picture; for a video, its cover (left empty: its first frame). */
  src?: ImageSrc | null;
  /** What the picture or video shows; it also names the link. */
  alt: string;
  /** A video file (mp4, mov or webm), which makes this a video tile. */
  video?: string;
  /** Play the video without sound, round and round, while on the screen. */
  loop?: boolean;
  /** Captions or subtitles for the video, as WebVTT files. */
  tracks?: VideoTrack[];
  /** How much of the gallery the tile takes. */
  span?: GallerySpan;
  caption?: string;
  /** Where a picture leads. A video plays in place instead. */
  href?: string;
};

const SPANS: Record<GallerySpan, string> = {
  '1x1': '',
  '2x1': 'col-span-2',
  '1x2': 'row-span-2',
  '2x2': 'col-span-2 row-span-2',
};

/* Columns from a container 448 px wide; two on anything narrower. */
const COLUMNS = {
  2: '@md:grid-cols-2 @md:[--cols:2]',
  3: '@md:grid-cols-3 @md:[--cols:3]',
  4: '@md:grid-cols-4 @md:[--cols:4]',
} as const;

/** The gap between tiles: gap-2. */
const GAP = '0.5rem';

/**
 * Pictures and videos in a grid of square cells, each tile one cell or
 * bigger (`span`): two cells wide, two tall, or a big square of four. Two
 * columns on a phone or in a narrow spot, `columns` from 448 px up. Captions
 * sit on the tiles as a small label or a frosted bar, or under them.
 *
 * Tiles keep the order they're given in, so the order a keyboard moves
 * through them matches the order on the screen; put a big tile where it
 * leaves no gap.
 */
export function TileGallery({
  items,
  columns = 3,
  captionStyle = 'chip',
  title,
  labels,
  ...root
}: BlockRootProps & {
  items: GalleryItem[];
  /** Columns on a tablet or desktop. Two on a phone. */
  columns?: 2 | 3 | 4;
  /** Where captions sit: a label or a bar over the tile, or under it. */
  captionStyle?: CaptionStyle;
  title?: ReactNode;
  /** The words on the video buttons. */
  labels?: Partial<VideoLabels>;
}) {
  const over = isOverCaption(captionStyle);
  return (
    <Block name="tile-gallery" defaults={{ tone: 'plain' }} {...root}>
      {title ? <p className="text-block-title m-0 font-bold">{title}</p> : null}
      <div className="@container">
        <ul
          className={cn(
            'm-0 grid list-none grid-cols-2 gap-2 p-0 [--cols:2]',
            COLUMNS[columns] ?? COLUMNS[3]
          )}
          // Square cells: a row is as tall as a column is wide.
          style={{
            gridAutoRows: `calc((100cqi - (var(--cols) - 1) * ${GAP}) / var(--cols))`,
          }}
        >
          {items.map((item, i) => {
            const span = SPANS[item.span ?? '1x1'] ?? '';
            const wide = item.span === '2x1' || item.span === '2x2' ? 2 : 1;
            if (item.video && isSafeMediaSrc(item.video, 'video')) {
              return (
                <li
                  key={`${i}-${item.alt}`}
                  className={cn('m-0 min-w-0', span)}
                >
                  <VideoFrame
                    src={item.video}
                    title={item.alt}
                    poster={item.src}
                    loop={item.loop}
                    tracks={item.tracks}
                    caption={item.caption}
                    captionStyle={captionStyle}
                    labels={labels}
                  />
                </li>
              );
            }
            const picture = (
              <Thumb
                src={item.src}
                alt={item.alt}
                sizes={columnSizes(wide / columns, wide / 2)}
                className={cn('size-full', !item.href && UNDER_CAPTION)}
              />
            );
            return (
              <li key={`${i}-${item.alt}`} className={cn('m-0 min-w-0', span)}>
                <figure
                  className={cn(
                    'm-0 grid h-full grid-cols-1 gap-2',
                    item.caption && !over
                      ? 'grid-rows-[minmax(0,1fr)_auto]'
                      : 'grid-rows-1'
                  )}
                >
                  {item.href ? (
                    <SiteLink
                      href={item.href}
                      newTab={item.newTab}
                      sponsored={item.sponsored}
                      nofollow={item.nofollow}
                      action="image_click"
                      className={cn('block min-h-0', UNDER_CAPTION)}
                    >
                      {picture}
                    </SiteLink>
                  ) : (
                    picture
                  )}
                  {item.caption ? (
                    <TileCaption captionStyle={captionStyle}>
                      {item.caption}
                    </TileCaption>
                  ) : null}
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </Block>
  );
}
