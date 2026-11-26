import { expect, test } from '@playwright/test';
import { youtubeId } from '../src/organisms/media';
import {
  isSafeColor,
  siteThemeAttributes,
  siteThemeStyle,
  type SiteTheme,
} from '../src/system/theme';

/* Plain checks of the helpers the page editor relies on. No browser. */

test('reads the video id from the YouTube addresses creators paste', () => {
  const id = 'M7lc1UVf-VE';
  for (const input of [
    id,
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&t=30s`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/live/${id}`,
  ]) {
    expect(youtubeId(input), input).toBe(id);
  }
  for (const input of [
    '',
    'not a video',
    'https://example.com/watch?v=M7lc1UVf-VE',
    'https://www.youtube.com/@channel',
    'https://youtu.be/short',
  ]) {
    expect(youtubeId(input), input).toBeNull();
  }
});

test('a theme only puts plain colours, shapes and fonts into CSS', () => {
  expect(isSafeColor('#0f766e')).toBe(true);
  expect(isSafeColor('rgb(15, 118, 110)')).toBe(true);
  expect(isSafeColor('oklch(0.6 0.1 180)')).toBe(true);
  expect(isSafeColor('red; background: url(x)')).toBe(false);
  expect(isSafeColor('url(https://example.com/x.png)')).toBe(false);

  const style = siteThemeStyle({
    colors: { accent: '#0f766e', text: 'expression(alert(1))' },
    corners: 'square',
    buttonShape: 'pill',
    font: "'Sora', sans-serif",
  }) as Record<string, string>;
  expect(style).toEqual({
    '--site-accent': '#0f766e',
    '--site-radius': '4px',
    '--site-button-radius': '9999px',
    '--site-font': "'Sora', sans-serif",
  });
  expect(
    siteThemeStyle({ font: 'x; } body { display: none' }) as Record<
      string,
      string
    >
  ).toEqual({});
});

test('a theme writes only known card styles and hovers', () => {
  expect(siteThemeAttributes({ cards: 'glass', hover: 'none' })).toEqual({
    'data-cards': 'glass',
    'data-hover': 'none',
  });
  // The defaults need no attribute.
  expect(siteThemeAttributes({ cards: 'flat', hover: 'lift' })).toEqual({});
  expect(siteThemeAttributes()).toEqual({});
  // Anything else a saved theme holds is dropped.
  const saved = { cards: 'url(x)', hover: '"><b>' } as unknown as SiteTheme;
  expect(siteThemeAttributes(saved)).toEqual({});
});
