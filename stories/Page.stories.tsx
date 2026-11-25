import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SamplePage } from './sample-page';
import { expectPageFits, onScreen } from './screens';

/*
 * A whole creator page in each theme, then on each screen. Each story's
 * accessibility check runs on every block, the theme stories check that the
 * theme reached the blocks, and the screen stories check that the page fits
 * a phone, a tablet (both ways up) and a desktop.
 */
const meta = {
  title: 'Pages/Creator page',
  component: SamplePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SamplePage>;

export default meta;
type Story = StoryObj<typeof meta>;

const styleOf = (element: Element) => getComputedStyle(element);

export const Light: Story = {
  globals: { theme: 'light' },
  play: async ({ canvas }) => {
    const buy = canvas.getByRole('button', { name: 'I’ll take it, $12' });
    await expect(styleOf(buy).backgroundColor).toBe('rgb(194, 65, 12)');
    // Story tests run 1200 px wide by default: a desktop, so the column is
    // max-w-site's 576 px.
    await expect(styleOf(canvas.getByRole('main')).maxWidth).toBe('576px');
  },
};

export const Dark: Story = {
  globals: { theme: 'dark' },
  play: async ({ canvas }) => {
    const buy = canvas.getByRole('button', { name: 'I’ll take it, $12' });
    await expect(styleOf(buy).backgroundColor).toBe('rgb(255, 138, 61)');
  },
};

/** A creator's own colours, square corners, rounded buttons and Georgia. */
export const CreatorsOwnTheme: Story = {
  globals: { theme: 'custom' },
  play: async ({ canvas }) => {
    const buy = canvas.getByRole('button', { name: 'I’ll take it, $12' });
    await expect(styleOf(buy).backgroundColor).toBe('rgb(15, 118, 110)');
    await expect(styleOf(buy).borderTopLeftRadius).toBe('12px');
    // The link tile, not the round Instagram icon in the social row.
    const links = canvas.getByRole('navigation', {
      name: 'Desi Origins links',
    });
    const tile = within(links).getByRole('link', { name: 'Instagram' });
    await expect(styleOf(tile).borderTopLeftRadius).toBe('4px');
    await expect(styleOf(buy).fontFamily).toContain('Georgia');
  },
};

/*
 * The page on each screen. The column fills a phone, then stops at 576 px
 * from a tablet up, so nothing stretches across a big screen.
 */
export const OnPhone: Story = {
  globals: { theme: 'light', ...onScreen('phone') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'phone', 420);
  },
};

export const OnTablet: Story = {
  globals: { theme: 'light', ...onScreen('tablet') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'tablet', 576);
  },
};

export const OnTabletSideways: Story = {
  globals: { theme: 'dark', ...onScreen('tabletSideways') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'tabletSideways', 576);
  },
};

export const OnDesktop: Story = {
  globals: { theme: 'custom', ...onScreen('desktop') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'desktop', 576);
  },
};
