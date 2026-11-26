import { SERVER_LOCALE } from './locale';

/*
 * The sums behind a progress bar: how far along something is, held between
 * 0 and 100%, how much of a bar in steps is filled, how many days are left
 * to a deadline, and amounts written in the visitor's way. Plain functions,
 * so they run on a server, in a browser or in a test, and give the same
 * answer in each.
 */

/** How far along something is, as a bar shows it. */
export type Progress = {
  /** The value, held between 0 and `max`. */
  value: number;
  /** What counts as done. 100 when the target couldn't be used. */
  max: number;
  /** Whole percent, from 0 to 100. Only 100 once the target is reached. */
  percent: number;
  /** The target was reached or passed. */
  done: boolean;
  /** False when the target was zero, negative or not a number. */
  valid: boolean;
};

/** A smooth bar, or one in steps that fill one by one. */
export const PROGRESS_BAR_STYLES = ['smooth', 'steps'] as const;
export type ProgressBarStyle = (typeof PROGRESS_BAR_STYLES)[number];

/**
 * How a bar's number is written beside it: as a percentage ("80%"), as an
 * amount out of its target ("4 of 5"), or not at all.
 */
export const PROGRESS_VALUE_STYLES = ['percent', 'amount', 'none'] as const;
export type ProgressValueStyle = (typeof PROGRESS_VALUE_STYLES)[number];

/** The most steps a bar in steps can have. */
export const MAX_PROGRESS_STEPS = 20;

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * How far `value` is towards `max`. Left out, `max` is 100, so a value is a
 * percentage. A value under 0 or not a number counts as 0, and one over the
 * target as the target. A target of 0 or less, or one that isn't a number,
 * can't be measured against: that's 0%, not done, and `valid` is false.
 *
 * The percent rounds down, so a bar never says 100% before it's done.
 */
export function progressOf(value: unknown, max: unknown = 100): Progress {
  if (!isNumber(max) || max <= 0) {
    return { value: 0, max: 100, percent: 0, done: false, valid: false };
  }
  const held = isNumber(value) ? Math.min(Math.max(value, 0), max) : 0;
  const done = held >= max;
  // The small nudge keeps 0.29 * 100 (28.999...) from rounding down to 28.
  const percent = done
    ? 100
    : Math.min(Math.floor((held / max) * 100 + 1e-9), 99);
  return { value: held, max, percent, done, valid: true };
}

/**
 * How many steps a bar in steps has: a whole number from 2 to
 * MAX_PROGRESS_STEPS, or 0 for a smooth bar.
 */
export function progressSteps(steps: unknown): number {
  if (!isNumber(steps) || steps < 2) return 0;
  return Math.min(Math.round(steps), MAX_PROGRESS_STEPS);
}

/**
 * How many of a bar's `steps` are filled at `percent`. Rounds down, so a
 * step fills only once it's been reached and every step is filled only when
 * it's done.
 */
export function filledSteps(percent: number, steps: number): number {
  const count = progressSteps(steps);
  if (!count || !isNumber(percent)) return 0;
  const clamped = Math.min(Math.max(percent, 0), 100);
  return Math.floor((clamped / 100) * count + 1e-9);
}

/** How many of a list's items are done. */
export function doneCount(items: readonly { done?: boolean }[] = []) {
  return {
    done: items.filter((item) => item?.done === true).length,
    total: items.length,
  };
}

/**
 * A three-letter currency code, upper-cased, when it's one the browser can
 * write money in ("usd" becomes "USD"); null otherwise.
 */
export function currencyCode(code: unknown): string | null {
  if (typeof code !== 'string') return null;
  const upper = code.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(upper)) return null;
  try {
    new Intl.NumberFormat(SERVER_LOCALE, {
      style: 'currency',
      currency: upper,
    });
    return upper;
  } catch {
    return null;
  }
}

/** Intl.NumberFormat, falling back to SERVER_LOCALE for an unknown locale. */
function numberFormat(locale: string, options: Intl.NumberFormatOptions) {
  try {
    return new Intl.NumberFormat(locale, options);
  } catch {
    return new Intl.NumberFormat(SERVER_LOCALE, options);
  }
}

/**
 * An amount written in the visitor's way: money ("$1,250", "₹40,000") when
 * `currency` is a currency code, otherwise a count ("1,250"). Whole amounts
 * have no decimals. Formats with SERVER_LOCALE unless `locale` is given, so
 * the server and the browser write the same.
 */
export function formatAmount(
  value: number,
  {
    currency,
    locale = SERVER_LOCALE,
  }: { currency?: string | null; locale?: string } = {}
): string {
  const amount = isNumber(value) ? value : 0;
  const code = currencyCode(currency);
  const whole = Number.isInteger(amount);
  if (code) {
    return numberFormat(locale, {
      style: 'currency',
      currency: code,
      ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
    }).format(amount);
  }
  return numberFormat(locale, { maximumFractionDigits: 2 }).format(amount);
}

/** A whole percentage in the visitor's way, as "37%" or "37 %". */
export function formatPercent(
  percent: number,
  locale: string = SERVER_LOCALE
): string {
  const value = isNumber(percent) ? percent : 0;
  return numberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / 100);
}

/** Fills each {key} in `template` with its value. */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

const DAY = 86_400_000;

/** Where a deadline stands: days left (rounded up), or that it has passed. */
export type DeadlineState = { days: number; ended: boolean };

/**
 * Days left until `deadline` at `now` (ms), rounded up, so anything under a
 * day is "1 day left". Once the deadline has passed, `ended` is true and
 * `days` is 0. Null for a date that can't be read.
 */
export function deadlineState(
  deadline: Date | string | null | undefined,
  now: number
): DeadlineState | null {
  if (deadline === null || deadline === undefined || deadline === '') {
    return null;
  }
  const at = new Date(deadline).getTime();
  if (!Number.isFinite(at) || !isNumber(now)) return null;
  if (at <= now) return { days: 0, ended: true };
  return { days: Math.ceil((at - now) / DAY), ended: false };
}

/**
 * A deadline's date, as "Dec 31, 2026" in `locale`. `timeZone` is UTC until
 * the page has hydrated, so the server and the first render agree; the
 * visitor's own after. Empty for a date that can't be read.
 */
export function formatDeadline(
  deadline: Date | string,
  { locale = SERVER_LOCALE, timeZone }: { locale?: string; timeZone?: string }
): string {
  const at = new Date(deadline);
  if (!Number.isFinite(at.getTime())) return '';
  const options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeZone };
  try {
    return new Intl.DateTimeFormat(locale, options).format(at);
  } catch {
    return new Intl.DateTimeFormat(SERVER_LOCALE, options).format(at);
  }
}
