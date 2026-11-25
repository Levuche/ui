import { expect, test } from '@playwright/test';
import { isSafeHref, linkAttrs } from '../src';

/* Links a creator types in: only those that open a page, mail, call or text. */

test('page, mail, call and text links are used', () => {
  for (const href of [
    'https://example.com/a',
    'http://example.com',
    'mailto:hi@example.com',
    'tel:+911234567890',
    'sms:+911234567890',
    '/shop',
    '#top',
    '?tab=2',
    './about',
  ]) {
    expect(isSafeHref(href), href).toBe(true);
  }
});

test('code and other sites passed off as this one are dropped', () => {
  for (const href of [
    'javascript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,hi',
    'vbscript:x',
    'file:///etc/passwd',
    // Each of these opens another site, so none counts as this one.
    '//evil.example',
    '/\\evil.example/login',
    '\\\\evil.example',
    'http:evil.example',
    'https:/evil.example',
    '',
    null,
    undefined,
  ]) {
    expect(isSafeHref(href), String(href)).toBe(false);
  }
});

test('other sites open in a new tab, this one in the same', () => {
  expect(linkAttrs('https://example.com')).toEqual({
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
  });
  expect(linkAttrs('/shop')).toEqual({ href: '/shop' });
  expect(linkAttrs('/\\evil.example')).toBeNull();
});
