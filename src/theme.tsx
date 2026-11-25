import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from './cn';

/** The colours a creator can set. Each is optional; the scheme fills gaps. */
export type SiteColors = Partial<{
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  text2: string;
  link: string;
  accent: string;
  onAccent: string;
  band: string;
  onBand: string;
}>;

/** Corner shape for cards and tiles. */
export type SiteCorners = 'square' | 'soft' | 'round';
/** Button shape. */
export type SiteButtonShape = 'square' | 'rounded' | 'pill';

/**
 * A creator's theme, as chosen in the page editor: light or dark, their own
 * colours, corner and button shapes, and font. Saved with the page and passed
 * to <CreatorTheme>.
 */
export type SiteTheme = {
  scheme?: 'light' | 'dark';
  colors?: SiteColors;
  corners?: SiteCorners;
  buttonShape?: SiteButtonShape;
  /** A CSS font-family list, such as "'Sora', sans-serif". */
  font?: string;
};

const COLOR_VARS: Record<keyof SiteColors, string> = {
  bg: '--site-bg',
  surface: '--site-surface',
  surface2: '--site-surface-2',
  border: '--site-border',
  text: '--site-text',
  text2: '--site-text-2',
  link: '--site-link',
  accent: '--site-accent',
  onAccent: '--site-on-accent',
  band: '--site-band',
  onBand: '--site-on-band',
};

const CORNERS: Record<SiteCorners, string> = {
  square: '4px',
  soft: '16px',
  round: '28px',
};

const BUTTON_SHAPES: Record<SiteButtonShape, string> = {
  square: '4px',
  rounded: '12px',
  pill: '9999px',
};

/**
 * Only plain colour values get through: hex, rgb(), hsl() or oklch(). A theme
 * is saved by a creator, so anything else is dropped rather than put in CSS.
 */
export function isSafeColor(value: string) {
  return /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla|oklch)\([0-9.,%\s/+-]+\))$/i.test(
    value.trim()
  );
}

/** Only font names made of letters, digits, spaces, quotes, commas and hyphens. */
export function isSafeFont(value: string) {
  return /^[\w\s"',-]{1,200}$/.test(value);
}

/** The CSS variables for a theme, for a style attribute. */
export function siteThemeStyle(theme: SiteTheme = {}): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors ?? {})) {
    const name = COLOR_VARS[key as keyof SiteColors];
    if (name && typeof value === 'string' && isSafeColor(value)) {
      style[name] = value.trim();
    }
  }
  if (theme.corners && CORNERS[theme.corners]) {
    style['--site-radius'] = CORNERS[theme.corners];
  }
  if (theme.buttonShape && BUTTON_SHAPES[theme.buttonShape]) {
    style['--site-button-radius'] = BUTTON_SHAPES[theme.buttonShape];
  }
  if (theme.font && isSafeFont(theme.font)) {
    style['--site-font'] = theme.font;
  }
  return style as CSSProperties;
}

/**
 * Applies a creator's theme to everything inside: the scheme (light or dark)
 * and any colours, shapes and font they chose. Every page block reads only
 * these --site-* variables.
 */
export function CreatorTheme({
  theme,
  scheme,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  theme?: SiteTheme;
  /** Shorthand for theme.scheme. */
  scheme?: 'light' | 'dark';
}) {
  return (
    <div
      data-site={scheme ?? theme?.scheme ?? 'light'}
      className={cn('bg-site-bg text-site-text', className)}
      style={{ ...siteThemeStyle(theme), ...style }}
      {...props}
    />
  );
}
