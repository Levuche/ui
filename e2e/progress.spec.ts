import { expect, test } from '@playwright/test';
import { GOAL_TRACKER_LABELS, PROGRESS_LIST_LABELS } from '../src';
import { blockInfo } from '../src/system/registry';
import {
  currencyCode,
  deadlineState,
  doneCount,
  fillTemplate,
  filledSteps,
  formatAmount,
  formatDeadline,
  formatPercent,
  MAX_PROGRESS_STEPS,
  progressOf,
  progressSteps,
} from '../src/system/progress';

/* Plain checks of the sums behind progress bars and goals. No browser. */

test('a value is held between 0 and its target', () => {
  expect(progressOf(37, 100)).toEqual({
    value: 37,
    max: 100,
    percent: 37,
    done: false,
    valid: true,
  });
  // Left out, the target is 100: the value is a percentage.
  expect(progressOf(40).percent).toBe(40);
  // Nothing yet.
  expect(progressOf(0, 10)).toMatchObject({
    value: 0,
    percent: 0,
    done: false,
  });
  // Over the target: full, and done.
  expect(progressOf(150, 100)).toEqual({
    value: 100,
    max: 100,
    percent: 100,
    done: true,
    valid: true,
  });
  expect(progressOf(10, 10)).toMatchObject({ percent: 100, done: true });
  // Under 0, or not a number: nothing yet.
  expect(progressOf(-5, 100)).toMatchObject({ value: 0, percent: 0 });
  for (const bad of [NaN, Infinity, '37', null, undefined]) {
    expect(progressOf(bad, 100).value, String(bad)).toBe(0);
  }
});

test('a target of 0, below 0 or not a number shows an empty bar', () => {
  for (const bad of [0, -100, NaN, Infinity, '100', null]) {
    expect(progressOf(50, bad), String(bad)).toEqual({
      value: 0,
      max: 100,
      percent: 0,
      done: false,
      valid: false,
    });
  }
});

test('the percent rounds down, so it says 100% only when done', () => {
  expect(progressOf(999, 1000).percent).toBe(99);
  expect(progressOf(0.999, 1).percent).toBe(99);
  expect(progressOf(29, 100).percent).toBe(29);
  expect(progressOf(0.29, 1).percent).toBe(29);
  expect(progressOf(1, 3).percent).toBe(33);
  expect(progressOf(2, 3).percent).toBe(66);
  expect(progressOf(1, 1000).percent).toBe(0);
});

test('a bar in steps fills a step only once it’s reached', () => {
  expect(progressSteps(10)).toBe(10);
  expect(progressSteps(4.6)).toBe(5);
  expect(progressSteps(500)).toBe(MAX_PROGRESS_STEPS);
  for (const smooth of [undefined, 0, 1, -3, NaN]) {
    expect(progressSteps(smooth), String(smooth)).toBe(0);
  }
  expect(filledSteps(0, 10)).toBe(0);
  expect(filledSteps(37, 10)).toBe(3);
  expect(filledSteps(99, 10)).toBe(9);
  expect(filledSteps(100, 10)).toBe(10);
  expect(filledSteps(150, 10)).toBe(10);
  expect(filledSteps(-20, 10)).toBe(0);
  expect(filledSteps(50, 4)).toBe(2);
  expect(filledSteps(70, 0)).toBe(0);
  expect(filledSteps(30, 10)).toBe(3);
});

test('items count towards a goal when they’re done', () => {
  expect(
    doneCount([{ done: true }, {}, { done: false }, { done: true }])
  ).toEqual({ done: 2, total: 4 });
  expect(doneCount([])).toEqual({ done: 0, total: 0 });
  expect(doneCount()).toEqual({ done: 0, total: 0 });
  // No items yet: nothing to measure, so an empty bar.
  expect(progressOf(0, 0).valid).toBe(false);
});

