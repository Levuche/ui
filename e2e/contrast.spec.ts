import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  SCHEME_COLORS,
  contrastIssues,
  contrastRatio,
  fixContrast,
} from '../src/system/contrast';
import { THEMES } from '../stories/themes';

/* Plain checks of the contrast warnings the theme editor shows. No browser. */

test('measures contrast as WCAG does', () => {
  expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  expect(contrastRatio('#fff', '#fff')).toBeCloseTo(1, 5);
  // #767676 is the lightest grey that passes 4.5:1 on white.
  expect(contrastRatio('#767676', '#ffffff')!).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio('#777777', '#ffffff')!).toBeLessThan(4.5);
  // The same colour in each form isSafeColor lets through.
  for (const red of [
    '#f00',
    '#ff0000',
    '#ff0000ff',
    'rgb(255, 0, 0)',
    'rgb(255 0 0 / 1)',
    'rgba(255,0,0,1)',
    'hsl(0, 100%, 50%)',
    'oklch(0.628 0.2577 29.23)',
  ]) {
    expect(contrastRatio(red, '#ffffff')!, red).toBeCloseTo(4, 1);
  }
  // See-through text is seen over its background.
  expect(contrastRatio('rgba(0, 0, 0, 0)', '#ffffff')).toBeCloseTo(1, 5);
  expect(contrastRatio('red; x', '#fff')).toBeNull();
});

test('the sample creator themes can all be read', () => {
  expect(contrastIssues({ scheme: 'light' })).toEqual([]);
  expect(contrastIssues({ scheme: 'dark' })).toEqual([]);
  expect(contrastIssues()).toEqual([]);
});

test('the scheme colours match tokens.css', () => {
  const css = readFileSync(
    new URL('../src/tokens.css', import.meta.url),
    'utf8'
  );
  const VARS: Record<string, string> = {
    bg: 'bg',
    surface: 'surface',
    surface2: 'surface-2',
    border: 'border',
    text: 'text',
    text2: 'text-2',
    link: 'link',
    accent: 'accent',
    onAccent: 'on-accent',
    band: 'band',
    onBand: 'on-band',
  };
  for (const scheme of ['light', 'dark'] as const) {
    const block = new RegExp(
      `\\[data-site='${scheme}'\\][^{]*\\{([^}]*)\\}`
    ).exec(css)?.[1];
    expect(block, scheme).toBeTruthy();
    for (const [key, name] of Object.entries(VARS)) {
      const value = new RegExp(`--site-${name}:\\s*([^;]+);`).exec(block!)?.[1];
      expect(value, `${scheme} ${key}`).toBe(
        SCHEME_COLORS[scheme][key as keyof (typeof SCHEME_COLORS)['light']]
      );
    }
  }
});

test('names each faint pair and suggests a nearby colour that passes', () => {
  const issues = contrastIssues({
    scheme: 'light',
    colors: { accent: '#fbbf24', onAccent: '#ffffff', text2: '#a1a1aa' },
  });
  const pairs = issues.map(
    (issue) => `${issue.foreground}/${issue.background}`
  );
  expect(pairs).toEqual([
    'text2/bg',
    'text2/surface',
    'onAccent/accent',
    'accent/bg',
    'accent/surface',
  ]);
  for (const issue of issues) {
    expect(issue.ratio).toBeLessThan(issue.needed);
    expect(issue.label).not.toBe('');
    // The suggestion, put in place of the colour to change, passes.
    const fixed = contrastIssues({
      scheme: 'light',
      colors: {
        accent: '#fbbf24',
        onAccent: '#ffffff',
        text2: '#a1a1aa',
        [issue.change]: issue.suggestion,
      },
    });
    expect(
      fixed.some(
        (other) =>
          other.foreground === issue.foreground &&
          other.background === issue.background
      ),
      issue.label
    ).toBe(false);
  }
  const button = issues.find((issue) => issue.foreground === 'onAccent')!;
  expect(button).toMatchObject({ needed: 4.5, change: 'onAccent' });
  expect(issues.find((issue) => issue.foreground === 'accent')).toMatchObject({
    needed: 3,
    change: 'accent',
  });
});

test('suggests changing the colour the creator chose', () => {
  // Only the page colour is the creator's: suggest a page colour, not text.
  const [issue] = contrastIssues({ colors: { bg: '#4b4458' } });
  expect(issue).toMatchObject({
    foreground: 'text',
    background: 'bg',
    change: 'bg',
  });
  expect(contrastRatio('#1a1325', issue!.suggestion)!).toBeGreaterThanOrEqual(
    4.5
  );
});

test('ignores colours that are not plain values, as CreatorTheme does', () => {
  expect(
    contrastIssues({ colors: { text: 'url(x)', accent: 'expression(1)' } })
  ).toEqual([]);
});

test('fixes every faint pair at once, changing only what it must', () => {
  const theme = {
    scheme: 'dark' as const,
    colors: { accent: '#3730a3', onAccent: '#4338ca', link: '#1e3a8a' },
    corners: 'round' as const,
  };
  const fixed = fixContrast(theme);
  expect(contrastIssues(theme).length).toBeGreaterThan(0);
  expect(contrastIssues(fixed)).toEqual([]);
  expect(fixed.corners).toBe('round');
  expect(fixed.colors?.text).toBeUndefined();
  // An already readable theme comes back as it was.
  expect(fixContrast({ scheme: 'light' })).toEqual({
    scheme: 'light',
    colors: {},
  });
});

test('the story themes can all be read', () => {
  for (const { theme } of Object.values(THEMES)) {
    expect(contrastIssues(theme)).toEqual([]);
  }
});
