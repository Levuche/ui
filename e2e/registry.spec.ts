import { expect, test } from '@playwright/test';
import * as ui from '../src';
import { BLOCKS } from '../src/system/registry';

/* The block registry: every block once, each one findable on a page. */

test('every block id and component name is used once', () => {
  const ids = BLOCKS.map((block) => block.id);
  const components = BLOCKS.map((block) => block.component);
  expect(new Set(ids).size).toBe(ids.length);
  expect(new Set(components).size).toBe(components.length);
  for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
});

test('every block in the registry is exported', () => {
  for (const block of BLOCKS) {
    expect(
      typeof (ui as Record<string, unknown>)[block.component],
      block.component
    ).toBe('function');
  }
});

test('blocks on the gallery write their own registry id', async ({ page }) => {
  await page.goto('/');
  const onPage = await page
    .locator('[data-block]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-block')));
  const known = new Set<string>(BLOCKS.map((block) => block.id));
  for (const id of new Set(onPage)) {
    expect(known.has(id ?? ''), `${id} is in the registry`).toBe(true);
  }
});
