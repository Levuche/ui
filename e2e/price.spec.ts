import { expect, test } from '@playwright/test';
import { priceSaving } from '../src/molecules/price';

/* What a visitor saves, worked out from two prices as a creator wrote them. No browser. */

test('works out the saving in the way the price is written', () => {
  expect(priceSaving('$12', '$20')).toBe('$8');
  expect(priceSaving('$12.50', '$20')).toBe('$7.50');
  expect(priceSaving('₹1,499', '₹2,499')).toBe('₹1,000');
  expect(priceSaving('12,50 €', '20 €')).toBe('7,50 €');
  expect(priceSaving('€9', '€19')).toBe('€10');
  expect(priceSaving('1 299 kr', '1 599 kr')).toBe('300 kr');
});

test('says nothing when the prices can’t be compared', () => {
  expect(priceSaving('Free', '$20')).toBeNull();
  expect(priceSaving('$12', '€20')).toBeNull();
  expect(priceSaving('$20', '$12')).toBeNull();
  expect(priceSaving('$12', '$12')).toBeNull();
  expect(priceSaving('$12–$15', '$20')).toBeNull();
});