test('amounts are written as money or as a count', () => {
  expect(formatAmount(370, { currency: 'USD' })).toBe('$370');
  expect(formatAmount(1000, { currency: 'usd' })).toBe('$1,000');
  expect(formatAmount(12.5, { currency: 'USD' })).toBe('$12.50');
  expect(formatAmount(40000, { currency: 'INR' })).toBe('₹40,000');
  expect(formatAmount(40000, { currency: 'INR', locale: 'en-IN' })).toBe(
    '₹40,000'
  );
  expect(formatAmount(400000, { currency: 'INR', locale: 'en-IN' })).toBe(
    '₹4,00,000'
  );
  expect(formatAmount(1250, { currency: 'EUR', locale: 'de' })).toMatch(
    /^1\.250\s€$/
  );
  // A count: no currency, or one that isn't a code.
  expect(formatAmount(1250)).toBe('1,250');
  expect(formatAmount(1250, { currency: 'dollars' })).toBe('1,250');
  expect(formatAmount(2.345)).toBe('2.35');
  expect(formatAmount(1250, { locale: 'de' })).toBe('1.250');
  // Never breaks the page.
  expect(formatAmount(NaN)).toBe('0');
  expect(formatAmount(5, { locale: 'not a locale!' })).toBe('5');
});

test('only three-letter currency codes are money', () => {
  expect(currencyCode('usd')).toBe('USD');
  expect(currencyCode(' INR ')).toBe('INR');
  for (const bad of ['', 'US', 'DOLLAR', '$', 'U$D', 12, null, undefined]) {
    expect(currencyCode(bad), String(bad)).toBeNull();
  }
});

test('percentages are written in the visitor’s way', () => {
  expect(formatPercent(37)).toBe('37%');
  expect(formatPercent(0)).toBe('0%');
  expect(formatPercent(100)).toBe('100%');
  expect(formatPercent(37, 'fr')).toMatch(/^37\s%$/);
  expect(formatPercent(37, 'not a locale!')).toBe('37%');
  expect(formatPercent(NaN)).toBe('0%');
});

test('days left round up, and a passed deadline has ended', () => {
  const now = Date.UTC(2026, 10, 24, 9, 0, 0);
  const day = 86_400_000;
  expect(deadlineState(new Date(now + 37 * day), now)).toEqual({
    days: 37,
    ended: false,
  });
  expect(deadlineState(new Date(now + 36 * day + 1), now)?.days).toBe(37);
  expect(deadlineState(new Date(now + 60_000), now)).toEqual({
    days: 1,
    ended: false,
  });
  expect(deadlineState(new Date(now).toISOString(), now)).toEqual({
    days: 0,
    ended: true,
  });
  expect(deadlineState(new Date(now - day), now)?.ended).toBe(true);
  for (const bad of ['', 'someday', null, undefined]) {
    expect(deadlineState(bad, now), String(bad)).toBeNull();
  }
});

test('a deadline’s date is the same on the server and the first render', () => {
  const late = '2026-12-31T23:30:00Z';
  expect(formatDeadline(late, { timeZone: 'UTC' })).toBe('Dec 31, 2026');
  expect(formatDeadline(late, { timeZone: 'Asia/Kolkata' })).toBe(
    'Jan 1, 2027'
  );
  expect(formatDeadline(late, { locale: 'de', timeZone: 'UTC' })).toBe(
    '31.12.2026'
  );
  expect(formatDeadline('someday', { timeZone: 'UTC' })).toBe('');
});

test('labels fill in their numbers', () => {
  expect(fillTemplate(GOAL_TRACKER_LABELS.items, { done: 3, total: 10 })).toBe(
    '3 of 10 done'
  );
  expect(
    fillTemplate(GOAL_TRACKER_LABELS.amount, {
      current: '$370',
      target: '$1,000',
    })
  ).toBe('$370 of $1,000');
  expect(fillTemplate(GOAL_TRACKER_LABELS.days, { n: 37 })).toBe(
    '37 days left'
  );
  expect(fillTemplate(PROGRESS_LIST_LABELS.amount, { value: 4, max: 5 })).toBe(
    '4 of 5'
  );
  // An unknown key stays as it is.
  expect(fillTemplate('{n} of {what}', { n: 1 })).toBe('1 of {what}');
});

test('the goal tracker and progress list are registered', () => {
  for (const id of ['goal-tracker', 'progress-list']) {
    const info = blockInfo(id);
    expect(info?.client, id).toBe(false);
    expect(info?.group, id).toBe('trust');
  }
});
