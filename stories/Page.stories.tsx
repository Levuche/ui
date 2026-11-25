import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SamplePage } from './sample-page';

/*
 * A whole creator page in each theme. Each story's accessibility check runs on
 * every block in that theme, and the play function checks that the theme
 * reached the blocks.
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
    // SitePage keeps the column to max-w-site however wide the screen is.
    await expect(styleOf(canvas.getByRole('main')).maxWidth).toBe('420px');
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
