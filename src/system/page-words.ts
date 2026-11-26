import * as React from 'react';
import { mergeWords } from './language';
import { PageContext, type PageSettings } from './page-context';
import type { PageWords } from './words/en';

/*
 * How a block finds its page's language and words without any prop.
 *
 * In the browser, and when a server renders client components, they travel
 * in React context from <CreatorTheme>. React Server Components can't read
 * context (React's server build has no useContext), so there <CreatorTheme>
 * leaves them in a store that lasts for the one request (React's `cache`),
 * and the blocks it renders read them from there. Either way a block reads
 * them the same way: usePageWords and usePageLocale.
 */

// Undefined in React Server Components.
const readContext = (React as Partial<typeof React>).useContext;

const requestPage = React.cache((): { page: PageSettings | null } => ({
  page: null,
}));

/**
 * Keeps the page's language and words for the blocks a React Server
 * Component renders after this, for the rest of the request: one language
 * per page request. Does nothing elsewhere, where context carries them.
 */
export function rememberPage(page: PageSettings) {
  if (!readContext) requestPage().page = page;
}

/** The page's language and words, or null outside a themed page. */
export function usePage(): PageSettings | null {
  return readContext ? readContext(PageContext) : requestPage().page;
}

/**
 * One block's words: its own `labels` over the page's words, over English.
 * `Labels` is the block's own labels type, where a word can be more than
 * text (a ReactNode) or one the page has none for.
 *
 *   const words = usePageWords('countdown', labels);
 */
export function usePageWords<
  Group extends keyof PageWords,
  Labels extends object = PageWords[Group],
>(
  group: Group,
  labels?: Partial<Labels>
): Omit<PageWords[Group], keyof Labels> & Labels {
  const page = usePage();
  return mergeWords(
    group,
    page?.words,
    labels as Partial<PageWords[Group]>
  ) as Omit<PageWords[Group], keyof Labels> & Labels;
}

/**
 * The locale to write numbers and dates in: the block's own `locale`, or
 * else the page's language. Undefined when neither is set.
 */
export function usePageLocale(locale?: string): string | undefined {
  const page = usePage();
  return locale ?? page?.language;
}
