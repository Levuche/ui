import {
  cleanBackground,
  type BackgroundFill,
  type BackgroundInk,
  type BlockBackground,
} from './background';
import type { BlockLook } from './look';
import { nameTint, type NameLook } from './name-style';
import { isSafeColor, type SiteColors, type SiteTheme } from './theme';

/*
 * Contrast checks for a creator's own colours. isSafeColor only says a colour
 * is a plain value; these say whether text on it can be read, by WCAG 2.2 AA:
 * 4.5:1 for text, 3:1 for buttons and other controls against the page.
 */

type ColorKey = keyof SiteColors;
type Rgba = { r: number; g: number; b: number; a: number };

/**
 * The colours each scheme starts from, as in tokens.css. A creator's colours
 * are laid over these, as CreatorTheme does. A test keeps the two in step.
 */
export const SCHEME_COLORS: Record<'light' | 'dark', Required<SiteColors>> = {
  light: {
    bg: '#ffffff',
    surface: '#fff4ec',
    surface2: '#ffe6d4',
    border: '#f1dfd2',
    text: '#1a1325',
    text2: '#4b4458',
    link: '#9a3412',
    accent: '#c2410c',
    onAccent: '#ffffff',
    band: '#c2410c',
    onBand: '#ffffff',
  },
  dark: {
    bg: '#0f1020',
    surface: '#1b1c33',
    surface2: '#2a2b4a',
    border: '#23244a',
    text: '#f4f4f8',
    text2: '#c2c3d8',
    link: '#ffb27a',
    accent: '#ff8a3d',
    onAccent: '#0f1020',
    band: '#ff8a3d',
    onBand: '#0f1020',
  },
};

/** Text needs 4.5:1; buttons and other controls need 3:1 against the page. */
export const TEXT_CONTRAST = 4.5;
export const CONTROL_CONTRAST = 3;

/** The pairs the blocks draw, foreground on background. */
const PAIRS: readonly {
  fg: ColorKey;
  bg: ColorKey;
  needed: number;
  label: string;
}[] = [
  { fg: 'text', bg: 'bg', needed: TEXT_CONTRAST, label: 'Text on the page' },
  { fg: 'text', bg: 'surface', needed: TEXT_CONTRAST, label: 'Text on cards' },
  {
    fg: 'text',
    bg: 'surface2',
    needed: TEXT_CONTRAST,
    label: 'Text on chips and inner panels',
  },
  {
    fg: 'text2',
    bg: 'bg',
    needed: TEXT_CONTRAST,
    label: 'Softer text on the page',
  },
  {
    fg: 'text2',
    bg: 'surface',
    needed: TEXT_CONTRAST,
    label: 'Softer text on cards',
  },
  { fg: 'link', bg: 'bg', needed: TEXT_CONTRAST, label: 'Links on the page' },
  { fg: 'link', bg: 'surface', needed: TEXT_CONTRAST, label: 'Links on cards' },
  {
    fg: 'onAccent',
    bg: 'accent',
    needed: TEXT_CONTRAST,
    label: 'Button text on the accent colour',
  },
  {
    fg: 'onBand',
    bg: 'band',
    needed: TEXT_CONTRAST,
    label: 'Text on the band colour',
  },
  {
    fg: 'accent',
    bg: 'bg',
    needed: CONTROL_CONTRAST,
    label: 'Buttons against the page',
  },
  {
    fg: 'accent',
    bg: 'surface',
    needed: CONTROL_CONTRAST,
    label: 'Buttons against cards',
  },
];

/** One pair of a theme's colours that's too faint to read. */
export type ContrastIssue = {
  /** What the pair is, in words a creator understands. */
  label: string;
  foreground: ColorKey;
  background: ColorKey;
  /** The pair's contrast now, to two decimals, such as 2.81. */
  ratio: number;
  /** What it needs: 4.5 for text, 3 for buttons. */
  needed: number;
  /** The colour to change: the one the creator chose, foreground first. */
  change: ColorKey;
  /** A nearby colour for `change`, same hue, that passes (#rrggbb). */
  suggestion: string;
};

