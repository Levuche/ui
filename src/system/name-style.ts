import type { CSSProperties } from 'react';
import { cn } from './cn';
import { isSafeColor } from './theme';

/*
 * How a creator's name, or a section heading, can be set apart from the rest
 * of the text: its own colour, capitals and a heavier or lighter weight.
 * CreatorHeader and SectionHeading share it.
 */

/** The theme colours a name can be written in, by name. */
export const NAME_COLORS = ['text', 'accent', 'link'] as const;
export type NameColor = (typeof NAME_COLORS)[number];

/** `upper` writes the name in capitals; the page keeps the words as typed. */
export const NAME_CASES = ['normal', 'upper'] as const;
export type NameCase = (typeof NAME_CASES)[number];

export const NAME_WEIGHTS = ['medium', 'semibold', 'bold', 'black'] as const;
export type NameWeight = (typeof NAME_WEIGHTS)[number];

/**
 * A name's look. `tint` is a colour of the creator's own and wins over
 * `color` when it's a plain colour (isSafeColor); anything else is ignored.
 */
export type NameLook = {
  color?: NameColor;
  tint?: string;
  case?: NameCase;
  weight?: NameWeight;
};

const COLOR_CLASSES: Record<NameColor, string> = {
  text: 'text-site-text',
  accent: 'text-site-accent',
  link: 'text-site-link',
};

const WEIGHT_CLASSES: Record<NameWeight, string> = {
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  black: 'font-black',
};

/** The creator's own colour, when it's one a page may use. */
export function nameTint(tint: unknown): string | undefined {
  return typeof tint === 'string' && isSafeColor(tint)
    ? tint.trim()
    : undefined;
}

/**
 * The classes and style for a name with this look. Colour and weight fall
 * back to the text colour and bold for a value that isn't one of theirs.
 */
export function nameLook(look: NameLook = {}): {
  className: string;
  style?: CSSProperties;
} {
  const tint = nameTint(look.tint);
  return {
    className: cn(
      tint
        ? undefined
        : (COLOR_CLASSES[look.color as NameColor] ?? COLOR_CLASSES.text),
      WEIGHT_CLASSES[look.weight as NameWeight] ?? WEIGHT_CLASSES.bold,
      look.case === 'upper' && 'tracking-wide uppercase'
    ),
    ...(tint ? { style: { color: tint } } : {}),
  };
}
