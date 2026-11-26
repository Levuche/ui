import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';
import {
  AppBadges,
  AppIcon,
  CameraIcon,
  EmailIcon,
  GlobeIcon,
  LinkCard,
  LinkChip,
  LinkList,
  LogoTile,
  VideoIcon,
} from '../src';
import { expectTapSize } from './expect-tap-size';

/*
 * Links in other shapes: square logo tiles with an arrow badge, small chips
 * tinted in the brand colour, cards that show the linked site's preview
 * picture or icon, and app store badges.
 */
const meta = {
  title: 'Blocks/Link tiles',
  component: LogoTile,
  tags: ['autodocs'],
  args: {
    href: 'https://www.youtube.com/@example',
    title: 'YouTube',
    icon: <VideoIcon />,
  },
} satisfies Meta<typeof LogoTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain picture in one colour with a word on it, for the stories. */
const picture = (fill: string, word: string, size = 96) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${fill}"/><text x="${size / 2}" y="${size / 2 + 8}" font-family="sans-serif" font-size="20" text-anchor="middle" fill="#fff">${word}</text></svg>`
  )}`;

/** A wide preview picture, as a site shares for its links. */
const preview = (fill: string, word: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="${fill}"/><text x="160" y="100" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#fff">${word}</text></svg>`
  )}`;

/** About half a phone's width, as a square tile on the grid. */
const half: Decorator<ComponentProps<typeof LogoTile>> = (Story) => (
  <div style={{ maxWidth: 200 }}>
    <Story />
  </div>
);

/** A square tile with a big icon, its name and an arrow badge in the corner. */
export const Logo: Story = {
  decorators: [half],
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'YouTube' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('data-variant', 'icon');
    await expectTapSize(link, 'YouTube');
    // Square, and the arrow badge is decoration.
    const box = link.getBoundingClientRect();
    await expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    const badge = link.querySelector('[data-arrow-badge]');
    await expect(badge).toHaveAttribute('aria-hidden', 'true');
  },
};

/** A logo picture, shown whole, on a tile washed with the brand colour. */
export const LogoPictureTinted: Story = {
  decorators: [half],
  args: {
    title: 'Origins shop',
    image: picture('#0f766e', 'Shop'),
    tint: '#0f766e',
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Origins shop' });
    await expect(link.style.getPropertyValue('--tile-tint')).toBe('#0f766e');
    const img = link.querySelector('img')!;
    await expect(img).toHaveAttribute('alt', '');
    await expect(img).toHaveClass('object-contain');
  },
};

/** With `look` preview the picture fills the tile; the name sits on a pill. */
export const PictureFillsTheTile: Story = {
  decorators: [half],
  args: {
    title: 'New video',
    image: picture('#9a3412', 'Tea', 200),
    look: 'preview',
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'New video' });
    await expect(link).toHaveAttribute('data-look', 'preview');
    await expect(link.querySelector('img')).toHaveClass('object-cover');
  },
};

/** A colour that isn't a plain colour, and an unsafe picture, are dropped. */
export const UnsafeTintAndPicture: Story = {
  decorators: [half],
  args: {
    title: 'Blog',
    tint: 'red;background:url(x)',
    image: 'javascript:alert(1)',
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Blog' });
    await expect(link.style.getPropertyValue('--tile-tint')).toBe('');
    await expect(link.querySelector('img')).toBeNull();
  },
};

const chips = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@example',
    icon: <VideoIcon size={20} />,
    tint: '#dc2626',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/example',
    icon: <CameraIcon size={20} />,
    tint: '#c026d3',
  },
  {
    label: 'App',
    href: 'https://example.com/app',
    icon: <AppIcon size={20} />,
  },
  {
    label: 'Blog',
    href: 'https://example.com/blog',
    icon: <GlobeIcon size={20} />,
    tint: '#0f766e',
  },
  {
    label: 'Email',
    href: 'mailto:hello@example.com',
    icon: <EmailIcon size={20} />,
  },
];

/** Small chips, four to a row, each tinted in its brand colour. */
export const Chips: StoryObj<typeof LinkList> = {
  render: () => (
    <LinkList label="Desi Origins links" variant="chip" links={chips} />
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(5);
    const tops = links.map((link) => link.getBoundingClientRect().top);
    // The first four share a row; the fifth starts the next one.
    for (const top of tops.slice(1, 4)) {
      await expect(Math.abs(top - tops[0]!)).toBeLessThan(1);
    }
    await expect(tops[4]!).toBeGreaterThan(tops[0]!);
    for (const link of links) {
      await expect(link).toHaveAttribute('data-variant', 'chip');
      await expectTapSize(link, link.textContent ?? 'chip');
    }
    await expect(links[0]!.style.getPropertyValue('--tile-tint')).toBe(
      '#dc2626'
    );
    // No brand colour: the accent tints it.
    await expect(links[2]!.style.getPropertyValue('--tile-tint')).toBe('');
    await expect(
      canvas.getByRole('link', { name: 'Email' })
    ).not.toHaveAttribute('target');
  },
};

/** One chip on its own, as a block on the grid. */
export const Chip: StoryObj<typeof LinkChip> = {
  render: () => (
    <div style={{ maxWidth: 96 }}>
      <LinkChip
        href="https://example.com/shop"
        title="Shop"
        icon={<GlobeIcon size={20} />}
        tint="#9a3412"
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Shop' });
    await expectTapSize(link, 'Shop');
    await expect(link.style.getPropertyValue('--tile-tint')).toBe('#9a3412');
  },
};

/** Square logo tiles in a list: two to a row. */
export const LogoTiles: StoryObj<typeof LinkList> = {
  render: () => (
    <LinkList
      label="Desi Origins links"
      variant="icon"
      links={chips.slice(0, 4)}
    />
  ),
  play: async ({ canvas }) => {
    const [first, second, third] = canvas.getAllByRole('link');
    const a = first!.getBoundingClientRect();
    const b = second!.getBoundingClientRect();
    await expect(Math.abs(a.top - b.top)).toBeLessThan(1);
    await expect(third!.getBoundingClientRect().top).toBeGreaterThan(a.top);
    await expect(Math.abs(a.width - a.height)).toBeLessThan(2);
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.querySelector('[data-arrow-badge]')).not.toBeNull();
    }
  },
};

const blog = {
  href: 'https://example.com/blog/how-tea-came-to-india',
  title: 'How tea came to India',
  detail: 'example.com',
  image: preview('#9a3412', 'Tea'),
  favicon: picture('#0f766e', 'E', 32),
};

/** The three looks of a link card: the site's preview, its icon, or words. */
export const CardLooks: StoryObj<typeof LinkCard> = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <LinkCard {...blog} look="preview" data-testid="preview" />
      <LinkCard {...blog} look="favicon" data-testid="favicon" />
      <LinkCard {...blog} look="text" data-testid="text" />
    </div>
  ),
  play: async ({ canvas }) => {
    const card = (look: string) => canvas.getByTestId(look).querySelector('a')!;
    // The preview shows the wide picture.
    const wide = card('preview').querySelector('img')!;
    await expect(wide).toHaveClass('aspect-video');
    // The favicon look shows only the small icon.
    const icon = card('favicon').querySelector('img')!;
    await expect(icon.getAttribute('src')).toBe(blog.favicon);
    await expect(icon).toHaveClass('object-contain');
    // Words only.
    await expect(card('text').querySelector('img')).toBeNull();
    for (const look of ['preview', 'favicon', 'text']) {
      await expect(card(look)).toHaveAttribute('data-look', look);
      await expect(card(look)).toHaveAccessibleName(/How tea came to India/);
      await expectTapSize(card(look), look);
    }
  },
};

/** A preview with no picture shows the site's icon instead. */
export const CardWithoutPreview: StoryObj<typeof LinkCard> = {
  render: () => <LinkCard {...blog} image={null} />,
  play: async ({ canvas }) => {
    const img = canvas.getByRole('link').querySelector('img')!;
    await expect(img.getAttribute('src')).toBe(blog.favicon);
  },
};

/** Badges for an app's store pages, in the page's colours. */
export const StoreBadges: StoryObj<typeof AppBadges> = {
  render: () => (
    <AppBadges
      apps={[
        { store: 'app-store', href: 'https://apps.apple.com/app/id000000' },
        {
          store: 'google-play',
          href: 'https://play.google.com/store/apps/details?id=com.example',
        },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Get the app' });
    await expect(nav).toBeVisible();
    const apple = canvas.getByRole('link', {
      name: 'Download on the App Store',
    });
    const play = canvas.getByRole('link', { name: 'Get it on Google Play' });
    for (const link of [apple, play]) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('data-action', 'app_store_click');
      await expectTapSize(link, link.textContent ?? 'badge');
    }
  },
};

/** The store's own badge picture, when the app has it, named for screen readers. */
export const StoreBadgePictures: StoryObj<typeof AppBadges> = {
  render: () => (
    <AppBadges
      labels={{ list: 'Our app' }}
      apps={[
        {
          store: 'google-play',
          href: 'https://play.google.com/store/apps/details?id=com.example',
          badge: preview('#111827', 'Google Play'),
        },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Our app' })
    ).toBeVisible();
    const img = canvas.getByRole('img', { name: 'Get it on Google Play' });
    await expect(img.closest('a')).toHaveAttribute('data-store', 'google-play');
  },
};
