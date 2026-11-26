import { cssImageUrl, type ImageSrc } from './image';

/*
 * A block's own background, behind its words: a gradient, a faint pattern or
 * a picture. Part of the look every block shares (see look.ts), so any block
 * takes it without code of its own:
 *
 *   <BookingCard background={{ type: 'gradient', stops: ['accent', 'band'] }} />
 *
 * A creator never types CSS. Gradients and patterns are built from the
 * theme's colours by name, so they follow the theme and dark mode, and a
 * picture's address is checked before it reaches the page. Plain data and
 * plain functions only: the background is written as data attributes and CSS
 * variables, and tokens.css draws it.
 */

/** The theme colours a gradient can run through, by name. */
export const BACKGROUND_FILLS = [
  'bg',
  'surface',
  'surface2',
  'border',
  'accent',
  'band',
] as const;
export type BackgroundFill = (typeof BACKGROUND_FILLS)[number];

/** The faint patterns a block can carry. */
export const BACKGROUND_PATTERNS = [
  'lines',
  'rings',
  'dots',
  'grid',
  'waves',
] as const;
export type BackgroundPattern = (typeof BACKGROUND_PATTERNS)[number];

/** The theme colours a pattern can be drawn in, by name. */
export const BACKGROUND_INKS = [
  'text',
  'text2',
  'accent',
  'band',
  'border',
  'link',
] as const;
export type BackgroundInk = (typeof BACKGROUND_INKS)[number];

/** Which part of a picture stays in view when the block crops it. */
export const BACKGROUND_POSITIONS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
] as const;
export type BackgroundPosition = (typeof BACKGROUND_POSITIONS)[number];

/**
 * A gradient through two or three of the theme's colours. `angle` is in
 * degrees (135, from the top left, if left out). `move` lets it drift slowly,
 * never for visitors who ask their device for less motion.
 */
export type GradientBackground = {
  type: 'gradient';
  stops: BackgroundFill[];
  angle?: number;
  move?: boolean;
};

/**
 * A faint pattern over the block's fill, in one of the theme's colours.
 * `opacity` is how strong the lines are, in percent: 12 if left out, and
 * never more than 30, so words on it stay readable.
 */
export type PatternBackground = {
  type: 'pattern';
  pattern: BackgroundPattern;
  color?: BackgroundInk;
  opacity?: number;
};

/**
 * A picture behind the words, cropped to fill the block, with a layer of the
 * block's own fill colour over it so text stays readable. `dim` is how strong
 * that layer is, in percent: 80 if left out, and never less than 50. On a
 * strong tone (accent, band) words need a stronger layer; backgroundIssues
 * says how strong for a creator's own colours. The picture is decoration
 * only: one that says something belongs in a picture block, with words for
 * screen readers.
 */
export type ImageBackground = {
  type: 'image';
  src: ImageSrc;
  position?: BackgroundPosition;
  dim?: number;
};

export type BlockBackground =
  GradientBackground | PatternBackground | ImageBackground;

/** The kinds of background, for an editor's picker. */
export const BACKGROUND_TYPES = ['gradient', 'pattern', 'image'] as const;
export type BackgroundType = (typeof BACKGROUND_TYPES)[number];

/** A background after cleanBackground: every field set and in range. */
export type CleanBackground =
  | Required<GradientBackground>
  | Required<PatternBackground>
  | Required<ImageBackground>;

export const DEFAULT_ANGLE = 135;
export const DEFAULT_PATTERN_OPACITY = 12;
export const MAX_PATTERN_OPACITY = 30;
export const DEFAULT_DIM = 80;
export const MIN_DIM = 50;

/** The --site-* variable behind each colour name. */
const SITE_VARS: Record<BackgroundFill | BackgroundInk, string> = {
  bg: '--site-bg',
  surface: '--site-surface',
  surface2: '--site-surface-2',
  border: '--site-border',
  accent: '--site-accent',
  band: '--site-band',
  text: '--site-text',
  text2: '--site-text-2',
  link: '--site-link',
};

const oneOf = <T extends string>(list: readonly T[], value: unknown) =>
  list.includes(value as T) ? (value as T) : undefined;

/** A whole number between low and high, or the fallback for anything else. */
function within(value: unknown, low: number, high: number, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.round(Math.min(high, Math.max(low, value)));
}

/**
 * A background with every value checked: unknown names dropped, numbers kept
 * in range and defaults filled in. Null when nothing usable is left, such as
 * a gradient with fewer than two known colours or an unsafe picture.
 */
export function cleanBackground(
  background: BlockBackground | null | undefined
): CleanBackground | null {
  if (!background || typeof background !== 'object') return null;
  if (background.type === 'gradient') {
    const stops = (Array.isArray(background.stops) ? background.stops : [])
      .map((stop) => oneOf(BACKGROUND_FILLS, stop))
      .filter((stop): stop is BackgroundFill => !!stop)
      .slice(0, 3);
    if (stops.length < 2) return null;
    return {
      type: 'gradient',
      stops,
      angle: within(background.angle, 0, 360, DEFAULT_ANGLE),
      move: background.move === true,
    };
  }
  if (background.type === 'pattern') {
    const pattern = oneOf(BACKGROUND_PATTERNS, background.pattern);
    if (!pattern) return null;
    return {
      type: 'pattern',
      pattern,
      color: oneOf(BACKGROUND_INKS, background.color) ?? 'accent',
      opacity: within(
        background.opacity,
        1,
        MAX_PATTERN_OPACITY,
        DEFAULT_PATTERN_OPACITY
      ),
    };
  }
  if (background.type === 'image') {
    if (!cssImageUrl(background.src)) return null;
    return {
      type: 'image',
      src: background.src,
      position: oneOf(BACKGROUND_POSITIONS, background.position) ?? 'center',
      dim: within(background.dim, MIN_DIM, 100, DEFAULT_DIM),
    };
  }
  return null;
}

/** What a background puts on a block's element. */
export type BackgroundProps = {
  style: Record<`--${string}`, string>;
  'data-background'?: BackgroundType;
  'data-pattern'?: BackgroundPattern;
  'data-background-move'?: 'true';
};

/**
 * The data attributes and CSS variables that draw a background (see
 * tokens.css). Every value is a theme variable, a number or a checked
 * address, never text a creator typed.
 */
export function backgroundProps(
  background: BlockBackground | null | undefined
): BackgroundProps {
  const clean = cleanBackground(background);
  if (!clean) return { style: {} };
  if (clean.type === 'gradient') {
    const stops = clean.stops.map((stop) => `var(${SITE_VARS[stop]})`);
    return {
      style: {
        '--block-gradient': `linear-gradient(${clean.angle}deg, ${stops.join(', ')})`,
      },
      'data-background': 'gradient',
      ...(clean.move ? { 'data-background-move': 'true' as const } : {}),
    };
  }
  if (clean.type === 'pattern') {
    return {
      style: {
        '--block-ink': `color-mix(in oklab, var(${SITE_VARS[clean.color]}) ${clean.opacity}%, transparent)`,
      },
      'data-background': 'pattern',
      'data-pattern': clean.pattern,
    };
  }
  return {
    style: {
      '--block-picture': cssImageUrl(clean.src)!,
      '--block-picture-position': clean.position,
      '--block-dim': `${clean.dim}%`,
    },
    'data-background': 'image',
  };
}
