import type { ReactNode } from 'react';
import { cn } from '../system/cn';
import { editable } from '../system/edit';
import type { CaptionStyle } from '../system/gallery';

/**
 * Puts a picture in the same grid cell as a caption drawn over it. The
 * figure is a one-cell grid, so the caption can stay its last child, as a
 * figcaption must, and still sit on the picture.
 */
export const UNDER_CAPTION = '[grid-area:1/1]';

/*
 * The bar and the chip use the block's own pair of colours (text on the card
 * colour, or the card colour on text), so they stay readable in any theme
 * and tone, over any picture. Clicks go through them to the picture's link.
 */
const STYLES: Record<CaptionStyle, string> = {
  below: 'text-site-text-2 text-sm',
  bar: cn(
    UNDER_CAPTION,
    'bg-site-surface/85 text-site-text rounded-b-block-inner pointer-events-none self-end px-3 py-2 text-sm backdrop-blur-md'
  ),
  chip: cn(
    UNDER_CAPTION,
    'bg-site-text text-site-surface rounded-block-inner pointer-events-none m-2 max-w-[calc(100%-1rem)] self-end justify-self-start px-2 py-1 text-xs font-semibold'
  ),
};

/** A picture's or a video's caption, below it or over it (see CAPTION_STYLES). */
export function TileCaption({
  captionStyle = 'below',
  edit,
  className,
  children,
}: {
  captionStyle?: CaptionStyle;
  /** The caption's setting path, for edit mode (see edit.ts). */
  edit?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figcaption
      {...editable(edit)}
      className={cn('m-0', STYLES[captionStyle], className)}
    >
      {children}
    </figcaption>
  );
}
