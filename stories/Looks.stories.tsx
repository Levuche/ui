import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { SITE_LOOKS, type SiteLookName } from '../src';
import { SamplePage } from './sample-page';

/*
 * Ready-made looks (SITE_LOOKS): a whole theme a creator picks in one tap,
 * setting colours, cards, corners, buttons and fonts together. Pick one for
 * any story from the toolbar's Look menu. Each story checks the look reached
 * the page; the accessibility check checks it can be read.
 */
const meta = {
  title: 'Pages/Ready-made looks',
  component: SamplePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SamplePage>;

export default meta;
type Story = StoryObj<typeof meta>;

const lookStory = (name: SiteLookName): Story => ({
  name: SITE_LOOKS[name].title,
  globals: { look: name },
  play: async ({ canvasElement }) => {
    const { theme } = SITE_LOOKS[name];
    const page = canvasElement.querySelector<HTMLElement>(
      '[data-testid="story-theme"]'
    )!;
    await expect(page).toHaveAttribute('data-site', theme.scheme ?? 'light');
    await expect(page.style.getPropertyValue('--site-accent')).toBe(
      theme.colors?.accent
    );
    if (theme.cards && theme.cards !== 'flat') {
      await expect(page).toHaveAttribute('data-cards', theme.cards);
    } else {
      await expect(page).not.toHaveAttribute('data-cards');
    }
    if (theme.hover === 'none') {
      await expect(page).toHaveAttribute('data-hover', 'none');
    }
  },
});

export const Clean = lookStory('clean');
export const Soft = lookStory('soft');
export const Bold = lookStory('bold');
export const Night = lookStory('night');
export const Paper = lookStory('paper');
export const Terminal = lookStory('terminal');
