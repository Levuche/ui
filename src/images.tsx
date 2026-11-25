import { cn } from './cn';
import { Thumb } from './thumb';

/** Square pictures in a grid of two or three, each one a link if given. */
export function ImageGrid({
  images,
  columns = 3,
  className,
}: {
  /** `alt` describes the picture; it also names the link. */
  images: { src?: string | null; alt: string; href?: string }[];
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'm-0 grid list-none gap-2 p-0',
        columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
        className
      )}
    >
      {images.map((image, i) => {
        const picture = image.src ? (
          <Thumb
            src={image.src}
            alt={image.alt}
            className="aspect-square w-full rounded-[calc(var(--site-radius)*0.6)]"
          />
        ) : (
          <span
            role="img"
            aria-label={image.alt}
            className="bg-site-surface-2 block aspect-square w-full rounded-[calc(var(--site-radius)*0.6)]"
          />
        );
        return (
          <li key={`${i}-${image.alt}`} className="m-0">
            {image.href ? (
              <a
                href={image.href}
                className="block"
                {...(/^https?:\/\//i.test(image.href)
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {picture}
              </a>
            ) : (
              picture
            )}
          </li>
        );
      })}
    </ul>
  );
}
