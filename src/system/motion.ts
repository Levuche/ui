/*
 * Plain maths for the blocks that keep moving: the scrolling text strip and
 * the ring of words around the profile picture. No React, so it runs on a
 * server, in a browser or in a test, and the server and the browser draw the
 * same thing.
 */

/** The fewest seconds a pass or a turn may take, so nothing races past. */
export const MIN_MOTION_SECONDS = 5;

/**
 * Seconds for one pass or turn: `value` when it's a number of seconds, kept
 * to at least MIN_MOTION_SECONDS, otherwise `fallback`.
 */
export function motionSeconds(value: unknown, fallback: number): number {
  const seconds = Number(value);
  if (value === undefined || value === null || !Number.isFinite(seconds)) {
    return fallback;
  }
  return Math.max(MIN_MOTION_SECONDS, seconds);
}

/** The most times a strip draws its words in each half. */
export const MAX_STRIP_REPEATS = 20;

/**
 * How many times a scrolling strip draws its words in each half of its row,
 * so one half is at least as wide as the strip and the loop shows no gap.
 * Both widths are in px.
 */
export function stripRepeats(setWidth: number, viewWidth: number): number {
  if (!(setWidth > 0) || !(viewWidth > 0)) return 1;
  return Math.min(
    MAX_STRIP_REPEATS,
    Math.max(1, Math.ceil(viewWidth / setWidth))
  );
}

/** How a ring of words around a picture is drawn. All sizes in px. */
export type WordRingShape = {
  /** Width and height of the whole ring, picture included. */
  size: number;
  /** The circle the words sit on, from the middle. */
  radius: number;
  fontSize: number;
  /** The words, repeated to go round once, each time followed by the separator. */
  text: string;
  /** Length of the circle, which the words are spread to fill. */
  length: number;
  /** An SVG path for the circle, clockwise from the left, in a box of `size`. */
  path: string;
};

/** About how wide a letter is, for its font size, with the ring's spacing. */
const LETTER_WIDTH = 0.72;

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Lays out a ring of words around a picture `pictureSize` px wide: the font
 * size, how often the words go round, and the circle they sit on. The words
 * repeat to fill the circle, and very long words get smaller to fit once.
 */
export function wordRingShape(
  pictureSize: number,
  words: string,
  separator = '•'
): WordRingShape {
  const picture = Math.min(400, Math.max(32, Number(pictureSize) || 76));
  const radius = picture / 2 + 4;
  const length = 2 * Math.PI * radius;
  const once = `${words.replace(/\s+/g, ' ').trim()} ${separator.trim()} `;
  const wanted = Math.min(16, Math.max(10, picture * 0.14));
  // Shrink (down to 7 px) only when the words don't fit round once.
  const fontSize = round(
    Math.max(7, Math.min(wanted, length / (once.length * LETTER_WIDTH)))
  );
  const repeats = Math.max(
    1,
    Math.floor(length / (once.length * fontSize * LETTER_WIDTH))
  );
  // Capitals reach about 0.75 of the font size above the line.
  const size = 2 * Math.ceil(radius + fontSize * 0.8 + 2);
  const middle = size / 2;
  const r = round(radius);
  return {
    size,
    radius: r,
    fontSize,
    text: once.repeat(repeats).trimEnd(),
    length: round(length),
    path: `M ${round(middle - radius)} ${middle} a ${r} ${r} 0 1 1 ${round(
      2 * radius
    )} 0 a ${r} ${r} 0 1 1 ${round(-2 * radius)} 0`,
  };
}
