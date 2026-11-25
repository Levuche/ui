import { expect, test } from '@playwright/test';
import {
  GRID_COLUMNS,
  defaultLayout,
  fitLayout,
  layoutBottom,
  limitsFor,
  pageLayouts,
  type GridBlockSpec,
  type GridLayout,
} from '../src/system/grid';

/* Plain checks of the grid helpers the page editor relies on. No browser. */

const BLOCKS: GridBlockSpec[] = [
  { i: 'profile', kind: 'profile' },
  { i: 'shop', kind: 'link' },
  { i: 'app', kind: 'link' },
  { i: 'video', kind: 'media' },
  { i: 'pack', kind: 'card' },
  { i: 'links', kind: 'links' },
  { i: 'footer', kind: 'band' },
];

const byId = (layout: GridLayout) =>
  Object.fromEntries(layout.map((item) => [item.i, item]));

const overlapping = (layout: GridLayout) =>
  layout.flatMap((a, index) =>
    layout
      .slice(index + 1)
      .filter(
        (b) =>
          a.x < b.x + b.w &&
          b.x < a.x + a.w &&
          a.y < b.y + b.h &&
          b.y < a.y + a.h
      )
      .map((b) => `${a.i}/${b.i}`)
  );

test('every block sits inside the 10 columns on every screen, with none covering another', () => {
  for (const screen of ['phone', 'tablet', 'desktop'] as const) {
    const layout = defaultLayout(BLOCKS, screen);
    expect(layout.map((item) => item.i).sort(), screen).toEqual(
      BLOCKS.map((block) => block.i).sort()
    );
    for (const item of layout) {
      expect(item.x, `${screen} ${item.i}`).toBeGreaterThanOrEqual(0);
      expect(item.x + item.w, `${screen} ${item.i}`).toBeLessThanOrEqual(
        GRID_COLUMNS
      );
      expect(item.h, `${screen} ${item.i}`).toBeGreaterThanOrEqual(1);
    }
    expect(overlapping(layout), screen).toEqual([]);
  }
});

test('a phone stacks every block full width, in reading order', () => {
  const layout = defaultLayout(BLOCKS, 'phone');
  let row = 0;
  for (const item of layout) {
    expect(item).toMatchObject({ x: 0, w: GRID_COLUMNS, y: row });
    row += item.h;
  }
});

test('a tablet puts the profile on the left and the rest on the right', () => {
  const layout = byId(defaultLayout(BLOCKS, 'tablet'));
  expect(layout.profile).toMatchObject({ x: 0, y: 0, w: 4 });
  for (const id of ['shop', 'app', 'video', 'pack', 'links', 'footer']) {
    expect(layout[id], id).toMatchObject({ x: 4, w: 6 });
  }
  expect(layout.app.y).toBe(layout.shop.y + layout.shop.h);
  // The profile's column runs the whole page, so it can stay in view.
  expect(layout.profile.h).toBe(layoutBottom(Object.values(layout)));
});

test('a desktop puts the rest in a grid on the left and the profile on the right', () => {
  const layout = byId(defaultLayout(BLOCKS, 'desktop'));
  expect(layout.profile).toMatchObject({ x: 6, y: 0, w: 4 });
  // Two links side by side, then the video across the whole column.
  expect(layout.shop).toMatchObject({ x: 0, y: 0, w: 3 });
  expect(layout.app).toMatchObject({ x: 3, y: 0, w: 3 });
  expect(layout.video).toMatchObject({ x: 0, y: layout.shop.h, w: 6 });
  // A card with no card next to it takes the whole column, leaving no gap.
  expect(layout.pack).toMatchObject({ x: 0, w: 6 });
  expect(layout.profile.h).toBe(layoutBottom(Object.values(layout)));
});

test('a page with no profile uses the whole width', () => {
  const blocks = BLOCKS.filter((block) => block.kind !== 'profile');
  expect(defaultLayout(blocks, 'tablet').every((item) => item.w === 10)).toBe(
    true
  );
  const desktop = byId(defaultLayout(blocks, 'desktop'));
  expect(desktop.shop).toMatchObject({ x: 0, w: 5 });
  expect(desktop.app).toMatchObject({ x: 5, w: 5 });
});

test('anything can join the profile in the side column', () => {
  const blocks: GridBlockSpec[] = [
    ...BLOCKS,
    { i: 'newsletter', kind: 'band', side: true },
  ];
  const layout = byId(defaultLayout(blocks, 'desktop'));
  expect(layout.newsletter).toMatchObject({
    x: 6,
    w: 4,
    y: layout.profile.y + layout.profile.h,
  });
});

test('size limits turn rem into columns and rows for each screen', () => {
  // A card needs 15rem: most of a phone, a few columns of a desktop.
  expect(limitsFor('card', 'phone').minW).toBe(7);
  expect(limitsFor('card', 'desktop').minW).toBe(3);
  // A link is one row tall, two at most.
  expect(limitsFor('link', 'desktop')).toMatchObject({ minH: 1, maxH: 2 });
  // A profile is never wider than 32rem, but always fits a phone.
  expect(limitsFor('profile', 'desktop').maxW).toBe(5);
  expect(limitsFor('profile', 'phone').maxW).toBe(10);
  expect(limitsFor('text', 'desktop').maxH).toBe(Number.POSITIVE_INFINITY);
});

test('a saved layout is kept inside the grid and the size limits', () => {
  const fitted = byId(
    fitLayout(
      [
        { i: 'profile', x: 8, y: 0, w: 9, h: 1 },
        { i: 'shop', x: -2, y: -1, w: 1, h: 9 },
        { i: 'app', x: 4.6, y: 0, w: 2, h: 1 },
      ],
      BLOCKS,
      'desktop'
    )
  );
  // Too wide: shrunk to 5 columns and moved in from the right edge.
  expect(fitted.profile).toMatchObject({ x: 5, w: 5, h: 3 });
  // Too narrow and too tall for a link, and off the top left corner.
  expect(fitted.shop).toMatchObject({ x: 0, y: 0, w: 2, h: 2 });
  expect(fitted.app).toMatchObject({ x: 5, w: 2 });
});

test('a block covering another moves down, and new blocks go at the bottom', () => {
  const fitted = fitLayout(
    [
      { i: 'shop', x: 0, y: 0, w: 10, h: 1 },
      { i: 'app', x: 2, y: 0, w: 4, h: 1 },
      { i: 'gone', x: 0, y: 4, w: 10, h: 3 },
    ],
    BLOCKS,
    'tablet'
  );
  const layout = byId(fitted);
  expect(layout.app).toMatchObject({ x: 2, y: 1 });
  expect(layout.gone).toBeUndefined();
  expect(layout.profile).toMatchObject({
    x: 0,
    y: 2,
    w: limitsFor('profile', 'tablet').maxW,
  });
  expect(overlapping(fitted)).toEqual([]);
  expect(fitted.map((item) => item.i).sort()).toEqual(
    BLOCKS.map((block) => block.i).sort()
  );
});

test('a page gets the default arrangement on screens with nothing saved', () => {
  const saved: GridLayout = [{ i: 'profile', x: 0, y: 0, w: 3, h: 5 }];
  const layouts = pageLayouts(BLOCKS, { desktop: saved });
  expect(layouts.phone).toEqual(defaultLayout(BLOCKS, 'phone'));
  expect(layouts.tablet).toEqual(defaultLayout(BLOCKS, 'tablet'));
  expect(byId(layouts.desktop).profile).toMatchObject({ x: 0, w: 3 });
  expect(byId(layouts.desktop).footer.x).toBe(0);
});
