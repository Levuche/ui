import { useSyncExternalStore } from 'react';
import { usePageLocale } from './page-words';

/*
 * Numbers and dates written in the visitor's own way. The server doesn't
 * know the visitor's locale, so a client block that formats with it would
 * write "12,000" on the server and "12.000" in the browser, and React would
 * throw away the page's HTML. So the first render uses SERVER_LOCALE on
 * both, and the visitor's own takes over once the page is running.
 */

/** The locale the server and the first browser render agree on. */
export const SERVER_LOCALE = 'en-US';

const noChange = () => () => {};

/** False on the server and while the page hydrates; true after that. */
export function useHydrated() {
  return useSyncExternalStore(
    noChange,
    () => true,
    () => false
  );
}

/**
 * The locale to format with: `locale` when it's given, else the page's
 * language (SiteTheme.language), otherwise SERVER_LOCALE until the page has
 * hydrated, then the visitor's own.
 */
export function useVisitorLocale(locale?: string): string | undefined {
  const hydrated = useHydrated();
  const chosen = usePageLocale(locale);
  return chosen ?? (hydrated ? undefined : SERVER_LOCALE);
}
