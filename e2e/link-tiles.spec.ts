import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  APP_BADGE_LABELS,
  AppBadges,
  BLOCKS,
  BLOCK_SIZES,
  LinkCard,
  LinkChip,
  LinkList,
  LinkTile,
  LogoTile,
  limitsFor,
} from '../src';

/* Link tiles: square logo tiles, chips, preview cards and app badges. */

const render = (element: Parameters<typeof renderToString>[0]) =>
  renderToString(element);

const PREVIEW = 'https://cdn.example.com/preview.jpg';
const ICON = 'https://example.com/favicon.png';

test('each shape has its own size on the grid', () => {
  // A square tile: two fit side by side on a phone, and it can be as tall
  // as it is wide.
  expect(BLOCK_SIZES.tile.half).toBe(true);
  const tile = limitsFor('tile', 'phone');
  expect(tile.minW * 2).toBeLessThanOrEqual(10);
  expect(tile.minH).toBe(2);
  expect(tile.maxH).toBeGreaterThanOrEqual(4);
  // A chip: one row tall, and four fit across a phone.
  const chip = limitsFor('chip', 'phone');
  expect(chip.minW * 4).toBeLessThanOrEqual(10);
  expect(chip.minH).toBe(1);
  expect(limitsFor('chip', 'desktop').maxH).toBe(2);
  const kinds = Object.fromEntries(BLOCKS.map((b) => [b.id, b.kind]));
  expect(kinds).toMatchObject({
    'link-card': 'link',
    'logo-tile': 'tile',
    'link-chip': 'chip',
    'app-badges': 'link',
  });
});

test('a link card shows the preview, only the icon, or only words', () => {
  const card = (look: 'preview' | 'favicon' | 'text', image?: string | null) =>
    render(
      createElement(LinkCard, {
        href: 'https://example.com/post',
        title: 'A post',
        image,
        favicon: ICON,
        look,
      })
    );
  const preview = card('preview', PREVIEW);
  expect(preview).toContain(`src="${PREVIEW}"`);
  expect(preview).not.toContain(ICON);
  expect(preview).toContain('aspect-video');
  // No preview picture: its icon takes the place.
  expect(card('preview', null)).toContain(`src="${ICON}"`);
  const favicon = card('favicon', PREVIEW);
  expect(favicon).toContain(`src="${ICON}"`);
  expect(favicon).not.toContain(PREVIEW);
  expect(card('text', PREVIEW)).not.toContain('<img');
  expect(card('text', PREVIEW)).toContain('data-look="text"');
});

test('pictures that are not web addresses are dropped', () => {
  for (const bad of ['javascript:alert(1)', 'data:text/html,<b>', 'x" y']) {
    const html = render(
      createElement(LogoTile, {
        href: 'https://example.com',
        title: 'Shop',
        image: bad,
        favicon: bad,
        look: 'preview',
      })
    );
    expect(html, bad).not.toContain('<img');
  }
});

test('a chip is tinted in its brand colour, and only a plain colour gets in', () => {
  const chip = (tint?: string) =>
    render(
      createElement(LinkChip, {
        href: 'https://example.com/shop',
        title: 'Shop',
        tint,
      })
    );
  expect(chip('#dc2626')).toContain('style="--tile-tint:#dc2626"');
  expect(chip('red;background:url(x)')).not.toContain('style=');
  expect(chip()).not.toContain('style=');
  expect(chip()).toContain('var(--site-accent)');
});

test('a square tile has an arrow badge hidden from screen readers', () => {
  const html = render(
    createElement(
      LinkTile,
      { href: 'https://example.com', variant: 'icon' },
      'Shop'
    )
  );
  expect(html).toContain('data-variant="icon"');
  expect(html).toContain('aspect-square');
  expect(html).toMatch(/<span aria-hidden="true" data-arrow-badge=""/);
});

test('a list of chips sits four to a row, square tiles two', () => {
  const links = [{ label: 'Shop', href: 'https://example.com/shop' }];
  const list = (variant: 'chip' | 'icon' | 'row') =>
    render(createElement(LinkList, { links, variant }));
  expect(list('chip')).toContain('grid-cols-4');
  expect(list('icon')).toContain('grid-cols-2');
  expect(list('row')).not.toContain('grid-cols-');
});

test('app badges name their store, and an unsafe link shows no link', () => {
  const html = render(
    createElement(AppBadges, {
      apps: [
        { store: 'app-store', href: 'https://apps.apple.com/app/id0' },
        { store: 'google-play', href: 'javascript:alert(1)' },
      ],
    })
  );
  expect(html).toContain(`aria-label="${APP_BADGE_LABELS.list}"`);
  expect(html).toContain('Download on the');
  expect(html).toContain('href="https://apps.apple.com/app/id0"');
  expect(html).not.toContain('javascript:');
  expect(html).toContain('data-unsafe-link');
  // The store's own badge picture is named for screen readers.
  const picture = render(
    createElement(AppBadges, {
      labels: { googlePlayLead: 'Holen bei', googlePlay: 'Google Play' },
      apps: [
        {
          store: 'google-play',
          href: 'https://play.google.com/store/apps/details?id=x',
          badge: 'https://cdn.example.com/badge.png',
        },
      ],
    })
  );
  expect(picture).toContain('alt="Holen bei Google Play"');
});
