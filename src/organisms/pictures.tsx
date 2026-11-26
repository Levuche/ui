import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { imageAttrs, toImageSource, type ImageSrc } from '../system/image';

/** One picture, with an optional caption, and a link if given. */
export function SiteImage({
  src,
  alt,
  caption,
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
    href?: string;
    ratio?: ThumbRatio;
    fit?: 'cover' | 'contain';
  }) {
  const picture = (
    <Thumb src={src} alt={alt} ratio={ratio} fit={fit} className="w-full" />
  );
  return (
    <Block
      as="figure"
      name="site-image"
      defaults={{ tone: 'plain' }}
      {...root}
      className={cn('m-0', root.className)}
    >
      {href ? (
        <SiteLink
          href={href}
          newTab={newTab}
          sponsored={sponsored}
          nofollow={nofollow}
          action="image_click"
          className="block"
        >
          {picture}
        </SiteLink>
      ) : (
        picture
      )}
      {caption ? (
        <figcaption className="text-site-text-2 text-sm">{caption}</figcaption>
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

/**
 * Brand logos in a row, as "As seen in" or "Worked with". `scroll` moves
 * them slowly across, pausing on hover or focus; visitors who ask for less
 * motion get a still, wrapped row instead.
 */
export function LogoStrip({
  title,
  logos,
  mode = 'still',
  speed = 30,
  logoHeight = 32,
  muted = true,
  label = 'Brands',
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
}) {
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
        <p className="text-site-text-2 m-0 text-xs font-bold tracking-wide uppercase">
          {title}
        </p>
      ) : null}
      {scrolling ? (
        <div className="group w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <ul
            className="m-0 flex w-max list-none gap-10 p-0 pe-10 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-safe:animate-[levuche-marquee_var(--marquee)_linear_infinite] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center rtl:[--marquee-to:50%]"
            style={{ ['--marquee' as string]: `${Math.max(5, speed)}s` }}
          >
            {logos.map((logo, i) => item(logo, i))}
            {/* The second copy makes the loop seamless; screen readers skip it. */}
            {logos.map((logo, i) => item(logo, i, true))}
          </ul>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-10 gap-y-4 p-0">
          {logos.map((logo, i) => item(logo, i))}
        </ul>
      )}
    </Block>
  );
}
