import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, test } from '@playwright/test';
import { LOOK_SETTINGS, type SettingField } from '../src/system/settings';
import {
  APP_DATA,
  BLOCKS,
  BLOCK_COMPONENT,
  SAMPLE_NOW,
  appProps,
  leastProps,
  sampleProps,
  sampleValue,
  variants,
} from './setting-samples';

/*
 * Every setting of every block, rendered on the server as a page would be:
 * with only what's required, with everything set, and with each choice,
 * toggle, number, empty list and long line in turn. Each one renders, writes
 * its block's name, and makes React warn about nothing. Then each setting
 * has to change the page, in the sample or in a state where it shows (sold
 * out, waiting for consent, without a picture...). The few that act only
 * in the browser are listed in BROWSER_ONLY, with the story that tests them.
 */

type Props = Record<string, unknown>;

/** Settings that change nothing until the page runs, and where they're tested. */
const BROWSER_ONLY: Record<string, string> = {
  'youtube-video.start':
    'In the player’s address once play is pressed: EverySetting.stories.tsx',
  'stats-row.animate':
    'Counts up on screen in the browser: EverySetting.stories.tsx',
};

/** States that show a setting: sold out, waiting for consent, time up... */
const STATES: Props[] = [
  { sell: undefined },
  { sellState: 'sold_out' },
  { sellState: 'error' },
  { sellState: 'unavailable' },
  { sell: undefined, was: '$20' },
  { consent: false },
  { to: new Date(SAMPLE_NOW - 1000).toISOString() },
  { status: 'sent' },
  { status: 'error' },
  { preview: true },
];

/** What React says is wrong while rendering, as its console errors. */
function render(component: ReturnType<typeof BLOCK_COMPONENT>, props: Props) {
  const errors: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(' ').slice(0, 300));
  };
  try {
    return { html: renderToString(createElement(component, props)), errors };
  } finally {
    console.error = original;
  }
}

