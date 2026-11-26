import { expect, test } from '@playwright/test';
import { formatNextFree, mapEmbedUrl, mapFrameUrl } from '../src';
import { BLOCKS as REGISTRY, type BlockInfo } from '../src/system/registry';
import type { SettingField } from '../src/system/settings';

/*
 * The map styles, the next free time on a booking card, and the defaults of
 * options added to blocks that were already in use. No browser.
 */

const BLOCKS: readonly BlockInfo[] = REGISTRY;

const setting = (component: string, name: string): SettingField => {
  const block = BLOCKS.find((entry) => entry.component === component);
  const field = block?.settings.find((entry) => entry.name === name);
  if (!field) throw new Error(`${component}.${name} has no setting`);
  return field;
};

test('the street map styles use the street map; satellite the view from above', () => {
  for (const style of [undefined, 'standard', 'light', 'dark'] as const) {
    expect(mapFrameUrl(9.9658, 76.2421, style)).toBe(
      mapEmbedUrl(9.9658, 76.2421)
    );
  }
  const above = new URL(mapFrameUrl(9.9658, 76.2421, 'satellite'));
  expect(above.protocol).toBe('https:');
  expect(above.hostname).toBe('maps.google.com');
  expect(above.searchParams.get('q')).toBe('9.96580,76.24210');
  expect(above.searchParams.get('t')).toBe('k');
  expect(above.searchParams.get('output')).toBe('embed');
});

test('the next free time is written in the zone it is given', () => {
  const start = '2026-12-03T04:30:00Z';
  expect(
    formatNextFree(start, { locale: 'en-IN', timeZone: 'Asia/Kolkata' })
  ).toMatch(/3 Dec.*10:00/);
  expect(
    formatNextFree(start, { locale: 'en-US', timeZone: 'America/New_York' })
  ).toMatch(/Dec 2.*11:30/);
});

test('a next free time that can’t be read shows nothing', () => {
  expect(formatNextFree('not a date')).toBeNull();
  expect(
    formatNextFree('2026-12-03T04:30:00Z', { timeZone: 'Nowhere/Here' })
  ).toBeNull();
});

test('new options start where the blocks were before', () => {
  const before: [string, string, unknown][] = [
    ['CreatorHeader', 'initialsFont', 'body'],
    ['MapCard', 'mapStyle', 'standard'],
    ['NewsletterBand', 'display', 'band'],
  ];
  for (const [component, name, value] of before) {
    const field = setting(component, name);
    expect(
      'default' in field ? field.default : undefined,
      `${component}.${name}`
    ).toBe(value);
  }
  // Text fields an app may leave empty, so the block looks as it did.
  for (const [component, name] of [
    ['MapCard', 'mapCaption'],
    ['BookingEmbed', 'duration'],
    ['BookingEmbed', 'timeZone'],
    ['FeaturedPack', 'duration'],
    ['FeaturedPack', 'href'],
    ['PackRow', 'duration'],
  ]) {
    const field = setting(component, name);
    expect(field.required ?? false, `${component}.${name}`).toBe(false);
    expect('default' in field ? field.default : undefined).toBeUndefined();
  }
});
