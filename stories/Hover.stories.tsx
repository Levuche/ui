import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  FeaturedLink,
  ImageGrid,
  LinkList,
  SocialIcons,
  type SiteHover,
} from '../src';
import { SAMPLE_LINKS, SAMPLE_SOCIALS } from './sample-page';

/*
 * What links and linked cards do under the pointer (SiteTheme.hover): lift,
 * tint, zoom, glow or none, for the whole page from the toolbar's Hover
 * menu, or for one block with its own `hover` prop. The same look shows on
 * tap and when a keyboard reaches a link, and nothing moves for visitors who
 * ask for less motion.
 *
 * A test's pointer can't trigger :hover, so the play functions hover and
 * press like a visitor, then check the look through data-hover-preview, the
 * attribute the page editor uses to show a hover without the pointer.
 */

/** A plain picture in one colour with a word on it, for the stories. */
const picture = (fill: string, word: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="${fill}"/><text x="160" y="100" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#fff">${word}</text></svg>`
  )}`;

function HoverPage({
  featuredHover,
  linksHover,
}: {
  /** The featured card's own hover, over the page's. */
  featuredHover?: SiteHover;
  /** The link list's own hover, over the page's. */
  linksHover?: SiteHover;
}) {
  return (
    <>
      <FeaturedLink
        href="https://example.com/tea"
        title="New: how tea came to India"
        detail="12 minutes, out now"
        image={picture('#9a3412', 'Tea')}
        hover={featuredHover}
      />
      <LinkList
        label="Hover links"
        links={SAMPLE_LINKS.slice(0, 3)}
        hover={linksHover}
      />
      <ImageGrid
        columns={2}
        images={[
          {
            src: picture('#0f766e', 'Assam'),
            alt: 'Tea leaves drying in Assam',
            href: 'https://example.com/assam',
          },
          {
            src: picture('#1e1b4b', 'Kochi'),
            alt: 'A spice market in Kochi',
            href: 'https://example.com/kochi',
          },
        ]}
      />
      <SocialIcons links={SAMPLE_SOCIALS} iconStyle="chip" />
    </>
  );
}

const meta = {
  title: 'Pages/Hover',
  component: HoverPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HoverPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const pageOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-testid="story-theme"]')!;

const featuredCard = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-block="featured-link"]')!;

const firstTile = (canvasElement: HTMLElement) =>
  within(
    canvasElement.querySelector<HTMLElement>('[data-block="link-list"]')!
  ).getAllByRole('link')[0];

/** A hover variable as the link or card sees it, from the nearest choice. */
const hoverVar = (element: Element, name: string) =>
  getComputedStyle(element).getPropertyValue(`--block-hover-${name}`).trim();

const layer = (element: Element) => getComputedStyle(element, '::after');

/** Whether an element is where it started: no rise and no press. */
const still = (element: Element) =>
  ['none', '0px'].includes(getComputedStyle(element).translate);

/**
 * Hovers and presses like a visitor, then shows the hover through the
 * editor's preview and waits for it to settle. Returns a function that ends
 * the preview.
 */
async function showHover(page: HTMLElement, link: HTMLElement, press = false) {
  await userEvent.hover(link);
  if (press) await userEvent.pointer({ keys: '[MouseLeft>]', target: link });
  page.setAttribute('data-hover-preview', press ? 'press' : '');
  await waitFor(() => expect(layer(link).opacity).toBe('1'));
  return async () => {
    if (press) await userEvent.pointer({ keys: '[/MouseLeft]', target: link });
    await userEvent.unhover(link);
    link.blur();
    page.removeAttribute('data-hover-preview');
    await waitFor(() => expect(layer(link).opacity).toBe('0'));
  };
}

/** Lift, the default: links and the featured card rise 2px. */
export const Lift: Story = {
  globals: { hover: 'lift' },
  play: async ({ canvasElement }) => {
    const page = pageOf(canvasElement);
    await expect(page).not.toHaveAttribute('data-hover');
    const tile = firstTile(canvasElement);
    await expect(hoverVar(tile, 'y')).toBe('-2px');
    const end = await showHover(page, tile);
    await waitFor(() =>
      expect(getComputedStyle(tile).translate).toBe('0px -2px')
    );
    await waitFor(() =>
      expect(getComputedStyle(featuredCard(canvasElement)).translate).toBe(
        '0px -2px'
      )
    );
    await end();
  },
};

/** Tint: the fill deepens with a little of the text colour; nothing moves. */
export const Tint: Story = {
  globals: { hover: 'tint' },
  play: async ({ canvasElement }) => {
    const page = pageOf(canvasElement);
    await expect(page).toHaveAttribute('data-hover', 'tint');
    const tile = firstTile(canvasElement);
    await expect(hoverVar(tile, 'fill')).toBe('8%');
    const end = await showHover(page, tile);
    await expect(still(tile)).toBe(true);
    await expect(layer(tile).boxShadow).toMatch(/inset/);
    await end();
  },
};

/**
 * Zoom: the picture inside grows a little, clipped to the card. A link with
 * no picture deepens its fill instead.
 */
export const Zoom: Story = {
  globals: { hover: 'zoom' },
  play: async ({ canvasElement, canvas }) => {
    const page = pageOf(canvasElement);
    const pictureLink = canvas.getByRole('link', {
      name: 'Tea leaves drying in Assam',
    });
    const img = pictureLink.querySelector('img')!;
    await expect(getComputedStyle(pictureLink).overflow).toBe('clip');
    await expect(hoverVar(pictureLink, 'fill')).toBe('0%');
    await expect(hoverVar(firstTile(canvasElement), 'fill')).toBe('8%');
    const end = await showHover(page, pictureLink);
    await waitFor(() => expect(getComputedStyle(img).scale).toBe('1.06'));
    await expect(still(pictureLink)).toBe(true);
    await end();
    await waitFor(() =>
      expect(['none', '1']).toContain(getComputedStyle(img).scale)
    );
  },
};

/** Glow: a line and a soft glow in the button colour, inside the edge. */
export const Glow: Story = {
  globals: { hover: 'glow' },
  play: async ({ canvasElement }) => {
    const page = pageOf(canvasElement);
    const tile = firstTile(canvasElement);
    await expect(hoverVar(tile, 'line')).toBe('2px');
    const end = await showHover(page, tile);
    await expect(layer(tile).boxShadow).toMatch(/inset 0px 0px 0px 2px/);
    await expect(still(tile)).toBe(true);
    await end();
  },
};

export const GlowDark: Story = {
  globals: { hover: 'glow', theme: 'dark' },
};

/** None: links stay still and keep their colours. */
export const None: Story = {
  globals: { hover: 'none' },
  play: async ({ canvasElement }) => {
    const page = pageOf(canvasElement);
    await expect(page).toHaveAttribute('data-hover', 'none');
    const tile = firstTile(canvasElement);
    page.setAttribute('data-hover-preview', '');
    await waitFor(() => expect(layer(tile).opacity).toBe('1'));
    await expect(still(tile)).toBe(true);
    await expect(layer(tile).boxShadow).not.toMatch(/2px/);
    await expect(hoverVar(tile, 'fill')).toBe('0%');
    page.removeAttribute('data-hover-preview');
  },
};

/**
 * One block's own hover wins over the page's: here the page tints, the
 * featured card zooms and the link list glows. The social chips and the
 * pictures follow the page.
 */
export const OneBlockItsOwn: Story = {
  globals: { hover: 'tint' },
  args: { featuredHover: 'zoom', linksHover: 'glow' },
  play: async ({ canvasElement, canvas }) => {
    const card = featuredCard(canvasElement);
    await expect(card).toHaveAttribute('data-hover', 'zoom');
    await expect(hoverVar(card, 'zoom')).toBe('1.06');
    const tile = firstTile(canvasElement);
    await expect(hoverVar(tile, 'line')).toBe('2px');
    await expect(hoverVar(tile, 'fill')).toBe('0%');
    const chip = canvas.getByRole('link', { name: 'Instagram' });
    await expect(hoverVar(chip, 'fill')).toBe('8%');
    await expect(hoverVar(chip, 'line')).toBe('0px');
  },
};

/** On tap, a lifting link presses in, for touch screens. */
export const Press: Story = {
  globals: { hover: 'lift' },
  play: async ({ canvasElement }) => {
    const tile = firstTile(canvasElement);
    const end = await showHover(pageOf(canvasElement), tile, true);
    await waitFor(() => expect(getComputedStyle(tile).scale).toBe('0.98'));
    await expect(still(tile)).toBe(true);
    await end();
  },
};

/**
 * From a keyboard, a link shows its hover and a focus ring. The featured
 * card draws the ring on itself, since the card clips its link.
 */
export const KeyboardFocus: Story = {
  globals: { hover: 'glow' },
  play: async ({ canvasElement }) => {
    const card = featuredCard(canvasElement);
    const link = within(card).getByRole('link');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.matches(':focus-visible')).toBe(true);
    await expect(getComputedStyle(card).outlineStyle).toBe('solid');
    await waitFor(() => expect(layer(card).opacity).toBe('1'));
    await userEvent.tab();
    const tile = firstTile(canvasElement);
    await expect(tile).toHaveFocus();
    await expect(getComputedStyle(tile).outlineStyle).not.toBe('none');
    await waitFor(() => expect(layer(tile).opacity).toBe('1'));
    await waitFor(() => expect(layer(card).opacity).toBe('0'));
    tile.blur();
  },
};
