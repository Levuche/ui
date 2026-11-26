/*
 * The choices galleries, pictures and video tiles share, as plain data, so
 * the registry's settings and the blocks read the same lists.
 */

/**
 * Where a picture's caption sits:
 *
 * - below: under the picture, in the quieter text colour
 * - bar: over the bottom of the picture, on a frosted strip of the card colour
 * - chip: a small dark label in the picture's bottom corner
 */
export const CAPTION_STYLES = ['below', 'bar', 'chip'] as const;
export type CaptionStyle = (typeof CAPTION_STYLES)[number];

/** True for the styles drawn over the picture. */
export const isOverCaption = (style: CaptionStyle) => style !== 'below';

/**
 * How much of a gallery a tile takes, as columns by rows: one cell, two
 * cells wide, two cells tall, or a big square of four.
 */
export const GALLERY_SPANS = ['1x1', '2x1', '1x2', '2x2'] as const;
export type GallerySpan = (typeof GALLERY_SPANS)[number];

/** The shapes a video can take. `tall` is a phone video (9:16). */
export const VIDEO_RATIOS = ['video', 'tall', 'square', 'portrait'] as const;
export type VideoRatio = (typeof VIDEO_RATIOS)[number];