/**
 * The pairs in a creator's theme that fail WCAG 2.2 AA, each with a nearby
 * colour that passes, for the theme editor to suggest. Empty when every pair
 * can be read. Colours that aren't plain values are ignored, as in
 * CreatorTheme, so the scheme's own colour is checked in their place.
 */
export function contrastIssues(theme: SiteTheme = {}): ContrastIssue[] {
  const scheme = theme.scheme === 'dark' ? 'dark' : 'light';
  const chosen = new Set<ColorKey>();
  const colors: Record<ColorKey, Rgba> = {} as Record<ColorKey, Rgba>;
  for (const key of Object.keys(SCHEME_COLORS[scheme]) as ColorKey[]) {
    const own = theme.colors?.[key];
    const parsed =
      typeof own === 'string' && isSafeColor(own) ? parseColor(own) : null;
    if (parsed) chosen.add(key);
    colors[key] = parsed ?? (parseColor(SCHEME_COLORS[scheme][key]) as Rgba);
  }
  // A see-through colour is seen over the page, and the page over white or
  // near-black, as the browser draws it.
  const base = scheme === 'dark' ? { r: 0, g: 0, b: 0, a: 1 } : WHITE;
  const page = over(colors.bg, base);

  const issues: ContrastIssue[] = [];
  for (const { fg, bg, needed, label } of PAIRS) {
    const back = bg === 'bg' ? page : over(colors[bg], page);
    const front = over(colors[fg], back);
    const ratio = contrast(front, back);
    if (ratio >= needed) continue;
    const change = chosen.has(fg) || !chosen.has(bg) ? fg : bg;
    const suggestion =
      change === fg
        ? nearestPassing(front, back, needed)
        : nearestPassing(back, front, needed);
    issues.push({
      label,
      foreground: fg,
      background: bg,
      ratio: Math.floor(ratio * 100) / 100,
      needed,
      change,
      suggestion,
    });
  }
  return issues;
}

/**
 * The theme with each faint pair changed to its suggestion, one at a time,
 * until every pair can be read: what an editor's "Fix all" would save. A
 * colour the creator chose changes only as far as it must.
 */
export function fixContrast(theme: SiteTheme = {}): SiteTheme {
  let fixed: SiteTheme = { ...theme, colors: { ...theme.colors } };
  // Each step fixes one pair; a change can't undo an earlier one more than a
  // few times, so this always ends.
  for (let step = 0; step < 20; step++) {
    const [issue] = contrastIssues(fixed);
    if (!issue) break;
    fixed = {
      ...fixed,
      colors: { ...fixed.colors, [issue.change]: issue.suggestion },
    };
  }
  return fixed;
}

/**
 * The WCAG contrast ratio of two plain colours, from 1 to 21, or null when
 * either isn't one. A see-through foreground is laid over the background.
 */
export function contrastRatio(foreground: string, background: string) {
  const fg = isSafeColor(foreground) ? parseColor(foreground) : null;
  const bg = isSafeColor(background) ? parseColor(background) : null;
  if (!fg || !bg) return null;
  const back = over(bg, WHITE);
  return contrast(over(fg, back), back);
}

/**
 * A plain colour as #rrggbb, for a player that takes its colour as hex, or
 * null when it isn't one. A see-through colour is read as if over white.
 */
export function colorHex(value: string): string | null {
  const color = isSafeColor(value) ? parseColor(value) : null;
  return color ? toHex(over(color, WHITE)) : null;
}

/* ---------- A block's own background ---------- */

