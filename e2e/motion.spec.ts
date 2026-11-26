import { expect, test } from '@playwright/test';
import { BLOCK_EFFECTS, lookProps, splitLook } from '../src/system/look';
import {
  MAX_STRIP_REPEATS,
  MIN_MOTION_SECONDS,
  motionSeconds,
  stripRepeats,
  wordRingShape,
} from '../src/system/motion';
import { BLOCKS } from '../src/system/registry';

/* Plain checks of motion inside blocks. No browser. */

test('a block’s effect is written on it, and an unknown one is dropped', () => {
  for (const effect of BLOCK_EFFECTS) {
    const props = lookProps('booking-card', { effect });
    expect(props['data-effect']).toBe(effect === 'none' ? undefined : effect);
  }
  const typed = { effect: 'spin' } as unknown as { effect: 'float' };
  expect(lookProps('booking-card', typed)['data-effect']).toBeUndefined();
  expect(
    lookProps('booking-card', {}, { effect: 'pulse' })['data-effect']
  ).toBe('pulse');
  // effect is part of the look, so a block doesn't pass it to its element.
  const [look, rest] = splitLook({ effect: 'float', id: 'x' } as const);
  expect(look).toEqual({ effect: 'float' });
  expect(rest).toEqual({ id: 'x' });
});

test('speeds are kept to at least five seconds', () => {
  expect(MIN_MOTION_SECONDS).toBe(5);
  expect(motionSeconds(undefined, 16)).toBe(16);
  expect(motionSeconds('fast', 16)).toBe(16);
  expect(motionSeconds(Number.NaN, 16)).toBe(16);
  expect(motionSeconds(1, 16)).toBe(5);
  expect(motionSeconds(-3, 16)).toBe(5);
  expect(motionSeconds(30, 16)).toBe(30);
  expect(motionSeconds('12', 16)).toBe(12);
});

test('a scrolling strip repeats its words to fill its width', () => {
  expect(stripRepeats(300, 300)).toBe(1);
  expect(stripRepeats(400, 300)).toBe(1);
  expect(stripRepeats(100, 350)).toBe(4);
  expect(stripRepeats(1, 10_000)).toBe(MAX_STRIP_REPEATS);
  // Not measured yet, as on the server: once.
  expect(stripRepeats(0, 300)).toBe(1);
  expect(stripRepeats(300, 0)).toBe(1);
});

test('a ring of words goes round the picture, outside it', () => {
  const ring = wordRingShape(76, 'Chai • Stories • Since 2019');
  expect(ring.radius).toBeGreaterThan(76 / 2);
  expect(ring.size).toBeGreaterThan(76 + 2 * ring.fontSize);
  expect(ring.fontSize).toBeGreaterThanOrEqual(10);
  expect(ring.length).toBeCloseTo(2 * Math.PI * ring.radius, 1);
  expect(ring.text.startsWith('Chai • Stories • Since 2019 •')).toBe(true);
  // The path is a circle round the middle of the ring's box.
  expect(ring.path).toMatch(/^M [\d.]+ [\d.]+ a [\d.]+ [\d.]+ 0 1 1 /);
  expect(ring.size / 2 - ring.radius).toBeCloseTo(
    Number(ring.path.split(' ')[1]),
    1
  );

  // Short words repeat to fill the circle; long ones get smaller to fit.
  const short = wordRingShape(120, 'Chai');
  expect(short.text.split('Chai').length - 1).toBeGreaterThan(2);
  const long = wordRingShape(48, 'A very long line of words '.repeat(6));
  expect(long.fontSize).toBeLessThan(10);
  expect(long.fontSize).toBeGreaterThanOrEqual(7);
  expect(long.text.split('A very long').length - 1).toBe(6);

  // The same words always draw the same ring, on the server and in a browser.
  expect(wordRingShape(76, 'Chai')).toEqual(wordRingShape(76, 'Chai'));
  // A picture size that makes no sense falls back to something sensible.
  expect(wordRingShape(Number.NaN, 'Chai').size).toBeGreaterThan(76);
});

test('the scrolling text strip is in the registry', () => {
  expect(BLOCKS.find((block) => block.id === 'text-strip')).toMatchObject({
    component: 'TextStrip',
    kind: 'band',
    client: true,
  });
});
