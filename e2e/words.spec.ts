import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import * as ui from '../src';
import { PAGE_SETTINGS, settingDefaults } from '../src/system/settings';
import {
  PAGE_LANGUAGES,
  loadPageWords,
  mergeWords,
  pageWordsLanguage,
  safeLanguage,
} from '../src/system/language';
import { WORDS_DE } from '../src/system/words/de';
import { WORDS_EN, type PageWords } from '../src/system/words/en';
import { WORDS_ES } from '../src/system/words/es';
import { WORDS_FR } from '../src/system/words/fr';
import { WORDS_HI } from '../src/system/words/hi';
import { WORDS_PT } from '../src/system/words/pt';

/* The page's language and its word sets. No browser. */

const SETS: Record<string, PageWords> = {
  hi: WORDS_HI,
  es: WORDS_ES,
  de: WORDS_DE,
  fr: WORDS_FR,
  pt: WORDS_PT,
};

const braces = (words: string) => (words.match(/\{\w+\}/g) ?? []).sort();

test('there is a word set for every ready language', () => {
  expect([...PAGE_LANGUAGES].sort()).toEqual(
    ['en', ...Object.keys(SETS)].sort()
  );
});

for (const [language, set] of Object.entries(SETS)) {
  test(`${language} has every word English has, with the same {braces}`, () => {
    expect(Object.keys(set)).toEqual(Object.keys(WORDS_EN));
    for (const [group, english] of Object.entries(WORDS_EN)) {
      const words = set[group as keyof PageWords] as Record<string, string>;
      expect(Object.keys(words), `${language}.${group}`).toEqual(
        Object.keys(english)
      );
      for (const [key, text] of Object.entries(english)) {
        const word = words[key];
        expect(typeof word, `${language}.${group}.${key}`).toBe('string');
        expect(
          word.trim().length,
          `${language}.${group}.${key}`
        ).toBeGreaterThan(0);
        expect(braces(word), `${language}.${group}.${key}`).toEqual(
          braces(text as string)
        );
      }
    }
  });
}

test('each block’s English labels are the English word set', () => {
  const blocks: [keyof PageWords, unknown][] = [
    ['copy', ui.COPY_LABELS],
    ['emailForm', ui.EMAIL_FORM_LABELS],
    ['liveData', ui.LIVE_DATA_LABELS],
    ['audioBar', ui.AUDIO_BAR_LABELS],
    ['sell', ui.SELL_LABELS],
    ['creditPack', ui.CREDIT_PACK_LABELS],
    ['slotPicker', ui.SLOT_PICKER_LABELS],
    ['tipJar', ui.TIP_JAR_LABELS],
    ['countdown', ui.COUNTDOWN_LABELS],
    ['carousel', ui.CAROUSEL_LABELS],
    ['beforeAfter', ui.BEFORE_AFTER_LABELS],
    ['contactForm', ui.CONTACT_FORM_LABELS],
    ['messageCard', ui.MESSAGE_CARD_LABELS],
    ['mapCard', ui.MAP_CARD_LABELS],
    ['lockedLink', ui.LOCKED_LINK_LABELS],
    ['courseCard', ui.COURSE_CARD_LABELS],
    ['topPicks', ui.TOP_PICKS_LABELS],
    ['pricingTable', ui.PRICING_TABLE_LABELS],
    ['bookingEmbed', ui.BOOKING_EMBED_LABELS],
    ['github', ui.GITHUB_LABELS],
    ['contributions', ui.CONTRIBUTION_LABELS],
    ['repo', ui.REPO_LABELS],
    ['package', ui.PACKAGE_LABELS],
    ['embed', ui.EMBED_LABELS],
    ['liveStatus', ui.LIVE_STATUS_LABELS],
    ['eventList', ui.EVENT_LIST_LABELS],
    ['reviewSummary', ui.REVIEW_SUMMARY_LABELS],
    ['nowPlaying', ui.NOW_PLAYING_LABELS],
  ];
  for (const [group, labels] of blocks) {
    expect(labels, group).toEqual(WORDS_EN[group]);
  }
});

