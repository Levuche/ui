import qrcode from 'qrcode-generator';
import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { siteButtonClasses, type SiteButtonVariant } from '../atoms/button';
import { DownloadIcon } from '../atoms/icons';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { cn } from '../system/cn';
import { safeImageSource } from '../system/image';
import { isSafeColor } from '../system/theme';
import { usePageWords } from '../system/page-words';

/**
 * How much of the code can be covered or damaged and still scan: about 7%
 * (L), 15% (M), 25% (Q) or 30% (H). Higher makes a denser code.
 */
export type QrLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Turns text into a QR code's squares, row by row, true for dark. The
 * block uses `qrEncode`; pass your own to draw codes another way.
 */
export type QrEncoder = (text: string, level?: QrLevel) => boolean[][];

/**
 * Encodes text as a QR code in the smallest size that fits, reading it as
 * UTF-8 so any language scans. Returns no squares when the text is too long
 * for a QR code (about 2,300 bytes at level M).
 */
export const qrEncode: QrEncoder = (text, level = 'M') => {
  const bytes = new TextEncoder().encode(text);
  // The largest QR code holds 2,953 bytes, at level L.
  if (bytes.length === 0 || bytes.length > 2953) return [];
  const code = qrcode(0, level);
  // The encoder takes one character per byte, so hand it the UTF-8 bytes.
  code.addData(String.fromCharCode(...bytes), 'Byte');
  try {
    code.make();
  } catch {
    return [];
  }
  const count = code.getModuleCount();
  return Array.from({ length: count }, (_, y) =>
    Array.from({ length: count }, (_, x) => code.isDark(y, x))
  );
};

/** The QR code as an SVG file, with a quiet border of 4 squares. */
export function qrSvg(
  modules: boolean[][],
  {
    dark = '#000000',
    light = '#ffffff',
    title,
  }: { dark?: string; light?: string; title?: string } = {}
) {
  const size = modules.length + 8;
  let path = '';
  modules.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) path += `M${x + 4} ${y + 4}h1v1h-1z`;
    })
  );
  const name = title
    ? `<title>${title.replace(/[<&>]/g, (c) => `&#${c.charCodeAt(0)};`)}</title>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${name}<rect width="${size}" height="${size}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
}

/**
 * A code visitors scan to open a link on their phone, with a button that
 * saves it. The code is drawn from `value`; give `src` instead for a picture
 * of a code made elsewhere. It stays dark on light whatever the block's
 * tone, since scanners need that; `dark` and `light` change it, and keep
 * enough contrast between them for a phone to read it.
 */
export function QrCode({
  value,
  encode = qrEncode,
  level = 'M',
  src,
  title,
  detail,
  caption,
  dark = '#000000',
  light = '#ffffff',
  size,
  download = true,
  downloadLabel: downloadLabelProp,
  fileName = 'qr-code',
  buttonVariant = 'outline',
  headingAs = 'h3',
  ...root
}: BlockRootProps & {
  /** What the code opens, usually the page's address. */
  value: string;
  /** Draws the code. Defaults to `qrEncode`. */
  encode?: QrEncoder;
  /** How much damage the code survives. Defaults to M. */
  level?: QrLevel;
  /**
   * A picture of the code, instead of `encode`. An address a page may not
   * load is ignored, and the code is drawn from `value`.
   */
  src?: string | null;
  title?: ReactNode;
  detail?: ReactNode;
  /** Under the code. Defaults to `value`, without "https://". */
  caption?: ReactNode;
  dark?: string;
  light?: string;
  /** The block's size, as on every block; it also sets the code's width. */
  size?: 'sm' | 'md' | 'lg';
  download?: boolean;
  downloadLabel?: ReactNode;
  /** Without ".svg" or ".png". */
  fileName?: string;
  buttonVariant?: SiteButtonVariant;
  headingAs?: HeadingTag;
}) {
  const own = usePageWords('props');
  const downloadLabel =
    downloadLabelProp === undefined ? own.saveQr : downloadLabelProp;
  const ink = isSafeColor(dark) ? dark : '#000000';
  const paper = isSafeColor(light) ? light : '#ffffff';
  const name = own.qrFor.replace(
    '{address}',
    value.replace(/^https?:\/\//, '')
  );
  const ownPicture = safeImageSource(src)?.src ?? null;
  const modules = ownPicture ? null : encode(value, level);
  const svg = modules?.length
    ? qrSvg(modules, { dark: ink, light: paper, title: name })
    : null;
  const picture = svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : ownPicture;
  const width = { sm: 'w-32', md: 'w-44', lg: 'w-60' }[size ?? 'md'];
  const file = `${fileName.replace(/[\\/:*?"<>|]/g, '')}.${svg ? 'svg' : 'png'}`;
  return (
    <Block name="qr-code" defaults={{ align: 'center' }} size={size} {...root}>
      {title ? (
        <ItemHead title={title} detail={detail} headingAs={headingAs} />
      ) : null}
      {picture ? (
        <img
          src={picture}
          alt={name}
          className={cn(
            'rounded-block-inner mx-auto aspect-square h-auto',
            width
          )}
          style={{ background: paper }}
        />
      ) : null}
      <p className="text-site-text-2 m-0 text-sm break-all">
        {caption ?? value.replace(/^https?:\/\//, '')}
      </p>
      {download && picture ? (
        <a
          href={picture}
          download={file}
          data-action="qr_download"
          className={siteButtonClasses({
            variant: buttonVariant,
            fullWidth: true,
          })}
        >
          <DownloadIcon size={18} />
          {downloadLabel}
        </a>
      ) : null}
    </Block>
  );
}