/** One way a block's background makes its words hard to read. */
export type BackgroundIssue = {
  /** What can't be read, in words a creator understands. */
  label: string;
  /** The contrast at its worst, to two decimals. */
  ratio: number;
  /** What it needs: 4.5, as for any text. */
  needed: number;
  /**
   * The background changed only as far as it must to pass, where a change
   * can: a stronger layer over a picture, or a fainter pattern. A gradient's
   * colours are the creator's to pick again.
   */
  suggestion?: BlockBackground;
};

const FILL_NAMES: Record<BackgroundFill, string> = {
  bg: 'page',
  surface: 'card',
  surface2: 'panel',
  border: 'line',
  accent: 'accent',
  band: 'band',
};

/** The notice tone's colours, as in tokens.css. A theme doesn't change them. */
const NOTICE = { fill: '#fff4dc', text: '#3d2a00' };

type BlockPalette = {
  /** The tone's fill: the colour behind the words, and over a picture. */
  fill: Rgba;
  /** The block's text colours, each with a name for the creator. */
  texts: [string, Rgba][];
  /** A theme colour as it reads inside the block's tone. */
  color: (key: BackgroundFill | BackgroundInk) => Rgba;
};

/** `share` of `top` laid over `under`. */
const mix = (top: Rgba, share: number, under: Rgba) =>
  over({ ...top, a: share }, under);

/**
 * The colours inside a block: the scheme's, the creator's theme over them,
 * the block's own colours over those, then swapped by the tone as tokens.css
 * swaps them. Every colour is opaque, laid over the page.
 */
function blockPalette(
  theme: SiteTheme,
  look: Pick<BlockLook, 'tone' | 'colors'>
): BlockPalette {
  const scheme = theme.scheme === 'dark' ? 'dark' : 'light';
  const base = scheme === 'dark' ? { r: 0, g: 0, b: 0, a: 1 } : WHITE;
  const read = (value: unknown) =>
    typeof value === 'string' && isSafeColor(value) ? parseColor(value) : null;
  const raw = {} as Record<ColorKey, Rgba>;
  for (const key of Object.keys(SCHEME_COLORS[scheme]) as ColorKey[]) {
    raw[key] =
      read(look.colors?.[key]) ??
      read(theme.colors?.[key]) ??
      (parseColor(SCHEME_COLORS[scheme][key]) as Rgba);
  }
  const page = over(raw.bg, base);
  const c = {} as Record<ColorKey, Rgba>;
  for (const key of Object.keys(raw) as ColorKey[]) {
    c[key] = key === 'bg' ? page : over(raw[key], page);
  }
  const plain = (fill: Rgba): BlockPalette => ({
    fill,
    texts: [
      ['Text', c.text],
      ['Softer text', c.text2],
    ],
    color: (key) => c[key],
  });
  const strong = (fill: Rgba, on: Rgba, line: number, panel: number) => ({
    fill,
    texts: [['Text', on]] as [string, Rgba][],
    color: (key: BackgroundFill | BackgroundInk) =>
      key === 'surface'
        ? fill
        : key === 'text' || key === 'text2' || key === 'link'
          ? on
          : key === 'border'
            ? mix(on, line, fill)
            : key === 'surface2'
              ? mix(on, panel, fill)
              : c[key],
  });
  switch (look.tone) {
    case 'muted':
      return plain(mix(c.text, 0.06, c.bg));
    case 'inset':
      return plain(mix(c.text, 0.08, c.bg));
    case 'outline':
    case 'plain':
      return plain(c.bg);
    case 'accent':
      return strong(c.accent, c.onAccent, 0.35, 0.16);
    case 'band':
      return strong(c.band, c.onBand, 0.35, 0.16);
    case 'notice':
      return strong(
        parseColor(NOTICE.fill) as Rgba,
        parseColor(NOTICE.text) as Rgba,
        0.3,
        0.12
      );
    default:
      return plain(c.surface);
  }
}

