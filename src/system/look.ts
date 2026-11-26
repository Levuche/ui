import type { CSSProperties } from 'react';
import { cn } from './cn';
import { siteThemeStyle, type SiteColors } from './theme';

/*
 * The look every block shares. A creator picks these per block in the page
 * editor, on top of the page's theme (<CreatorTheme>):
 *
 *   <BookingCard tone="accent" size="lg" radius="full" shadow="md" ... />
 *
 * Plain data and plain functions only, so a block that uses them can still be
 * a React Server Component. Nothing here reads React context: the look is
 * written onto the block's own element as data attributes and CSS variables,
 * and CSS passes it down to everything inside (see tokens.css).
 */

/**
 * The block's colours. Each tone swaps the --site-* colours inside the block,
 * so text, links and buttons inside it stay readable without any change to
 * the block's own code:
 *
 * - surface: the theme's card colour (the default)
 * - muted: a quieter card, a shade off the page colour
 * - accent: the theme's accent colour, with buttons turned inside out
 * - band: the theme's band colour, as the newsletter band uses
 * - notice: the warm notice colour, as for codes and alerts
 * - outline: no fill, a line around it
 * - plain: no fill, no line and no padding, sitting on the page
 */
export const BLOCK_TONES = [
  'surface',
  'muted',
  'accent',
  'band',
  'notice',
  'outline',
  'plain',
] as const;
export type BlockTone = (typeof BLOCK_TONES)[number];

/** How roomy a block is: its padding, gaps and type size. */
export const BLOCK_SCALES = ['sm', 'md', 'lg'] as const;
export type BlockScale = (typeof BLOCK_SCALES)[number];

/** The block's corners. `theme` follows the page theme's corners. */
export const BLOCK_RADII = ['theme', 'none', 'sm', 'md', 'lg', 'full'] as const;
export type BlockRadius = (typeof BLOCK_RADII)[number];

export const BLOCK_ALIGNS = ['start', 'center', 'end'] as const;
export type BlockAlign = (typeof BLOCK_ALIGNS)[number];

export const BLOCK_SHADOWS = ['none', 'sm', 'md', 'lg'] as const;
export type BlockShadow = (typeof BLOCK_SHADOWS)[number];

/**
 * How the block appears when the page loads. Always off for visitors who ask
 * their device for less motion.
 */
export const BLOCK_MOTIONS = ['none', 'fade', 'rise', 'scale'] as const;
export type BlockMotion = (typeof BLOCK_MOTIONS)[number];

/** The screens a block can be hidden on, when it's not on a grid page. */
export const BLOCK_SCREENS = ['phone', 'tablet', 'desktop'] as const;
export type BlockScreen = (typeof BLOCK_SCREENS)[number];

/** Everything a creator can change about how one block looks. */
export type BlockLook = {
  tone?: BlockTone;
  size?: BlockScale;
  radius?: BlockRadius;
  align?: BlockAlign;
  shadow?: BlockShadow;
  motion?: BlockMotion;
  /** This block's own colours, over the page theme's. Same keys as a theme. */
  colors?: SiteColors;
  /** This block's own font, as a CSS font-family list. */
  font?: string;
  /** Hide the block on these screens. Grid pages place blocks per screen instead. */
  hideOn?: BlockScreen[];
};

const LOOK_KEYS = [
  'tone',
  'size',
  'radius',
  'align',
  'shadow',
  'motion',
  'colors',
  'font',
  'hideOn',
] as const satisfies readonly (keyof BlockLook)[];

/**
 * Splits a block's props into its look and everything else, so a block can
 * pass the rest (id, aria-*, data-*, event handlers) to its element.
 */
export function splitLook<P extends BlockLook>(
  props: P
): [BlockLook, Omit<P, keyof BlockLook>] {
  const look: BlockLook = {};
  const rest = { ...props } as Record<string, unknown>;
  for (const key of LOOK_KEYS) {
    if (key in rest) {
      (look as Record<string, unknown>)[key] = rest[key];
      delete rest[key];
    }
  }
  return [look, rest as Omit<P, keyof BlockLook>];
}

const oneOf = <T extends string>(list: readonly T[], value: unknown) =>
  list.includes(value as T) ? (value as T) : undefined;

const TONE_CLASSES: Record<BlockTone, string> = {
  surface: 'bg-site-surface text-site-text p-block',
  muted:
    'bg-[color-mix(in_oklab,var(--site-text)_6%,var(--site-bg))] text-site-text p-block',
  accent: 'bg-site-surface text-site-text p-block',
  band: 'bg-site-surface text-site-text p-block',
  notice: 'bg-site-surface text-site-text p-block',
  outline: 'border-site-border text-site-text border-2 bg-transparent p-block',
  plain: 'text-site-text bg-transparent',
};

const ALIGN_CLASSES: Record<BlockAlign, string> = {
  start: 'items-stretch text-start',
  center: 'items-center text-center',
  end: 'items-end text-end',
};

const SHADOW_CLASSES: Record<BlockShadow, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const HIDE_CLASSES: Record<BlockScreen, string> = {
  phone: 'max-md:hidden',
  tablet: 'md:max-lg:hidden',
  desktop: 'lg:hidden',
};

/** What the look puts on a block's element. */
export type LookProps = {
  className: string;
  style: CSSProperties;
  'data-block': string;
  'data-tone': BlockTone;
  'data-block-size': BlockScale;
  'data-radius': BlockRadius;
  'data-motion'?: BlockMotion;
  /** Set when the block picks its own shadow, which wins over the card style. */
  'data-shadow'?: BlockShadow;
};

/**
 * The class names, style and data attributes for a block's own element: a
 * "prop getter". Every block spreads these on its outermost element, which is
 * how one creator setting restyles any block the same way.
 *
 * Values a creator typed are checked: an unknown tone or size falls back to
 * the default, and colours and fonts go through the theme's safety checks.
 *
 * @param name The block's id from the registry (see registry.ts), written as
 *   data-block so tests, analytics and the editor can find it.
 * @param defaults The block's own defaults, used where the creator set none.
 */
export function lookProps(
  name: string,
  look: BlockLook = {},
  defaults: BlockLook = {},
  className?: string
): LookProps {
  const tone = oneOf(BLOCK_TONES, look.tone) ?? defaults.tone ?? 'surface';
  const size = oneOf(BLOCK_SCALES, look.size) ?? defaults.size ?? 'md';
  const radius = oneOf(BLOCK_RADII, look.radius) ?? defaults.radius ?? 'theme';
  const align = oneOf(BLOCK_ALIGNS, look.align) ?? defaults.align;
  const shadow = oneOf(BLOCK_SHADOWS, look.shadow) ?? defaults.shadow;
  const motion = oneOf(BLOCK_MOTIONS, look.motion) ?? defaults.motion;
  const hideOn = (look.hideOn ?? defaults.hideOn ?? []).filter((screen) =>
    BLOCK_SCREENS.includes(screen)
  );
  return {
    className: cn(
      'rounded-block font-[family-name:var(--site-font)]',
      TONE_CLASSES[tone],
      align && ALIGN_CLASSES[align],
      shadow && SHADOW_CLASSES[shadow],
      hideOn.map((screen) => HIDE_CLASSES[screen]),
      className
    ),
    style: siteThemeStyle({
      colors: look.colors ?? defaults.colors,
      font: look.font ?? defaults.font,
    }),
    'data-block': name,
    'data-tone': tone,
    'data-block-size': size,
    'data-radius': radius,
    ...(motion && motion !== 'none' ? { 'data-motion': motion } : {}),
    ...(shadow ? { 'data-shadow': shadow } : {}),
  };
}
