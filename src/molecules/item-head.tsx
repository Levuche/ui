import type { ReactNode } from 'react';
import { Eyebrow } from '../atoms/text';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';

export type HeadingTag = 'h2' | 'h3' | 'h4' | 'p';

/**
 * The top of a card: an optional picture, a small line above the title, the
 * title and a line or two about it. `media="side"` puts a small square
 * picture beside the words; `top` puts a wide one above them.
 */
export function ItemHead({
  title,
  detail,
  eyebrow,
  image,
  imageAlt = '',
  media = 'side',
  ratio,
  headingAs: Heading = 'h3',
  className,
}: {
  title: ReactNode;
  detail?: ReactNode;
  eyebrow?: ReactNode;
  /** undefined: no picture; null: a plain tile where it would be. */
  image?: string | null;
  imageAlt?: string;
  media?: 'side' | 'top';
  ratio?: ThumbRatio;
  headingAs?: HeadingTag;
  className?: string;
}) {
  const picture =
    image !== undefined ? (
      <Thumb
        src={image}
        alt={imageAlt}
        ratio={ratio ?? (media === 'top' ? 'auto' : 'square')}
        className={media === 'top' ? 'h-28 w-full' : 'size-13'}
      />
    ) : null;
  const words = (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading className="text-block-title m-0 leading-tight font-bold">
        {title}
      </Heading>
      {detail ? <p className="text-site-text-2 m-0 text-sm">{detail}</p> : null}
    </div>
  );
  return media === 'top' ? (
    <div className={cn('gap-block-gap flex flex-col', className)}>
      {picture}
      {words}
    </div>
  ) : (
    <div className={cn('flex items-start gap-3', className)}>
      {picture}
      {words}
    </div>
  );
}
