import { expect, test } from '@playwright/test';
import { qrEncode, qrSvg } from '../src/organisms/qr-code';

/* QR codes: real codes from the block's encoder, checked by their shape. */

/** The 7 by 7 corner square a scanner looks for, at row y, column x. */
function hasFinder(m: boolean[][], y: number, x: number) {
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 7; c++) {
      const ring = r === 0 || r === 6 || c === 0 || c === 6;
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      if (m[y + r][x + c] !== (ring || core)) return false;
    }
  return true;
}

test('a link becomes a square code with three corner squares', () => {
  const m = qrEncode('https://levuche.com/desi-origins');
  const n = m.length;
  // Sizes go 21, 25, 29 … squares; this link needs the third.
  expect(n).toBe(29);
  for (const row of m) expect(row).toHaveLength(n);
  expect(hasFinder(m, 0, 0)).toBe(true);
  expect(hasFinder(m, 0, n - 7)).toBe(true);
  expect(hasFinder(m, n - 7, 0)).toBe(true);
});

test('any language fits, and a higher level makes a denser code', () => {
  const text = 'नमस्ते 👋 café';
  expect(qrEncode(text, 'H').length).toBeGreaterThan(
    qrEncode(text, 'L').length
  );
});

test('empty or too long text gives no code', () => {
  expect(qrEncode('')).toEqual([]);
  expect(qrEncode('x'.repeat(3000))).toEqual([]);
  // Fits at L, too long at H.
  expect(qrEncode('x'.repeat(2500), 'L').length).toBeGreaterThan(0);
  expect(qrEncode('x'.repeat(2500), 'H')).toEqual([]);
});

test('the SVG keeps a quiet border and escapes its title', () => {
  const m = qrEncode('hi');
  const svg = qrSvg(m, { title: 'a<b' });
  expect(svg).toContain(`viewBox="0 0 ${m.length + 8} ${m.length + 8}"`);
  expect(svg).toContain('<title>a&#60;b</title>');
});
