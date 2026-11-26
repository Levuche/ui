import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  contributionCells,
  LOCAL_TIME_CITY_IDS,
  starFills,
  subHeading,
  yearlySaving,
} from '../src';
import { mediaWaits } from '../src/molecules/media-notice';
import { BLOCKS } from '../src/system/registry';
import { WORDS_DE } from '../src/system/words/de';
import { WORDS_EN } from '../src/system/words/en';
import { WORDS_ES } from '../src/system/words/es';
import { WORDS_FR } from '../src/system/words/fr';
import { WORDS_HI } from '../src/system/words/hi';
import { WORDS_PT } from '../src/system/words/pt';

/* The rules every block follows the same way: headings, loops, privacy,
   words. Plain checks, with no browser. */

const block = (id: string) => {
  const found = BLOCKS.find((b) => b.id === id);
  if (!found) throw new Error(`no block ${id}`);
  return found;
};

test('a title under a heading is one level down, and stops at h5', () => {
  expect(subHeading('h2')).toBe('h3');
  expect(subHeading('h3')).toBe('h4');
  expect(subHeading('h4')).toBe('h5');
  expect(subHeading('h5' as never)).toBe('p');
  expect(subHeading(undefined)).toBe('p');
});

test('blocks with a title let the app set its heading level', () => {
  for (const id of [
    'logo-strip',
    'image-carousel',
    'tile-gallery',
    'countdown',
    'newsletter-band',
  ]) {
    expect(block(id).appOnly, id).toContain('headingAs');
  }
});

test('the yearly saving comes from the prices, rounded down', () => {
  expect(yearlySaving('$10', '$100')).toBe(16);
  expect(yearlySaving('€12', '€120')).toBe(16);
  // Not a saving, or not comparable.
  expect(yearlySaving('$10', '$120')).toBeNull();
  expect(yearlySaving('$10', '€100')).toBeNull();
  expect(yearlySaving('Free', '$100')).toBeNull();
});

test('a part score fills part of a star', () => {
  expect(starFills(4.8)).toEqual([1, 1, 1, 1, 0.8]);
  expect(starFills(3.25)).toEqual([1, 1, 1, 0.3, 0]);
  expect(starFills(9)).toEqual([1, 1, 1, 1, 1]);
  expect(starFills(Number.NaN)).toEqual([0, 0, 0, 0, 0]);
});

test('a short first week starts late and a short last week ends early', () => {
  const cells = contributionCells([[1, 2], [1, 2, 3, 4, 5, 6, 7], [3]]);
  expect(cells[0]).toEqual([null, null, null, null, null, 1, 2]);
  expect(cells[1]).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(cells[2]).toEqual([3, null, null, null, null, null, null]);
  // One week alone starts on its first day.
  expect(contributionCells([[4]])[0]?.[0]).toBe(4);
});

test('a video on another site waits for consent; one on the page doesn’t', () => {
  expect(mediaWaits('https://cdn.example.com/a.mp4', false)).toBe(true);
  expect(mediaWaits('/clips/a.mp4', false)).toBe(false);
  expect(mediaWaits('https://cdn.example.com/a.mp4', undefined)).toBe(false);
  expect(mediaWaits('https://cdn.example.com/a.mp4', true)).toBe(false);
  for (const id of ['video-tile', 'tile-gallery']) {
    expect(block(id).privacy.services, id).toContain('video-host');
    expect(block(id).appOnly, id).toContain('consent');
  }
});

test('previews the app fetches and text the creator types say so', () => {
  for (const id of ['featured-link', 'logo-tile', 'link-chip', 'link-card']) {
    expect(block(id).privacy, id).toEqual(block('link-card').privacy);
  }
  expect(block('now-playing').privacy.services).toEqual([]);
});

test('every language names every LocalTime city and has the new words', () => {
  const all = {
    en: WORDS_EN,
    de: WORDS_DE,
    es: WORDS_ES,
    fr: WORDS_FR,
    pt: WORDS_PT,
    hi: WORDS_HI,
  };
  for (const [lang, words] of Object.entries(all)) {
    for (const id of LOCAL_TIME_CITY_IDS) {
      const name = (words.localTimeCities as Record<string, string>)[id];
      expect(name?.trim(), `${lang} ${id}`).toBeTruthy();
    }
    expect(words.props.reel, lang).toContain('{n}');
    expect(words.pricingTable.yearlySave, lang).toContain('{n}');
  }
});

/** Every source file, without comments. */
function sources(dir: URL): { file: string; text: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    if (entry.isDirectory()) return sources(url);
    if (!/\.(tsx?|css)$/.test(entry.name)) return [];
    const text = readFileSync(url, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    return [{ file: entry.name, text }];
  });
}

test('nothing moves forever without a pause button (WCAG 2.2.2)', () => {
  const files = sources(new URL('../src/', import.meta.url));
  let endless = 0;
  for (const { file, text } of files) {
    if (!/infinite/.test(text)) continue;
    if (file.endsWith('.css')) {
      // Keyframes only; a block opts in and brings its own pause button.
      expect(text, file).not.toMatch(/animation:[^;]*infinite/);
      continue;
    }
    endless++;
    expect(text, `${file} loops, so it has a pause button`).toMatch(
      /<MotionToggle\b/
    );
  }
  // The logo strip, the text strip and the word ring.
  expect(endless).toBe(3);
});
