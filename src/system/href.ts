/*
 * Links a creator types in. Only addresses that open a page, an email, a call
 * or a text are used; anything else (javascript:, data:, vbscript:, file:,
 * or an address with hidden characters) is dropped, so a saved page can never
 * run code in a visitor's browser.
 */

const SAFE_SCHEME = /^(https?:|mailto:|tel:|sms:)/i;
// Characters a browser ignores inside a scheme ("java\tscript:").
// eslint-disable-next-line no-control-regex -- these are what it removes
const HIDDEN = /[\u0000-\u0020\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g;

/** True for https, http, mailto, tel and sms addresses, and for links on the same site. */
export function isSafeHref(href: string | null | undefined): href is string {
  if (typeof href !== 'string') return false;
  const value = href.trim();
  // eslint-disable-next-line no-control-regex -- control characters are refused
  if (!value || value !== value.replace(/[\u0000-\u001f\u007f]/g, '')) {
    return false;
  }
  // Same site: /path, #anchor, ?query or ./path. Not //host, which is another site.
  if (/^(\/(?!\/)|#|\?|\.\/)/.test(value)) return true;
  return SAFE_SCHEME.test(value.replace(HIDDEN, ''));
}

/** The address, if it's safe; otherwise undefined, so no link is made. */
export function safeHref(href: string | null | undefined) {
  return isSafeHref(href) ? href.trim() : undefined;
}

/** A page on another site (http or https). */
export function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href.trim());
}

/** How a link behaves when it's followed. */
export type LinkBehavior = {
  /**
   * Open in a new tab. `auto` (the default) opens other sites in a new tab and
   * keeps the creator's own pages in this one.
   */
  newTab?: boolean | 'auto';
  /** A paid or affiliate link: tells search engines with rel="sponsored". */
  sponsored?: boolean;
  /** Ask search engines not to follow it. */
  nofollow?: boolean;
};

/** The href, target and rel for a link, or null when the address isn't safe. */
export function linkAttrs(
  href: string | null | undefined,
  { newTab = 'auto', sponsored = false, nofollow = false }: LinkBehavior = {}
) {
  const safe = safeHref(href);
  if (!safe) return null;
  const blank = newTab === 'auto' ? isExternalHref(safe) : newTab;
  const rel = [
    blank && 'noopener noreferrer',
    sponsored && 'sponsored',
    nofollow && 'nofollow',
  ]
    .filter(Boolean)
    .join(' ');
  return {
    href: safe,
    ...(blank ? { target: '_blank' } : {}),
    ...(rel ? { rel } : {}),
  };
}
