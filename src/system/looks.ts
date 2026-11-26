import type { SiteColors, SiteTheme } from './theme';

/*
 * Ready-made looks: a starting theme a creator picks in one tap, which sets
 * colours, card style, corners, buttons and fonts together. Each is a plain
 * SiteTheme, so a look saves and loads like any theme, and a creator can
 * change any part of it afterwards. A test checks every look passes
 * contrastIssues, so a creator never starts from a page that's hard to read.
 *
 * Fonts are lists the visitor's device already has, so a look loads nothing.
 */

export const SITE_LOOK_NAMES = [
  'clean',
  'soft',
  'bold',
  'night',
  'paper',
  'terminal',
] as const;
export type SiteLookName = (typeof SITE_LOOK_NAMES)[number];

export type SiteLook = {
  /** The look's name, as shown in the editor. */
  title: string;
  /** One line on who it suits, for the editor's picker. */
  summary: string;
  theme: SiteTheme;
};

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const ROUNDED = "ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif";
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
const MONO = "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, monospace";

export const SITE_LOOKS: Record<SiteLookName, SiteLook> = {
  clean: {
    title: 'Clean',
    summary: 'White page, thin outlines and pill buttons. Suits anyone.',
    theme: {
      scheme: 'light',
      colors: {
        bg: '#ffffff',
        surface: '#f8fafc',
        surface2: '#f1f5f9',
        border: '#e2e8f0',
        text: '#0f172a',
        text2: '#475569',
        link: '#1d4ed8',
        accent: '#2563eb',
        onAccent: '#ffffff',
        band: '#0f172a',
        onBand: '#ffffff',
      },
      cards: 'outline',
      corners: 'soft',
      buttonShape: 'pill',
      font: SANS,
      hover: 'lift',
    },
  },
  soft: {
    title: 'Soft',
    summary:
      'Pastel lilac, rounded type and cards that float. Suits makers and coaches.',
    theme: {
      scheme: 'light',
      colors: {
        bg: '#faf7ff',
        surface: '#ffffff',
        surface2: '#f1eafe',
        border: '#e4d8fb',
        text: '#2a1f3d',
        text2: '#5b4f70',
        link: '#6d28d9',
        accent: '#7c3aed',
        onAccent: '#ffffff',
        band: '#ede4ff',
        onBand: '#3b1a78',
      },
      cards: 'raised',
      corners: 'round',
      buttonShape: 'pill',
      font: ROUNDED,
      hover: 'lift',
    },
  },
  bold: {
    title: 'Bold',
    summary:
      'Black on white, square corners and one loud colour. Suits brands and shops.',
    theme: {
      scheme: 'light',
      colors: {
        bg: '#ffffff',
        surface: '#fff1f2',
        surface2: '#ffe4e6',
        border: '#111111',
        text: '#111111',
        text2: '#3f3f46',
        link: '#be123c',
        accent: '#e11d48',
        onAccent: '#ffffff',
        band: '#111111',
        onBand: '#ffffff',
      },
      cards: 'outline',
      corners: 'square',
      buttonShape: 'square',
      font: SANS,
      displayFont: "'Arial Black', 'Helvetica Neue', Impact, sans-serif",
      hover: 'lift',
    },
  },
  night: {
    title: 'Night',
    summary:
      'Deep blue page with glass cards and a violet glow. Suits music and gaming.',
    theme: {
      scheme: 'dark',
      colors: {
        bg: '#0b1020',
        surface: '#151b33',
        surface2: '#1f2747',
        border: '#2b3560',
        text: '#f5f7ff',
        text2: '#c3c9e6',
        link: '#c4b5fd',
        accent: '#a78bfa',
        onAccent: '#140b2e',
        band: '#a78bfa',
        onBand: '#140b2e',
      },
      cards: 'glass',
      corners: 'round',
      buttonShape: 'pill',
      font: SANS,
      hover: 'lift',
    },
  },
  paper: {
    title: 'Paper',
    summary:
      'Warm cream page and book type, nothing moving. Suits writers and teachers.',
    theme: {
      scheme: 'light',
      colors: {
        bg: '#fbf7ef',
        surface: '#f4ecdc',
        surface2: '#ebdfc7',
        border: '#ddcfb3',
        text: '#2b2118',
        text2: '#5c4d3c',
        link: '#7c2d12',
        accent: '#9a3412',
        onAccent: '#ffffff',
        band: '#3b2f22',
        onBand: '#fbf7ef',
      },
      cards: 'flat',
      corners: 'square',
      buttonShape: 'rounded',
      font: SERIF,
      hover: 'none',
    },
  },
  terminal: {
    title: 'Terminal',
    summary: 'Dark page, code type and green highlights. Suits developers.',
    theme: {
      scheme: 'dark',
      colors: {
        bg: '#0a0f0a',
        surface: '#111a12',
        surface2: '#18261a',
        border: '#244a2a',
        text: '#e6f4e8',
        text2: '#a8c4ac',
        link: '#4ade80',
        accent: '#22c55e',
        onAccent: '#04140a',
        band: '#22c55e',
        onBand: '#04140a',
      },
      cards: 'outline',
      corners: 'square',
      buttonShape: 'square',
      font: MONO,
      hover: 'lift',
    },
  },
};

/**
 * A look's theme with a creator's own changes laid over it. Colours merge one
 * by one, so changing the accent keeps the rest of the look's colours.
 * Unknown names give back the creator's theme alone.
 */
export function siteLook(
  name: SiteLookName,
  changes: SiteTheme = {}
): SiteTheme {
  const look = SITE_LOOKS[name]?.theme ?? {};
  const colors: SiteColors = { ...look.colors, ...changes.colors };
  return {
    ...look,
    ...changes,
    ...(Object.keys(colors).length ? { colors } : {}),
  };
}
