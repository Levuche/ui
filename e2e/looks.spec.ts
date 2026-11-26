import { expect, test } from '@playwright/test';
import { contrastIssues } from '../src/system/contrast';
import { SITE_LOOKS, SITE_LOOK_NAMES, siteLook } from '../src/system/looks';
import {
  SITE_CARD_STYLES,
  SITE_HOVERS,
  isSafeColor,
  isSafeFont,
  siteThemeStyle,
} from '../src/system/theme';

/* Plain checks of the ready-made looks. No browser. */

test('every look can be read and uses only safe values', () => {
  expect(SITE_LOOK_NAMES).toEqual(Object.keys(SITE_LOOKS));
  for (const name of SITE_LOOK_NAMES) {
    const { theme, title, summary } = SITE_LOOKS[name];
    expect(contrastIssues(theme), name).toEqual([]);
    expect(title.length, name).toBeGreaterThan(0);
    expect(summary.length, name).toBeGreaterThan(0);
    for (const [key, value] of Object.entries(theme.colors ?? {})) {
      expect(isSafeColor(value), `${name} ${key}`).toBe(true);
    }
    for (const font of [theme.font, theme.displayFont]) {
      if (font) expect(isSafeFont(font), `${name} font`).toBe(true);
    }
    expect(SITE_CARD_STYLES).toContain(theme.cards);
    expect(SITE_HOVERS).toContain(theme.hover);
    // Every colour gets through to the page as a variable.
    const style = siteThemeStyle(theme) as Record<string, string>;
    expect(
      Object.keys(style).filter((key) => key.startsWith('--site-')).length,
      name
    ).toBeGreaterThanOrEqual(Object.keys(theme.colors ?? {}).length);
  }
});

test('siteLook lays a creator’s changes over a look, colour by colour', () => {
  const night = SITE_LOOKS.night.theme;
  const mine = siteLook('night', {
    colors: { accent: '#f472b6' },
    corners: 'square',
  });
  expect(mine.colors?.accent).toBe('#f472b6');
  expect(mine.colors?.bg).toBe(night.colors?.bg);
  expect(mine.corners).toBe('square');
  expect(mine.cards).toBe(night.cards);
  expect(mine.scheme).toBe('dark');
  // The look itself is left as it was.
  expect(SITE_LOOKS.night.theme.colors?.accent).toBe('#a78bfa');
  expect(siteLook('clean')).toEqual(SITE_LOOKS.clean.theme);
});