for (const block of BLOCKS) {
  const Component = BLOCK_COMPONENT(block);
  const takes = new Set([
    ...block.settings.map((field) => field.name),
    ...block.appOnly,
    ...LOOK_SETTINGS.map((field) => field.name as string),
  ]);
  /** Only the props this block takes, so a test can't pass by luck. */
  const own = (props: Props) =>
    Object.fromEntries(Object.entries(props).filter(([key]) => takes.has(key)));
  const app = appProps(block);
  const html = (props: Props) => {
    try {
      return render(Component, { ...app, ...own(props) }).html;
    } catch (error) {
      return `threw ${(error as Error).message}`;
    }
  };
  const full = sampleProps(block.settings, block.id);
  const least = leastProps(block.settings, block.id);
  const fields = (block.settings as readonly SettingField[]).filter(
    (field) => !field.forApp
  );
  const ways: { label: string; props: Props }[] = [
    { label: 'only what’s required', props: least },
    { label: 'every setting set', props: full },
    ...fields.flatMap((field) =>
      variants(field).map((variant) => ({
        label: `${field.name} = ${variant.label}`,
        props: { ...full, [field.name]: variant.value },
      }))
    ),
    ...LOOK_SETTINGS.flatMap((field) =>
      variants(field as SettingField).map((variant) => ({
        label: `look ${field.name} = ${variant.label}`,
        props: { ...full, [field.name]: variant.value },
      }))
    ),
  ];

  test(`${block.id} renders with every setting, each way`, () => {
    for (const way of ways) {
      const { html: page, errors } = render(Component, {
        ...app,
        ...own(way.props),
      });
      expect(page, `${block.id}: ${way.label}`).toContain(
        `data-block="${block.id}"`
      );
      expect(errors, `${block.id}: ${way.label}`).toEqual([]);
    }
  });

  test(`${block.id}: every setting changes the page`, () => {
    // Where a setting shows: the sample, a state, the block as first added,
    // without each other setting, each other choice, and list items
    // without each of their fields.
    // The sample with every toggle and choice back at its default.
    const usual = { ...full };
    for (const field of fields) {
      if (
        (field.type === 'toggle' || field.type === 'choice') &&
        field.default !== undefined
      ) {
        usual[field.name] = field.default;
      }
    }
    const contexts: Props[] = [
      full,
      least,
      usual,
      ...[full, least, usual].flatMap((base) =>
        STATES.map((state) => ({ ...base, ...state }))
      ),
    ];
    for (const other of fields) {
      const without = { ...full };
      delete without[other.name];
      contexts.push(without);
      for (const variant of variants(other)) {
        if (other.type === 'choice' || other.type === 'toggle') {
          contexts.push({ ...full, [other.name]: variant.value });
        }
      }
      const items = full[other.name];
      if (other.type !== 'list' || !other.fields || !Array.isArray(items)) {
        continue;
      }
      for (const itemField of other.fields) {
        contexts.push({
          ...full,
          [other.name]: (items as Props[]).map((item) => {
            const copy = { ...item };
            delete copy[itemField.name];
            return copy;
          }),
        });
      }
      contexts.push({
        ...full,
        [other.name]: (items as Props[]).map((item) => ({
          ...item,
          sellState: 'sold_out',
        })),
      });
      contexts.push({
        ...full,
        [other.name]: (items as Props[]).map((item) => ({
          ...item,
          sell: undefined,
          yearlySell: undefined,
          was: '$99',
        })),
      });
    }

    const still: string[] = [];
    for (const field of fields) {
      const values = variants(field).map((variant) => variant.value);
      const pairs: [unknown, unknown][] = [
        [full[field.name], undefined],
        ...values
          .slice(1)
          .map((value) => [values[0], value] as [unknown, unknown]),
      ];
      const changes = contexts.some((context) =>
        pairs.some(
          ([a, b]) =>
            html({ ...context, [field.name]: a }) !==
            html({ ...context, [field.name]: b })
        )
      );
      const key = `${block.id}.${field.name}`;
      if (!changes && !BROWSER_ONLY[key]) still.push(key);
      // A setting listed as browser-only that shows on the server belongs
      // in this test instead.
      if (changes) expect(BROWSER_ONLY[key], key).toBeUndefined();
    }
    expect(still, 'settings that change nothing on the page').toEqual([]);
  });
  test(`${block.id}: every state shows and looks different`, () => {
    const states: [string, Props][] = [];
    // Fetching again keeps what's there on the page, and when it was fetched
    // stays off it (LiveProps), so these two look the same as idle.
    const unseen = new Set(['loading again', 'updated']);
    if (takes.has('loading')) {
      states.push(
        ['loading', { data: undefined, loading: true }],
        ['loading again', { loading: true }],
        ['failed', { data: undefined, error: true }],
        [
          'failed, saying why',
          { data: undefined, error: 'The service is down' },
        ],
        ['failed with what it had', { error: true }],
        ['updated', { updatedAt: new Date(SAMPLE_NOW - 60_000).toISOString() }]
      );
    }
    if (takes.has('status')) {
      for (const status of ['sending', 'sent', 'error']) {
        states.push([`status ${status}`, { status }]);
      }
    }
    if (takes.has('sellState')) {
      for (const sellState of ['sending', 'sold_out', 'unavailable', 'error']) {
        states.push([`sellState ${sellState}`, { sellState }]);
      }
    }
    for (const field of fields) {
      const items = full[field.name];
      if (field.type !== 'list' || !field.fields || !Array.isArray(items)) {
        continue;
      }
      const sells = field.fields.some((item) => item.name === 'sell');
      if (!sells) continue;
      for (const sellState of ['sending', 'sold_out', 'unavailable', 'error']) {
        states.push([
          `${field.name} items ${sellState}`,
          {
            [field.name]: (items as Props[]).map((item) => ({
              ...item,
              sellState,
            })),
          },
        ]);
      }
    }
    const idle = render(Component, { ...app, ...own(full) }).html;
    const same: string[] = [];
    for (const [label, state] of states) {
      const { html: shown, errors } = render(Component, {
        ...app,
        ...own({ ...full, ...state }),
      });
      expect(shown, label).toContain(`data-block="${block.id}"`);
      expect(errors, label).toEqual([]);
      if ((shown === idle) !== unseen.has(label)) same.push(label);
    }
    expect(
      same,
      'states that look the same as when nothing is happening'
    ).toEqual([]);
  });
}

test('every look setting changes every block', () => {
  const still: string[] = [];
  for (const block of BLOCKS) {
    const Component = BLOCK_COMPONENT(block);
    const props = {
      ...appProps(block),
      ...sampleProps(block.settings, block.id),
    };
    for (const field of LOOK_SETTINGS) {
      const values = [
        undefined,
        sampleValue(field as SettingField, block.id),
        ...variants(field as SettingField).map((v) => v.value),
      ];
      const pages = new Set(
        values.map(
          (value) => render(Component, { ...props, [field.name]: value }).html
        )
      );
      if (pages.size < 2) still.push(`${block.id}.${field.name}`);
    }
  }
  expect(still).toEqual([]);
});

test('the samples hold app data only for blocks that take it', () => {
  for (const [id, data] of Object.entries(APP_DATA)) {
    const block = BLOCKS.find((b) => b.id === id);
    expect(block, id).toBeDefined();
    for (const key of Object.keys(data)) {
      expect(block?.appOnly, `${id}.${key}`).toContain(key);
    }
  }
});
