'use client';

import { createContext, type ReactNode } from 'react';
import type { PageWordsInput } from './language';

/** What <CreatorTheme> tells the blocks inside it about the page. */
export type PageSettings = {
  /** A safe language tag (see safeLanguage). */
  language?: string;
  words?: PageWordsInput;
};

/* Only in the browser and in server rendering of client components; React
 * Server Components read the page from page-words.ts instead. */
export const PageContext = createContext<PageSettings | null>(null);

/** Gives the blocks inside the page's language and words. */
export function PageProvider({
  value,
  children,
}: {
  value: PageSettings;
  children?: ReactNode;
}) {
  return <PageContext value={value}>{children}</PageContext>;
}
