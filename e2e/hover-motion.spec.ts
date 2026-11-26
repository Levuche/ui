import { expect, test, type Page } from '@playwright/test';

/*
 * Hover in a real browser, through the gallery (gallery/): a link rises under
 * the pointer, and stays still for a visitor who asks for less motion. Only
 * where a pointer can hover, so not on the touch screens.
 */

test.skip(({ hasTouch }) => hasTouch, 'touch screens have no hover');

const tile = (page: Page) =>
  page
    .getByTestId('panel-light')
    .getByRole('navigation', { name: 'Desi Origins links' })
    .getByRole('link', { name: 'Instagram' });

test('a link rises a little under the pointer', async ({ page }) => {
  await page.goto('/');
  const link = tile(page);
  await link.hover();
  await expect
    .poll(() => link.evaluate((el) => getComputedStyle(el).translate))
    .toBe('0px -2px');
});

test('nothing moves for a visitor who asks for less motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const link = tile(page);
  await link.hover();
  // The hover state still applies; only the movement goes.
  await expect
    .poll(() => link.evaluate((el) => getComputedStyle(el, '::after').opacity))
    .toBe('1');
  expect(await link.evaluate((el) => getComputedStyle(el).translate)).toBe(
    'none'
  );
  await page.mouse.down();
  expect(await link.evaluate((el) => getComputedStyle(el).scale)).toBe('none');
  // Let go away from the link, so it isn't followed.
  await page.mouse.move(0, 0);
  await page.mouse.up();
});
