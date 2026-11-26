import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { WORDS_EN } from '../system/words/en';
import { SiteLink } from '../atoms/link';
import { LogoMarquee } from '../molecules/logo-marquee';
import type { MotionToggleLabels } from '../molecules/motion-toggle';
import type { HeadingTag } from '../molecules/item-head';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { TileCaption, UNDER_CAPTION } from '../molecules/tile-caption';
import { isOverCaption, type CaptionStyle } from '../system/gallery';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { imageAttrs, toImageSource, type ImageSrc } from '../system/image';
import { usePageWords } from '../system/page-words';
import { motionSeconds } from '../system/motion';

/**
 * One picture, with an optional caption, and a link if given. The caption
 * sits under the picture, or over it on a frosted bar or a small label
 * (`captionStyle`).
 */
export function SiteImage({
  src,
  alt,
  caption,
  captionStyle = 'below',
  href,
  ratio = 'auto',
  fit = 'cover',
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior & {
    src: ImageSrc | null | undefined;
    /** What the picture shows; it also names the link. Empty if decorative. */
    alt: string;
    caption?: ReactNode;
    /** Where the caption sits: under the picture, or over it. */
    captionStyle?: CaptionStyle;
    href?: string;
    ratio?: ThumbRatio;
    fit?: 'cover' | 'contain';
  }) {
  // A caption over the picture shares its grid cell (see TileCaption).
  const over = Boolean(caption) && isOverCaption(captionStyle);
  const picture = (
    <Thumb
      src={src}
      alt={alt}
      ratio={ratio}
      fit={fit}
      className={cn('w-full', over && !href && UNDER_CAPTION)}
    />
  );
  return (
    <Block
      as="figure"
      name="site-image"
      defaults={{ tone: 'plain' }}
      {...root}
      className={cn('m-0', over && 'grid grid-cols-1', root.className)}
    >
      {href ? (
        <SiteLink
          href={href}
          newTab={newTab}
          sponsored={sponsored}
          nofollow={nofollow}
          action="image_click"
          className={cn('block', over && UNDER_CAPTION)}
        >
          {picture}
        </SiteLink>
      ) : (
        picture
      )}
      {caption ? (
        <TileCaption captionStyle={captionStyle}>{caption}</TileCaption>
      ) : null}
    </Block>
  );
}

/** A brand's logo, for LogoStrip. */
export type Logo = LinkBehavior & {
  src: ImageSrc | null | undefined;
  /** The brand's name. */
  alt: string;
  href?: string;
};

export type LogoStripLabels = MotionToggleLabels;

/** What a scrolling LogoStrip's pause button says, in English. */
export const LOGO_STRIP_LABELS: LogoStripLabels = WORDS_EN.logoStrip;

/**
 * Brand logos in a row, as "As seen in" or "Worked with". `scroll` moves
 * them slowly across, with a pause button (WCAG 2.2.2), pausing on hover or
 * focus and while off screen; visitors who ask for less motion get a still,
 * wrapped row instead.
 */
export function LogoStrip({
  title,
  logos,
  mode = 'still',
  speed,
  logoHeight = 32,
  muted = true,
  label: labelProp,
  labels,
  headingAs: Heading = 'h3',
  ...root
}: BlockRootProps & {
  /** Above the logos, such as "As seen in". */
  title?: ReactNode;
  logos: Logo[];
  mode?: 'still' | 'scroll';
  /** Seconds for one full pass when scrolling. */
  speed?: number;
  /** Logo height in px. */
  logoHeight?: number;
  /** Logos in the text colour's grey until hovered. */
  muted?: boolean;
  /** The list's name for screen readers. */
  label?: string;
  /** What the pause button of a scrolling strip says to screen readers. */
  labels?: Partial<LogoStripLabels>;
  /** The title's level on the page. `p` when it's only for looks. */
  headingAs?: HeadingTag;
}) {
  const own = usePageWords('props');
  const label = labelProp === undefined ? own.brands : labelProp;
  const item = (logo: Logo, i: number, hidden = false) => {
    const source = toImageSource(logo.src);
    // Logos are at most 160 px wide (max-w-40).
    const image = source ? (
      <img
        {...imageAttrs(source, '160px')}
        alt={hidden ? '' : logo.alt}
        style={{ height: logoHeight }}
        className={cn(
          'w-auto max-w-40 object-contain',
          muted &&
            'opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none'
        )}
      />
    ) : (
      <span className="text-site-text-2 font-bold">{logo.alt}</span>
    );
    return (
      <li
        key={`${hidden ? 'copy-' : ''}${i}-${logo.alt}`}
        aria-hidden={hidden || undefined}
        className={cn(
          'm-0 flex flex-none items-center',
          hidden && 'motion-reduce:hidden'
        )}
      >
        {logo.href && !hidden ? (
          <SiteLink
            href={logo.href}
            newTab={logo.newTab}
            sponsored={logo.sponsored}
            nofollow={logo.nofollow}
            action="logo_click"
            className="flex items-center"
          >
            {image}
          </SiteLink>
        ) : (
          image
        )}
      </li>
    );
  };
  const scrolling = mode === 'scroll' && logos.length > 1;
  return (
    <Block
      as="section"
      name="logo-strip"
      aria-label={typeof title === 'string' ? title : label}
      defaults={{ tone: 'plain', align: 'center' }}
      {...root}
    >
      {title ? (
        <Heading className="text-site-text-2 m-0 text-xs font-bold tracking-wide uppercase">
          {title}
        </Heading>
      ) : null}
      {scrolling ? (
        <LogoMarquee
          seconds={motionSeconds(speed, 30)}
          labels={labels}
          logos={logos.map((logo, i) => item(logo, i))}
          // The copies make the loop seamless; screen readers skip them.
          copies={logos.map((logo, i) => item(logo, i, true))}
        />
      ) : (
        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-10 gap-y-4 p-0">
          {logos.map((logo, i) => item(logo, i))}
        </ul>
      )}
    </Block>
  );
}
