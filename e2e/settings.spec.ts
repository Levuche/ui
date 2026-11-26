import { expect, test } from '@playwright/test';
import * as ui from '../src';
import {
  BLOCKS as REGISTRY,
  mainLinkSetting,
  settingsPanel,
  type BlockInfo,
} from '../src/system/registry';
import { BLOCK_EFFECTS, BLOCK_TONES, splitLook } from '../src/system/look';
import { MIN_MOTION_SECONDS } from '../src/system/motion';
import { EMBED_SERVICES } from '../src/system/embeds';
import {
  LIST_VALUE_TYPES,
  LOOK_SETTINGS,
  SETTING_ICONS,
  SETTING_TYPES,
  fitsSetting,
  settingDefaults,
  settingIcon,
  type SettingField,
} from '../src/system/settings';

/*
 * Plain checks of each block's settings panel. No browser. That every prop
 * is covered, and each field fits its prop, is checked by the type check
 * (src/settings-check.ts); these check what only shows at run time.
 */

/** Every field, with its path, including those inside lists and groups. */
function* walk(
  fields: readonly SettingField[],
  path: string
): Generator<[string, SettingField]> {
  for (const field of fields) {
    const at = `${path}.${field.name}`;
    yield [at, field];
    if ((field.type === 'list' || field.type === 'group') && field.fields) {
      yield* walk(field.fields, at);
    }
  }
}

/** Each level's names (fields and appOnly), to check they're used once. */
function* levels(
  fields: readonly SettingField[],
  appOnly: readonly string[],
  path: string
): Generator<[string, string[]]> {
  yield [path, [...fields.map((field) => field.name), ...appOnly]];
  for (const field of fields) {
    if ((field.type === 'list' || field.type === 'group') && field.fields) {
      yield* levels(field.fields, field.appOnly ?? [], `${path}.${field.name}`);
    }
  }
}

// As plain entries, not their literal types.
const BLOCKS: readonly BlockInfo[] = REGISTRY;

const everyField = () => [
  ...walk(LOOK_SETTINGS, 'look'),
  ...BLOCKS.flatMap((block) => [...walk(block.settings, block.id)]),
];

test('every block has settings, and the look goes on every panel', () => {
  expect(BLOCKS.length).toBeGreaterThan(50);
  for (const block of BLOCKS) {
    expect(block.settings.length, block.id).toBeGreaterThan(0);
    expect(Array.isArray(block.appOnly), block.id).toBe(true);
    const panel = settingsPanel(block.id);
    expect(panel?.settings, block.id).toBe(block.settings);
    expect(panel?.look, block.id).toBe(LOOK_SETTINGS);
  }
  expect(settingsPanel('no-such-block')).toBeUndefined();
});

test('field names are used once in each block and each list or group', () => {
  const look = LOOK_SETTINGS.map((field) => field.name as string);
  for (const block of BLOCKS) {
    for (const [path, names] of levels(
      block.settings,
      block.appOnly,
      block.id
    )) {
      const all = path === block.id ? [...names, ...look] : names;
      expect(new Set(all).size, `${path}: ${all.join(', ')}`).toBe(all.length);
    }
  }
  for (const [path, names] of levels(LOOK_SETTINGS, [], 'look')) {
    expect(new Set(names).size, path).toBe(names.length);
  }
});

test('every field has a known type, a label and an icon', () => {
  for (const [path, field] of everyField()) {
    expect(SETTING_TYPES, path).toContain(field.type);
    expect(field.label.trim().length, path).toBeGreaterThan(0);
    expect(field.name, path).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
    expect(SETTING_ICONS, path).toContain(settingIcon(field));
    if (field.help) expect(field.help.trim().length, path).toBeGreaterThan(0);
  }
});

test('choice fields have options, each once, and labels only for them', () => {
  let choices = 0;
  for (const [path, field] of everyField()) {
    if (field.type !== 'choice') continue;
    choices += 1;
    expect(field.options.length, path).toBeGreaterThan(1);
    expect(new Set(field.options).size, path).toBe(field.options.length);
    const values = field.options.map(String);
    for (const key of Object.keys(field.optionLabels ?? {})) {
      expect(values, `${path} label ${key}`).toContain(key);
    }
  }
  expect(choices).toBeGreaterThan(40);
});

test('choices reuse the package’s own lists', () => {
  const tone = LOOK_SETTINGS.find((field) => field.name === 'tone');
  expect(tone?.type === 'choice' && tone.options).toBe(BLOCK_TONES);
  const services = ui
    .blockInfo('link-embed')
    ?.settings.find((field) => field.name === 'services');
  expect(services?.type === 'choice' && services.options).toBe(EMBED_SERVICES);
  const cardTone = ui
    .blockInfo('pricing-table')
    ?.settings.find((field) => field.name === 'cardTone');
  expect(cardTone?.type === 'choice' && cardTone.options).toBe(BLOCK_TONES);
  const effect = LOOK_SETTINGS.find((field) => field.name === 'effect');
  expect(effect?.type === 'choice' && effect.options).toBe(BLOCK_EFFECTS);
});

test('moving words have settings, and no speed can race past', () => {
  const strip = ui.blockInfo('text-strip')?.settings ?? [];
  expect(strip.map((field) => field.name)).toEqual([
    'items',
    'separator',
    'speed',
    'direction',
    'label',
    'labels',
  ]);
  const header = ui.blockInfo('creator-header')?.settings ?? [];
  const names = header.map((field) => field.name as string);
  for (const name of ['wordRing', 'wordRingSpeed', 'wordRingLabels']) {
    expect(names).toContain(name);
  }
  for (const field of [...strip, ...header]) {
    if (field.type === 'number' && field.unit === 'seconds') {
      expect(field.min, field.name).toBe(MIN_MOTION_SECONDS);
    }
  }
});

