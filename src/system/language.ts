import { WORDS_EN, type PageWords } from './words/en';

/*
 * A page's language: the words blocks write themselves (buttons, units,
 * status messages) and how they write numbers and dates. A creator picks it
 * once for the page, in the theme (`SiteTheme.language`), instead of giving
 * every block its own `labels`.
 *
 * Plain data and functions only. The words reach the blocks through
 * <CreatorTheme> (see page-words.ts).
 */

/** The languages blocks have ready words for. Others get English words. */
export const PAGE_LANGUAGES = ['en', 'hi', 'es', 'de', 'fr', 'pt'] as const;
export type PageLanguage = (typeof PAGE_LANGUAGES)[number];

/** Words for a page, by block: any block's words, or only some of them. */
export type PageWordsInput = {
  [Group in keyof PageWords]?: Partial<PageWords[Group]>;
};

/**
 * A language tag the browser understands ("hi", "pt-BR"), written the
 * standard way, or undefined for anything else. A theme is saved by a
 * creator, and Intl throws on a tag it can't read.
 */
export function safeLanguage(tag: unknown): string | undefined {
  if (typeof tag !== 'string') return undefined;
  const trimmed = tag.trim();
  if (!/^[a-z]{2,3}(-[a-z0-9]{1,8})*$/i.test(trimmed)) return undefined;
  try {
    return Intl.getCanonicalLocales(trimmed)[0];
  } catch {
    return undefined;
  }
}

/**
 * The ready word set a language uses: "pt-BR" uses "pt", and a language
 * without a set of its own uses English.
 */
export function pageWordsLanguage(tag: unknown): PageLanguage {
  const base = safeLanguage(tag)?.split('-')[0].toLowerCase();
  return PAGE_LANGUAGES.find((language) => language === base) ?? 'en';
}

/**
 * The words for a language, loaded on their own so a page only downloads
 * the language it's in. Await it on the server and pass the result to
 * <CreatorTheme words>.
 */
export async function loadPageWords(tag: unknown): Promise<PageWords> {
  switch (pageWordsLanguage(tag)) {
    case 'hi':
      return (await import('./words/hi')).WORDS_HI;
    case 'es':
      return (await import('./words/es')).WORDS_ES;
    case 'de':
      return (await import('./words/de')).WORDS_DE;
    case 'fr':
      return (await import('./words/fr')).WORDS_FR;
    case 'pt':
      return (await import('./words/pt')).WORDS_PT;
    default:
      return WORDS_EN;
  }
}

/** Copies the words that are set, so an undefined one never hides another. */
function setWords<T extends object>(into: T, words?: Partial<T>) {
  for (const [key, value] of Object.entries(words ?? {})) {
    if (value !== undefined && value !== null) {
      (into as Record<string, unknown>)[key] = value;
    }
  }
}

/**
 * One block's words: English, then the page's words over them, then the
 * block's own `labels` over those, so a block's own words always win.
 */
export function mergeWords<Group extends keyof PageWords>(
  group: Group,
  page?: PageWordsInput | null,
  labels?: Partial<PageWords[Group]>
): PageWords[Group] {
  const words = { ...WORDS_EN[group] };
  setWords(words, page?.[group] as Partial<PageWords[Group]> | undefined);
  setWords(words, labels);
  return words;
}
