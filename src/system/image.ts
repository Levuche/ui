import type { ImgHTMLAttributes } from 'react';

/**
 * A picture with the sizes it comes in, so a phone downloads a small copy
 * and a desktop a large one. Every block that takes a picture takes this or
 * a plain address.
 *
 *   {
 *     src: 'https://cdn.example.com/chai-800.jpg',
 *     srcSet: 'https://cdn.example.com/chai-400.jpg 400w, https://cdn.example.com/chai-800.jpg 800w',
 *     width: 800,
 *     height: 600,
 *   }
 */
export type ImageSource = {
  /** The address to use when the browser can't pick from `srcSet`. */
  src: string;
  /** Other sizes of the same picture, as "address 400w, address 800w". */
  srcSet?: string;
  /**
   * How wide the picture shows, for the browser to pick from `srcSet`. Each
   * block sets its own from its width on a phone, a tablet and a desktop;
   * set this only for a page laid out differently.
   */
  sizes?: string;
  /** The picture's own width and height in px, so its space is kept while it loads. */
  width?: number;
  height?: number;
  /**
   * Load it at once, for a picture at the top of the page. Every other
   * picture waits until it's near the screen.
   */
  priority?: boolean;
};

/** A picture: its address, or its address with other sizes. */
export type ImageSrc = string | ImageSource;

/** The picture as an ImageSource, or null when there isn't one. */
export function toImageSource(
  src: ImageSrc | null | undefined
): ImageSource | null {
  if (!src) return null;
  if (typeof src === 'string') return { src };
  return src.src ? src : null;
}

/** The page column's width from a tablet up, in px (max-w-site). */
const COLUMN = 576;

const share = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The `sizes` for a picture that takes `across` of the page column: that
 * share of the screen on a phone, and of the 576 px column from a tablet up.
 * `columnSizes(1 / 3)` suits a picture three to a row; `phoneAcross` is its
 * share on a phone when that differs.
 */
export function columnSizes(across = 1, phoneAcross = across): string {
  return `(min-width: 768px) ${Math.round(COLUMN * share(across))}px, ${Math.round(100 * share(phoneAcross))}vw`;
}

/**
 * What an <img> needs for a picture: its sizes, its own width and height,
 * and whether to load now or later.
 */
export function imageAttrs(
  source: ImageSource,
  sizes: string = columnSizes()
): ImgHTMLAttributes<HTMLImageElement> {
  return {
    src: source.src,
    ...(source.srcSet
      ? { srcSet: source.srcSet, sizes: source.sizes ?? sizes }
      : {}),
    ...(source.width && source.height
      ? { width: source.width, height: source.height }
      : {}),
    loading: source.priority ? 'eager' : 'lazy',
    ...(source.priority ? { fetchPriority: 'high' as const } : {}),
    decoding: 'async',
  };
}

/** Data images a CSS background may show. None of these can run code there. */
const DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml)[;,]/i;

/**
 * A picture's address, made safe to put in CSS as url("..."), or null when
 * it isn't one: only https and http addresses, links on the same site, and
 * the editor's own local previews (blob: and data:image/). Characters that
 * could end the url() early are percent-encoded; control characters and
 * backslashes are refused.
 */
export function cssImageUrl(src: ImageSrc | null | undefined): string | null {
  const address = toImageSource(src)?.src;
  if (typeof address !== 'string') return null;
  const value = address.trim();
  // eslint-disable-next-line no-control-regex -- control characters are refused
  if (!value || /[\u0000-\u001f\u007f\\<>]/.test(value)) return null;
  const allowed =
    /^https?:\/\//i.test(value) ||
    /^(\/(?![/\\])|\.\/)/.test(value) ||
    /^blob:https?:\/\//i.test(value) ||
    DATA_IMAGE.test(value);
  if (!allowed) return null;
  const encoded = value.replace(
    /["'()\s]/g,
    (char) =>
      `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
  );
  return `url("${encoded}")`;
}

/**
 * The picture, when its address is one a page may load (the same addresses
 * as cssImageUrl: https and http, links on the same site, and the editor's
 * blob: and data:image/ previews); otherwise null. For a picture that goes
 * somewhere other than an <img>, such as a video's poster.
 */
export function safeImageSource(
  src: ImageSrc | null | undefined
): ImageSource | null {
  const source = toImageSource(src);
  return source && cssImageUrl(source) ? source : null;
}