test('only language tags a browser understands get through', () => {
  expect(safeLanguage('hi')).toBe('hi');
  expect(safeLanguage(' PT-br ')).toBe('pt-BR');
  expect(safeLanguage('es-419')).toBe('es-419');
  for (const bad of [
    '',
    'english',
    'x',
    'hi_IN',
    '"><script>',
    'javascript:',
  ]) {
    expect(safeLanguage(bad), bad).toBeUndefined();
  }
  expect(safeLanguage(42)).toBeUndefined();
  expect(safeLanguage(undefined)).toBeUndefined();
});

test('a regional language uses its language’s words; others use English', () => {
  expect(pageWordsLanguage('hi-IN')).toBe('hi');
  expect(pageWordsLanguage('pt-BR')).toBe('pt');
  expect(pageWordsLanguage('fr-CA')).toBe('fr');
  expect(pageWordsLanguage('ja')).toBe('en');
  expect(pageWordsLanguage('not a tag')).toBe('en');
  expect(pageWordsLanguage(undefined)).toBe('en');
});

test('loads only the words a page asks for', async () => {
  expect(await loadPageWords('hi-IN')).toBe(WORDS_HI);
  expect(await loadPageWords('de')).toBe(WORDS_DE);
  expect(await loadPageWords('ja')).toBe(WORDS_EN);
  expect(await loadPageWords(undefined)).toBe(WORDS_EN);
});

test('a block’s own words win over the page’s, over English', () => {
  expect(
    mergeWords(
      'countdown',
      { countdown: { days: 'Tage', hours: 'Stunden' } },
      { days: 'jours', minutes: undefined }
    )
  ).toEqual({
    days: 'jours',
    hours: 'Stunden',
    minutes: 'minutes',
    seconds: 'seconds',
  });
  expect(mergeWords('countdown')).toEqual(WORDS_EN.countdown);
});

test('blocks on a server-rendered page follow its language', () => {
  const html = renderToString(
    createElement(
      ui.CreatorTheme,
      { theme: { language: 'de' }, words: WORDS_DE },
      createElement(ui.Countdown, { to: new Date(2_000), now: 1_000 }),
      createElement(ui.CreditPack, {
        credits: 12000,
        price: '9 €',
        href: 'https://example.com/credits',
      }),
      createElement(ui.DiscountCode, {
        code: 'ORIGINS10',
        labels: { copy: 'Code holen' },
      })
    )
  );
  expect(html).toContain('lang="de"');
  expect(html).toContain('Sekunden');
  expect(html).toContain('12.000 Credits');
  expect(html).toContain('Credits kaufen');
  // The block's own words win.
  expect(html).toContain('Code holen');
  expect(html).not.toContain('Code kopieren');
});

test('a page without a language stays as it was', () => {
  const html = renderToString(
    createElement(
      ui.CreatorTheme,
      { theme: { language: 'not a tag' } },
      createElement(ui.Countdown, { to: new Date(2_000), now: 1_000 })
    )
  );
  expect(html).not.toContain('lang=');
  expect(html).toContain('seconds');
});

test('the page editor offers every ready language, starting in English', () => {
  const [language] = PAGE_SETTINGS;
  expect(language.name).toBe('language');
  expect([...language.options]).toEqual([...PAGE_LANGUAGES]);
  for (const option of language.options) {
    expect(language.optionLabels[option].length, option).toBeGreaterThan(0);
  }
  expect(settingDefaults(PAGE_SETTINGS)).toEqual({ language: 'en' });
});

test('word props have no English default, so a new block follows the page', () => {
  const english = new Set(Object.values(WORDS_EN.props));
  for (const block of ui.BLOCKS) {
    for (const field of block.settings ?? []) {
      if ('default' in field && typeof field.default === 'string') {
        expect(english.has(field.default), `${block.id}.${field.name}`).toBe(
          false
        );
      }
    }
  }
});
