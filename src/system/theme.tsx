import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from './cn';
import { safeLanguage, type PageWordsInput } from './language';
import { PageProvider, type PageSettings } from './page-context';
import { rememberPage } from './page-words';

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
 * How cards look on the page: blocks in the surface and muted tones, and the
 * shadow on filled blocks.
 *
 * - flat: filled, no line or shadow (the default)
 * - outline: filled, with a thin line around
 * - raised: a soft shadow tinted with the accent, on every filled block
 * - glass: see-through and blurred over the page's background, with a thin line
 *
 * A block's own `shadow` prop replaces the line or shadow a card style adds.
 */
export const SITE_CARD_STYLES = ['flat', 'outline', 'raised', 'glass'] as const;
export type SiteCardStyle = (typeof SITE_CARD_STYLES)[number];

/**
 * What links and linked cards do under the pointer. `lift` raises them a
 * little on hover and presses them in on tap (the default); `none` keeps them
 * still. Never moves for visitors who ask for less motion.
 */
export const SITE_HOVERS = ['lift', 'none'] as const;
export type SiteHover = (typeof SITE_HOVERS)[number];

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
  /**
   * A second font for a few words set apart, such as the highlighted words of
   * the header's tagline. Left out, they use `font`.
   */
  displayFont?: string;
  /** How cards look; see SiteCardStyle. */
  cards?: SiteCardStyle;
  /** What links do under the pointer; see SiteHover. */
  hover?: SiteHover;
  /**
   * The page's language, as a tag such as "hi", "es" or "pt-BR". Blocks write
   * numbers and dates in it, and screen readers read the page in it. The
   * words blocks write themselves come from <CreatorTheme words>.
   */
  language?: string;
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
  if (theme.displayFont && isSafeFont(theme.displayFont)) {
    style['--site-display-font'] = theme.displayFont;
  }
  return style as CSSProperties;
}

/**
 * The data attributes for a theme's card style and hover, which tokens.css
 * turns into styles. Unknown values are dropped, so the defaults apply.
 */
export function siteThemeAttributes(theme: SiteTheme = {}) {
  const cards = SITE_CARD_STYLES.find((value) => value === theme.cards);
  const hover = SITE_HOVERS.find((value) => value === theme.hover);
  return {
    ...(cards && cards !== 'flat' ? { 'data-cards': cards } : {}),
    ...(hover && hover !== 'lift' ? { 'data-hover': hover } : {}),
  };
}

/**
 * Applies a creator's theme to everything inside: the scheme (light or dark)
 * and any colours, shapes, card style, hover and font they chose. Every page
 * block reads only these --site-* variables and data attributes.
 *
 * With `theme.language` or `words`, it also gives every block inside the
 * page's language and words, so no block needs its own `labels`:
 *
 *   <CreatorTheme theme={theme} words={await loadPageWords(theme.language)}>
 */
export function CreatorTheme({
  theme,
  scheme,
  words,
  className,
  style,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  theme?: SiteTheme;
  /** Shorthand for theme.scheme. */
  scheme?: 'light' | 'dark';
  /**
   * The words blocks write themselves, from loadPageWords or a WORDS_* set,
   * or only some of them. A block's own `labels` win over these.
   */
  words?: PageWordsInput;
}) {
  const language = safeLanguage(theme?.language);
  const page: PageSettings | null =
    language || words ? { language, words } : null;
  if (page) rememberPage(page);
  return (
    <div
      data-site={scheme ?? theme?.scheme ?? 'light'}
      className={cn('bg-site-bg text-site-text', className)}
      style={{ ...siteThemeStyle(theme), ...style }}
      lang={language}
      {...siteThemeAttributes(theme)}
      {...props}
    >
      {page ? <PageProvider value={page}>{children}</PageProvider> : children}
    </div>
  );
}
