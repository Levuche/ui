import {
  PAGE_LANGUAGE_LABELS,
  WORDS_EN,
  type PageLanguage,
  type PageWords,
} from '../src';
import { WORDS_DE } from '../src/system/words/de';
import { WORDS_ES } from '../src/system/words/es';
import { WORDS_FR } from '../src/system/words/fr';
import { WORDS_HI } from '../src/system/words/hi';
import { WORDS_PT } from '../src/system/words/pt';

/*
 * Every ready word set, for Storybook's Language menu. A real page loads only
 * its own with loadPageWords; Storybook shows them all.
 */
export const LANGUAGES: Record<
  PageLanguage,
  { title: string; words: PageWords }
> = {
  en: { title: PAGE_LANGUAGE_LABELS.en, words: WORDS_EN },
  hi: { title: PAGE_LANGUAGE_LABELS.hi, words: WORDS_HI },
  es: { title: PAGE_LANGUAGE_LABELS.es, words: WORDS_ES },
  de: { title: PAGE_LANGUAGE_LABELS.de, words: WORDS_DE },
  fr: { title: PAGE_LANGUAGE_LABELS.fr, words: WORDS_FR },
  pt: { title: PAGE_LANGUAGE_LABELS.pt, words: WORDS_PT },
};
