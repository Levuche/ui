import type { ReactNode } from 'react';
import { Eyebrow } from '../atoms/text';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import { cn } from '../system/cn';
import { editable, type EditPaths } from '../system/edit';
import type { ImageSrc } from '../system/image';

export type HeadingTag = 'h2' | 'h3' | 'h4' | 'p';

/** The level of a heading inside a block, one below the block's title. */
export type SubHeadingTag = 'h3' | 'h4' | 'h5' | 'p';

/**
 * The heading for each item under a block's title, such as each card in a
 * list: one level below `tag`, or `p` when the title is only for looks.
 * Every block with items uses this, so the page's outline has no gaps.
 */
export function subHeading(tag: HeadingTag | undefined): SubHeadingTag {
  return tag === 'h2' ? 'h3' : tag === 'h3' ? 'h4' : tag === 'h4' ? 'h5' : 'p';
}

/**
 * The top of a card: an optional picture, a small line above the title, the
 * title and a line or two about it. `media="side"` puts a small square
 * picture beside the words; `top` puts a wide one above them.
 *
 * `edit` gives each part's setting path, for edit mode (see edit.ts): with
 * { title: 'items.0.title' } the title can be typed in place.
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
  edit = {},
  className,
}: {
  title: ReactNode;
  detail?: ReactNode;
  eyebrow?: ReactNode;
  /** undefined: no picture; null: a plain tile where it would be. */
  image?: ImageSrc | null;
  imageAlt?: string;
  media?: 'side' | 'top';
  ratio?: ThumbRatio;
  headingAs?: HeadingTag | SubHeadingTag;
  /** Each part's setting path, for edit mode. */
  edit?: EditPaths<'title' | 'detail' | 'eyebrow' | 'image'>;
  className?: string;
}) {
  const picture =
    image !== undefined ? (
      <Thumb
        src={image}
        alt={imageAlt}
        ratio={ratio ?? (media === 'top' ? 'auto' : 'square')}
        sizes={media === 'top' ? undefined : '52px'}
        className={media === 'top' ? 'h-28 w-full' : 'size-13'}
        marks={editable(edit.image, 'picture')}
      />
    ) : null;
  const words = (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {eyebrow ? (
        <Eyebrow {...editable(edit.eyebrow)}>{eyebrow}</Eyebrow>
      ) : null}
      <Heading
        {...editable(edit.title)}
        className="text-block-title m-0 leading-tight font-bold"
      >
        {title}
      </Heading>
      {detail ? (
        <p
          {...editable(edit.detail, 'longText')}
          className="text-site-text-2 m-0 text-sm"
        >
          {detail}
        </p>
      ) : null}
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
