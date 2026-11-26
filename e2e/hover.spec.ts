import { expect, test } from '@playwright/test';
import { lookProps, splitLook } from '../src/system/look';
import { SITE_HOVERS, siteThemeAttributes } from '../src/system/theme';

/* Plain checks of the hover choices, for the page and one block. No browser. */

test('the page can pick any hover, and only a known one', () => {
  expect(SITE_HOVERS).toEqual(['lift', 'tint', 'zoom', 'glow', 'none']);
  for (const hover of SITE_HOVERS) {
    // Lift is the default, so it needs no attribute.
    expect(siteThemeAttributes({ hover })).toEqual(
      hover === 'lift' ? {} : { 'data-hover': hover }
    );
  }
});

test('a block can pick its own hover over the page’s', () => {
  const [look, rest] = splitLook({ hover: 'zoom', id: 'tea' } as const);
  expect(look).toEqual({ hover: 'zoom' });
  expect(rest).toEqual({ id: 'tea' });
  expect(lookProps('featured-link', look)['data-hover']).toBe('zoom');
  // Lift is written too: on a block it overrides a page that tints.
  expect(lookProps('link-list', { hover: 'lift' })['data-hover']).toBe('lift');
  // The block's own default applies where the creator picked none.
  expect(lookProps('link-list', {}, { hover: 'glow' })['data-hover']).toBe(
    'glow'
  );
  // No choice, no attribute: the block follows the page.
  expect(lookProps('link-list', {})).not.toHaveProperty('data-hover');
  // Anything else a saved page holds is dropped.
  const saved = { hover: '"><b>' } as unknown as Parameters<
    typeof lookProps
  >[1];
  expect(lookProps('link-list', saved)).not.toHaveProperty('data-hover');
});