test('every default fits its field', () => {
  let defaults = 0;
  for (const [path, field] of everyField()) {
    if (!('default' in field) || field.default === undefined) continue;
    defaults += 1;
    expect(fitsSetting(field, field.default), `${path}: ${field.default}`).toBe(
      true
    );
  }
  expect(defaults).toBeGreaterThan(60);
  // And a new block's starting values fit as a whole.
  for (const block of BLOCKS) {
    const values = settingDefaults(block.settings);
    for (const field of block.settings) {
      if (field.name in values) {
        expect(fitsSetting(field, values[field.name]), block.id).toBe(true);
      }
    }
  }
});

test('lists hold fields or plain values, not both', () => {
  for (const [path, field] of everyField()) {
    if (field.type !== 'list') continue;
    expect(Boolean(field.fields) !== Boolean(field.of), path).toBe(true);
    if (field.of) expect(LIST_VALUE_TYPES, path).toContain(field.of);
    if (field.fields) expect(field.fields.length, path).toBeGreaterThan(0);
  }
});

test('words fields name the package’s own defaults', () => {
  const exports = ui as Record<string, unknown>;
  for (const [path, field] of everyField()) {
    if (field.type !== 'words') continue;
    const words = exports[field.from];
    expect(typeof words, `${path} from ${field.from}`).toBe('object');
    expect(Object.keys(words as object).length, path).toBeGreaterThan(0);
  }
});

test('each block has at most one main link, and data to load is slow', () => {
  for (const block of BLOCKS) {
    const main = [...walk(block.settings, block.id)].filter(
      ([, field]) => field.type === 'link' && field.main
    );
    expect(main.length, block.id).toBeLessThanOrEqual(1);
    // Only a top-level field can take a pasted link.
    for (const [path] of main) expect(path.split('.').length, path).toBe(2);
    expect(mainLinkSetting(block.id)).toBe(main[0]?.[1]);
    for (const field of block.settings) {
      if (field.forApp && field.type === 'link') {
        expect(field.slow, `${block.id}.${field.name}`).toBe(true);
      }
    }
  }
  expect(mainLinkSetting('youtube-video')?.name).toBe('video');
  expect(mainLinkSetting('latest-videos')?.name).toBe('channel');
  expect(mainLinkSetting('testimonials')).toBeUndefined();
});

test('the text blocks have their settings', () => {
  const field = (id: string, name: string) =>
    ui.blockInfo(id)?.settings.find((setting) => setting.name === name);
  // The heading's link name is a setting; its level is the app's.
  expect(field('section-heading', 'title')?.required).toBe(true);
  expect(field('section-heading', 'id')?.type).toBe('text');
  expect(ui.blockInfo('section-heading')?.appOnly).toEqual(['headingAs']);
  const text = field('text-block', 'text');
  expect(text?.type).toBe('longText');
  expect(text?.required).toBe(true);
  expect(field('quote-block', 'quote')?.required).toBe(true);
  expect(field('quote-block', 'avatar')?.type).toBe('picture');
  // The spacer's height stops where the block does.
  const rows = field('spacer', 'rows');
  expect(rows?.type === 'number' && [rows.min, rows.max]).toEqual([
    1,
    ui.SPACER_MAX_ROWS,
  ]);
  expect(field('spacer', 'line')?.type).toBe('toggle');
});

test('the look settings are exactly the look a block takes', () => {
  const values = Object.fromEntries(
    LOOK_SETTINGS.map((field) => [field.name, 'x'])
  );
  const [look, rest] = splitLook(values);
  expect(Object.keys(rest)).toEqual([]);
  expect(Object.keys(look).sort()).toEqual(Object.keys(values).sort());
});

test('fitsSetting refuses values that don’t fit', () => {
  const field = (extra: Partial<SettingField>) =>
    ({ name: 'x', label: 'X', ...extra }) as SettingField;
  expect(fitsSetting(field({ type: 'text' }), 3)).toBe(false);
  expect(fitsSetting(field({ type: 'toggle' }), 'yes')).toBe(false);
  expect(fitsSetting(field({ type: 'number', min: 1, max: 5 }), 6)).toBe(false);
  expect(fitsSetting(field({ type: 'number' }), Number.NaN)).toBe(false);
  expect(fitsSetting(field({ type: 'colour' }), 'url(x)')).toBe(false);
  expect(fitsSetting(field({ type: 'colour' }), '#ff0000')).toBe(true);
  expect(fitsSetting(field({ type: 'dateTime' }), 'soon')).toBe(false);
  expect(fitsSetting(field({ type: 'dateTime' }), '2026-12-01T10:00:00Z')).toBe(
    true
  );
  const choice = field({ type: 'choice', options: ['a', 'b'] });
  expect(fitsSetting(choice, 'c')).toBe(false);
  expect(fitsSetting(choice, 'a')).toBe(true);
  const many = field({ type: 'choice', options: ['a', 'b'], multiple: true });
  expect(fitsSetting(many, ['a', 'b'])).toBe(true);
  expect(fitsSetting(many, ['a', 'c'])).toBe(false);
  const list = field({
    type: 'list',
    fields: [{ name: 'title', label: 'Title', type: 'text', required: true }],
  });
  expect(fitsSetting(list, [{ title: 'One' }])).toBe(true);
  expect(fitsSetting(list, [{}])).toBe(false);
  expect(fitsSetting(field({ type: 'list', of: 'number' }), [1, '2'])).toBe(
    false
  );
});