/**
 * Text on a picture under a layer of `fill` at `dim` percent, against the
 * worst picture there could be. Any pixel lands between the layer over black
 * and the layer over white; if the text's own lightness is in that range,
 * some picture hides it.
 */
function pictureRatio(text: Rgba, fill: Rgba, dim: number) {
  const dark = mix(fill, dim / 100, { r: 0, g: 0, b: 0, a: 1 });
  const light = mix(fill, dim / 100, WHITE);
  const lum = luminance(text);
  if (lum >= luminance(dark) && lum <= luminance(light)) return 1;
  return Math.min(contrast(text, dark), contrast(text, light));
}

/** Text on a pattern's lines: the ink at `opacity` percent over the fill. */
function patternRatio(
  text: Rgba,
  block: BlockPalette,
  ink: Rgba,
  opacity: number
) {
  return Math.min(
    contrast(text, block.fill),
    contrast(text, mix(ink, opacity / 100, block.fill))
  );
}

/**
 * Whether the words in a block can be read on its background, by WCAG 2.2 AA,
 * in the page's theme: every gradient colour, the lines of a pattern, and
 * any picture under its dim layer. Empty when everything can be read, or the
 * block has no background. Each issue for a picture or pattern carries the
 * smallest change that passes, for the editor to suggest.
 */
export function backgroundIssues(
  look: Pick<BlockLook, 'background' | 'tone' | 'colors'>,
  theme: SiteTheme = {}
): BackgroundIssue[] {
  const clean = cleanBackground(look.background);
  if (!clean) return [];
  const block = blockPalette(theme, look);
  const round = (ratio: number) => Math.floor(ratio * 100) / 100;
  const issues: BackgroundIssue[] = [];

  if (clean.type === 'gradient') {
    for (const stop of new Set(clean.stops)) {
      for (const [label, text] of block.texts) {
        const ratio = contrast(text, block.color(stop));
        if (ratio >= TEXT_CONTRAST) continue;
        issues.push({
          label: `${label} on the gradient's ${FILL_NAMES[stop]} colour`,
          ratio: round(ratio),
          needed: TEXT_CONTRAST,
        });
      }
    }
    return issues;
  }

  const ratioAt = (text: Rgba, value: number) =>
    clean.type === 'pattern'
      ? patternRatio(text, block, block.color(clean.color), value)
      : pictureRatio(text, block.fill, value);
  const passes = (value: number) =>
    block.texts.every(([, text]) => ratioAt(text, value) >= TEXT_CONTRAST);
  // A picture needs a stronger layer; a pattern, fainter lines.
  const current = clean.type === 'pattern' ? clean.opacity : clean.dim;
  const steps =
    clean.type === 'pattern'
      ? Array.from({ length: current }, (_, i) => current - i)
      : Array.from({ length: 101 - current }, (_, i) => current + i);
  const value = steps.find(passes);
  const suggestion: BlockBackground | undefined =
    value === undefined
      ? undefined
      : clean.type === 'pattern'
        ? { ...clean, opacity: value }
        : { ...clean, dim: value };
  const where = clean.type === 'pattern' ? 'the pattern' : 'the picture';
  for (const [label, text] of block.texts) {
    const ratio = ratioAt(text, current);
    if (ratio >= TEXT_CONTRAST) continue;
    issues.push({
      label: `${label} on ${where}`,
      ratio: round(ratio),
      needed: TEXT_CONTRAST,
      ...(suggestion ? { suggestion } : {}),
    });
  }
  return issues;
}

/**
 * The block's background with the change backgroundIssues suggests, so its
 * words can be read: what an editor's "Fix" would save. Unchanged when it
 * already passes or no change to it can help (a gradient's colours, or a
 * tone whose own colours fail; see contrastIssues).
 */
export function fixBackground(
  look: Pick<BlockLook, 'background' | 'tone' | 'colors'>,
  theme: SiteTheme = {}
): BlockBackground | undefined {
  const fix = backgroundIssues(look, theme).find((issue) => issue.suggestion);
  return fix?.suggestion ?? look.background;
}

