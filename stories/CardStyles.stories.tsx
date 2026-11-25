import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SamplePage } from './sample-page';

/*
 * The page's card style (SiteTheme.cards): flat, outlined, raised with a
 * shadow tinted by the accent, or glass over the page's background. Pick one
 * for any story from the toolbar's Cards menu. Links and linked cards also
 * lift a little under the pointer (SiteTheme.hover).
 */
const meta = {
  title: 'Pages/Card styles',
  component: SamplePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SamplePage>;

export default meta;
type Story = StoryObj<typeof meta>;

const shadowOf = (element: Element) => getComputedStyle(element).boxShadow;

/** The first card on the page that picks no shadow of its own. */
const firstCard = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(
    '[data-block][data-tone="surface"]:not([data-shadow])'
  )!;

export const Outlined: Story = {
  globals: { cards: 'outline' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-cards]')).toHaveAttribute(
      'data-cards',
      'outline'
    );
    await expect(shadowOf(firstCard(canvasElement))).toMatch(/inset/);
  },
};

export const Raised: Story = {
  globals: { cards: 'raised' },
  play: async ({ canvasElement }) => {
    const shadow = shadowOf(firstCard(canvasElement));
    await expect(shadow).not.toBe('none');
    await expect(shadow).not.toMatch(/inset/);
  },
};

export const RaisedDark: Story = {
  globals: { cards: 'raised', theme: 'dark' },
};

export const RaisedInACreatorsOwnTheme: Story = {
  globals: { cards: 'raised', theme: 'custom' },
};

/*
 * Glass shows the page's background through the cards. Backgrounds are set
 * by the page (Levuche/app); this story stands in a soft glow of the accent.
 */
const glow: Decorator = (Story) => (
  <div className="rounded-site bg-[radial-gradient(circle_at_15%_0%,color-mix(in_oklab,var(--site-accent)_30%,transparent),transparent_55%),radial-gradient(circle_at_90%_60%,color-mix(in_oklab,var(--site-band)_22%,transparent),transparent_50%)] p-3">
    <Story />
  </div>
);

export const Glass: Story = {
  globals: { cards: 'glass' },
  decorators: [glow],
  play: async ({ canvasElement }) => {
    const card = firstCard(canvasElement);
    await expect(getComputedStyle(card).backdropFilter).toMatch(/blur/);
    await expect(shadowOf(card)).toMatch(/inset/);
  },
};

export const GlassDark: Story = {
  globals: { cards: 'glass', theme: 'dark' },
  decorators: [glow],
};

/** Links rise a little under the pointer. */
export const LinksLiftOnHover: Story = {
  play: async ({ canvas }) => {
    const links = canvas.getByRole('navigation', {
      name: 'Desi Origins links',
    });
    const tile = within(links).getByRole('link', { name: 'Instagram' });
    await expect(tile).toHaveAttribute('data-lift');
    await userEvent.hover(tile);
    await waitFor(() =>
      expect(getComputedStyle(tile).translate).toBe('0px -2px')
    );
    await userEvent.unhover(tile);
  },
};
