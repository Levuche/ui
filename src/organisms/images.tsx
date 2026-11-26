import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { columnSizes, type ImageSrc } from '../system/image';

/** Pictures in a grid of two to four, each one a link if given. */
export function ImageGrid({
  images,
  columns = 3,
  ratio = 'square',
  ...root
}: BlockRootProps & {
  /** `alt` describes the picture; it also names the link. */
  images: (LinkBehavior & {
    src?: ImageSrc | null;
    alt: string;
    href?: string;
  })[];
  columns?: 2 | 3 | 4;
  ratio?: ThumbRatio;
}) {
  return (
    <Block name="image-grid" defaults={{ tone: 'plain' }} {...root}>
      <ul
        className={cn(
          'm-0 grid list-none gap-2 p-0',
          columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
          columns === 4 && 'md:grid-cols-4'
        )}
      >
        {images.map(({ src, alt, href, ...link }, i) => {
          const picture = (
            <Thumb
              src={src}
              alt={alt}
              ratio={ratio}
              sizes={columnSizes(1 / columns, 1 / Math.min(columns, 3))}
              className="w-full"
            />
          );
          return (
            <li key={`${i}-${alt}`} className="m-0">
              {href ? (
                <SiteLink
                  href={href}
                  action="image_click"
                  data-lift=""
                  className="block"
                  {...link}
                >
                  {picture}
                </SiteLink>
              ) : (
                picture
              )}
            </li>
          );
        })}
      </ul>
    </Block>
  );
}