/* ---------- A name in its own colour ---------- */

/** A name or heading whose own colour is too faint on its block. */
export type NameColorIssue = {
  /** The contrast now, to two decimals. */
  ratio: number;
  /** What it needs: 4.5, as for any text. */
  needed: number;
  /** The theme's text colour passes there, so the editor can offer it. */
  suggestion?: 'text';
};

/**
 * Whether a name in its own colour (CreatorHeader `nameColor` or `nameTint`,
 * SectionHeading `titleColor` or `titleTint`) can be read on its block, in
 * the page's theme and the block's tone and colours, by WCAG 2.2 AA. Null
 * when it can. It asks for 4.5:1 even for a large name, so the name stays
 * readable at every size. The block's background is checked on its own, by
 * backgroundIssues.
 */
export function nameColorIssue(
  name: Pick<NameLook, 'color' | 'tint'>,
  look: Pick<BlockLook, 'tone' | 'colors'> = {},
  theme: SiteTheme = {}
): NameColorIssue | null {
  const block = blockPalette(theme, look);
  const tint = nameTint(name.tint);
  const own = tint ? parseColor(tint) : null;
  // A colour isSafeColor lets through but this can't measure: no warning.
  if (tint && !own) return null;
  const key =
    name.color === 'accent' || name.color === 'link' ? name.color : 'text';
  const ink = own ? over(own, block.fill) : block.color(key);
  const ratio = contrast(ink, block.fill);
  if (ratio >= TEXT_CONTRAST) return null;
  const text = contrast(block.color('text'), block.fill) >= TEXT_CONTRAST;
  return {
    ratio: Math.floor(ratio * 100) / 100,
    needed: TEXT_CONTRAST,
    ...(text ? { suggestion: 'text' as const } : {}),
  };
}

/* ---------- Colour maths ---------- */

const WHITE: Rgba = { r: 1, g: 1, b: 1, a: 1 };

/** Reads hex, rgb(a), hsl(a) and oklch, as isSafeColor lets through. */
function parseColor(value: string): Rgba | null {
  const text = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,8})$/.exec(text)?.[1];
  if (hex) {
    if (![3, 4, 6, 8].includes(hex.length)) return null;
    const full =
      hex.length < 6 ? [...hex].map((digit) => digit + digit).join('') : hex;
    const byte = (at: number) => parseInt(full.slice(at, at + 2), 16) / 255;
    return {
      r: byte(0),
      g: byte(2),
      b: byte(4),
      a: full.length === 8 ? byte(6) : 1,
    };
  }
  const call = /^(rgba?|hsla?|oklch)\(([^)]*)\)$/.exec(text);
  if (!call) return null;
  const [, fn = '', body = ''] = call;
  const [main = '', slashAlpha] = body.split('/');
  const parts = main.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 4 && slashAlpha === undefined) {
    // The old comma form: rgba(r, g, b, a).
    return withAlpha(readCall(fn, parts.slice(0, 3)), parts[3]);
  }
  if (parts.length !== 3) return null;
  return withAlpha(readCall(fn, parts), slashAlpha?.trim());
}

function withAlpha(color: Rgba | null, alpha: string | undefined) {
  if (!color) return null;
  if (alpha === undefined) return color;
  const a = number(alpha, 1);
  return a === null ? null : { ...color, a: clamp(a) };
}

/** A number, or a percentage of `full`. */
function number(part: string | undefined, full: number) {
  if (part === undefined) return null;
  const value = parseFloat(part);
  if (!Number.isFinite(value)) return null;
  return part.endsWith('%') ? (value / 100) * full : value;
}

