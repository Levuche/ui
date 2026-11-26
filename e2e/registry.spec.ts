import { expect, test } from '@playwright/test';
import * as ui from '../src';
import {
  BLOCKS,
  BLOCK_PACKS,
  blocksInPack,
  isPaidPack,
} from '../src/system/registry';

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

test('every block is in one pack, and every pack has blocks', () => {
  for (const block of BLOCKS) expect(BLOCK_PACKS).toContain(block.pack);
  for (const pack of BLOCK_PACKS) {
    expect(blocksInPack(pack).length, pack).toBeGreaterThan(0);
  }
  expect(isPaidPack('core')).toBe(false);
  for (const pack of BLOCK_PACKS.slice(1)) expect(isPaidPack(pack)).toBe(true);
});

test('blocks that sell through BuildBase are free', () => {
  const sellers = [
    'action-card',
    'pack-row',
    'featured-pack',
    'pack-grid',
    'credit-pack',
    'slot-picker',
    'pack-checkout',
    'booking-card',
    'membership-card',
    'lead-magnet',
    'tip-jar',
    'course-card',
    'pricing-table',
  ];
  for (const id of sellers) {
    expect(BLOCKS.find((block) => block.id === id)?.pack, id).toBe('core');
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
