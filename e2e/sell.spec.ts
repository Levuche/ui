import { expect, test } from '@playwright/test';
import {
  cleanSellRef,
  readSell,
  referralHref,
  sellJson,
  sellKind,
} from '../src';

/* Selling references: plain data a block writes and the app reads back. */

const ITEM = { itemId: '6a1b2c', variantId: 'session', priceId: 'usd' };

test('a reference keeps only what BuildBase takes, checked', () => {
  expect(
    cleanSellRef({
      ...ITEM,
      quantity: 2,
      slotStart: '2027-06-07T13:00:00.000Z',
      couponCode: 'SPRING-10',
      extra: 'dropped',
    })
  ).toEqual({
    ...ITEM,
    quantity: 2,
    slotStart: '2027-06-07T13:00:00.000Z',
    couponCode: 'SPRING-10',
  });
  expect(cleanSellRef({ ...ITEM, quantity: 0, amount: 1.5 })).toEqual(ITEM);
  expect(cleanSellRef({ ...ITEM, slotStart: 'tomorrow' })).toEqual(ITEM);
  expect(
    cleanSellRef({ itemId: 'a b', variantId: 'v', priceId: 'p' })
  ).toBeNull();
  expect(cleanSellRef('nope')).toBeNull();
});

test('plans and credit packs are told apart', () => {
  const plan = cleanSellRef({ planVersionId: 'p1', billingInterval: 'yearly' });
  expect(plan && sellKind(plan)).toBe('plan');
  expect(
    cleanSellRef({ planVersionId: 'p1', billingInterval: 'often' })
  ).toEqual({
    planVersionId: 'p1',
  });
  const credits = cleanSellRef({ creditPackageId: 'starter' });
  expect(credits && sellKind(credits)).toBe('credits');
  expect(sellKind(ITEM)).toBe('item');
});

test('a reference goes through a form and back', () => {
  const data = new FormData();
  data.set('sell', sellJson({ ...ITEM, free: true }));
  expect(readSell(data)).toEqual({ ...ITEM, free: true });
  expect(readSell('{not json')).toBeNull();
  expect(readSell(new FormData())).toBeNull();
  expect(sellJson({ itemId: '', variantId: '', priceId: '' })).toBe('');
});

test('a referral code goes on a link as ?ref=, last one wins', () => {
  expect(referralHref('https://example.com/a', 'asha')).toBe(
    'https://example.com/a?ref=asha'
  );
  expect(referralHref('https://example.com/a?x=1#top', 'asha')).toBe(
    'https://example.com/a?x=1&ref=asha#top'
  );
  expect(referralHref('https://example.com/a?ref=old&x=1', 'new')).toBe(
    'https://example.com/a?x=1&ref=new'
  );
  expect(referralHref('/a', 'bad code!')).toBe('/a');
  // Every older code goes, and an anchor with a # of its own stays whole.
  expect(referralHref('/a?ref=x&y=1&ref=z#p#q', 'new')).toBe(
    '/a?y=1&ref=new#p#q'
  );
});