function readCall(fn: string, parts: string[]): Rgba | null {
  if (fn.startsWith('rgb')) {
    const [r, g, b] = parts.map((part) => number(part, 255));
    if (r == null || g == null || b == null) return null;
    return { r: clamp(r / 255), g: clamp(g / 255), b: clamp(b / 255), a: 1 };
  }
  if (fn.startsWith('hsl')) {
    const h = number(parts[0], 360);
    const s = number(parts[1], 1);
    const l = number(parts[2], 1);
    if (h == null || s == null || l == null) return null;
    return { ...hslToRgb(h, clamp(s), clamp(l)), a: 1 };
  }
  const l = number(parts[0], 1);
  const c = number(parts[1], 0.4);
  const h = number(parts[2], 360);
  if (l == null || c == null || h == null) return null;
  return { ...gamut(clamp(l), Math.max(0, c), h), a: 1 };
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function hslToRgb(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: f(0), g: f(8), b: f(4) };
}

/** `top` drawn over an opaque `under`. */
function over(top: Rgba, under: Rgba): Rgba {
  if (top.a >= 1) return top;
  const mix = (a: number, b: number) => a * top.a + b * (1 - top.a);
  return {
    r: mix(top.r, under.r),
    g: mix(top.g, under.g),
    b: mix(top.b, under.b),
    a: 1,
  };
}

function toLinear(channel: number) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function fromLinear(channel: number) {
  return channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function luminance({ r, g, b }: Rgba) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrast(a: Rgba, b: Rgba) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (high + 0.05) / (low + 0.05);
}

/** sRGB to OKLCH: lightness 0 to 1, chroma, hue in degrees. */
function toOklch({ r, g, b }: Rgba) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  );
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: (Math.atan2(B, A) * 180) / Math.PI };
}

/** OKLCH to linear sRGB, which may fall outside 0 to 1. */
function oklchToLinear(L: number, C: number, h: number) {
  const A = C * Math.cos((h * Math.PI) / 180);
  const B = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ] as const;
}

/** The OKLCH colour, with its chroma lowered until sRGB can show it. */
function gamut(L: number, C: number, h: number): Rgba {
  const fits = (c: number) =>
    oklchToLinear(L, c, h).every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  let chroma = C;
  if (!fits(chroma)) {
    let low = 0;
    let high = chroma;
    for (let step = 0; step < 24; step++) {
      const mid = (low + high) / 2;
      if (fits(mid)) low = mid;
      else high = mid;
    }
    chroma = low;
  }
  const [r, g, b] = oklchToLinear(L, chroma, h).map((v) =>
    clamp(fromLinear(clamp(v)))
  ) as [number, number, number];
  return { r, g, b, a: 1 };
}

function toHex({ r, g, b }: Rgba) {
  return `#${[r, g, b]
    .map((v) =>
      Math.round(clamp(v) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

/**
 * The colour nearest `color` in lightness, same hue, whose contrast with
 * `against` reaches `needed`. It tries darker and lighter and keeps the
 * smaller change; if neither can pass, the one that comes closest.
 */
function nearestPassing(color: Rgba, against: Rgba, needed: number) {
  const { L, C, h } = toOklch(color);
  // Aim a little past the line, so rounding to #rrggbb can't drop below it.
  const target = needed + 0.05;
  const passes = (l: number) => contrast(gamut(l, C, h), against) >= target;
  const search = (end: number) => {
    if (!passes(end)) return null;
    let near = L;
    let far = end;
    for (let step = 0; step < 30; step++) {
      const mid = (near + far) / 2;
      if (passes(mid)) far = mid;
      else near = mid;
    }
    return far;
  };
  const options = [search(0), search(1)].filter((l): l is number => l !== null);
  if (options.length) {
    const best = options.reduce((a, b) =>
      Math.abs(a - L) <= Math.abs(b - L) ? a : b
    );
    return toHex(gamut(best, C, h));
  }
  const black = gamut(0, C, h);
  const white = gamut(1, C, h);
  return toHex(
    contrast(black, against) >= contrast(white, against) ? black : white
  );
}
