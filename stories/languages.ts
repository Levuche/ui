import { WORDS_EN, type PageLanguage, type PageWords } from '../src';
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
  en: { title: 'English', words: WORDS_EN },
  hi: { title: 'हिन्दी (Hindi)', words: WORDS_HI },
  es: { title: 'Español (Spanish)', words: WORDS_ES },
  de: { title: 'Deutsch (German)', words: WORDS_DE },
  fr: { title: 'Français (French)', words: WORDS_FR },
  pt: { title: 'Português (Portuguese)', words: WORDS_PT },
};
