import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import type { PageLayouts } from '../src';
import { SampleGridPage } from './sample-grid';
import { SCREENS, onScreen, type ScreenName } from './screens';

/*
 * The sample creator's page on the 10-column grid, on each screen. With no
 * saved layout, a phone stacks everything, a tablet puts the profile on the
 * left and the rest on the right, and a desktop puts the rest in a grid on
 * the left with the profile on the right. The last story is a creator's own
 * desktop arrangement.
 */
const meta = {
  title: 'Pages/Grid page',
  component: SampleGridPage,
  parameters: { layout: 'fullscreen', frame: 'wide' },
} satisfies Meta<typeof SampleGridPage>;

export default meta;
type Story = StoryObj<typeof meta>;

type Box = { left: number; right: number; top: number; bottom: number };

function boxOf(root: HTMLElement, id: string): Box {
  const element = root.querySelector(`[data-grid-block="${id}"]`);
  if (!element) throw new Error(`No block ${id}`);
  return element.getBoundingClientRect();
}

/*
 * Checks every screen: the window is the screen's width, the page never
 * scrolls sideways, and no two blocks cover each other, so rows grew to fit
 * what's in them.
 */
async function expectGridFits(root: HTMLElement, screen: ScreenName) {
  await expect(window.innerWidth).toBe(
    Number.parseInt(SCREENS[screen].styles.width, 10)
  );
  const page = document.documentElement;
  await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  const blocks = [...root.querySelectorAll<HTMLElement>('[data-grid-block]')];
  const covered: string[] = [];
  blocks.forEach((a, index) => {
    for (const b of blocks.slice(index + 1)) {
      const boxA = a.getBoundingClientRect();
      const boxB = b.getBoundingClientRect();
      const across =
        Math.min(boxA.right, boxB.right) - Math.max(boxA.left, boxB.left);
      const down =
        Math.min(boxA.bottom, boxB.bottom) - Math.max(boxA.top, boxB.top);
      if (across > 1 && down > 1) {
        covered.push(`${a.dataset.gridBlock} and ${b.dataset.gridBlock}`);
      }
    }
  });
  await expect(covered).toEqual([]);
}

export const OnPhone: Story = {
  globals: { theme: 'light', ...onScreen('phone') },
  play: async ({ canvas, canvasElement }) => {
    await expectGridFits(canvasElement, 'phone');
    const profile = boxOf(canvasElement, 'profile');
    const presets = boxOf(canvasElement, 'presets');
    const app = boxOf(canvasElement, 'app');
    // One under the other, all the same width.
    await expect(profile.bottom).toBeLessThanOrEqual(presets.top);
    await expect(presets.bottom).toBeLessThanOrEqual(app.top);
    await expect(Math.round(app.left)).toBe(Math.round(profile.left));
    await expect(Math.round(app.right)).toBe(Math.round(profile.right));
    await expect(canvas.getByRole('main')).toBeVisible();
  },
};

export const OnTablet: Story = {
  globals: { theme: 'light', ...onScreen('tablet') },
  play: async ({ canvasElement }) => {
    await expectGridFits(canvasElement, 'tablet');
    const profile = boxOf(canvasElement, 'profile');
    const presets = boxOf(canvasElement, 'presets');
    const app = boxOf(canvasElement, 'app');
    // Profile on the left, the rest one under the other on the right.
    await expect(profile.right).toBeLessThan(presets.left);
    await expect(presets.bottom).toBeLessThanOrEqual(app.top);
    await expect(Math.round(app.left)).toBe(Math.round(presets.left));
  },
};

async function expectDesktopArrangement(root: HTMLElement) {
  const profile = boxOf(root, 'profile');
  const presets = boxOf(root, 'presets');
  const app = boxOf(root, 'app');
  const video = boxOf(root, 'video');
  // The rest on the left, the profile on the right.
  await expect(video.right).toBeLessThan(profile.left);
  // Two links next to each other in one row; the video takes the whole column.
  await expect(Math.round(app.top)).toBe(Math.round(presets.top));
  await expect(presets.right).toBeLessThan(app.left);
  await expect(Math.round(video.left)).toBe(Math.round(presets.left));
  await expect(Math.round(video.right)).toBe(Math.round(app.right));
}

/** A tablet on its side is wide enough for the desktop arrangement. */
export const OnTabletSideways: Story = {
  globals: { theme: 'dark', ...onScreen('tabletSideways') },
  play: async ({ canvasElement }) => {
    await expectGridFits(canvasElement, 'tabletSideways');
    await expectDesktopArrangement(canvasElement);
  },
};

export const OnDesktop: Story = {
  globals: { theme: 'custom', ...onScreen('desktop') },
  play: async ({ canvasElement }) => {
    await expectGridFits(canvasElement, 'desktop');
    await expectDesktopArrangement(canvasElement);
    // The profile stays in view while the rest scrolls past.
    const footer = canvasElement.querySelector('[data-grid-block="footer"]');
    footer?.scrollIntoView({ block: 'end' });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const profile = boxOf(canvasElement, 'profile');
    await expect(profile.top).toBeGreaterThanOrEqual(0);
    await expect(profile.top).toBeLessThan(window.innerHeight / 2);
    window.scrollTo(0, 0);
  },
};

/*
 * A creator's own desktop arrangement: profile on the left, links in three
 * columns, the video and photos side by side. Phone and tablet keep their
 * defaults, as nothing was saved for them.
 */
const OWN_LAYOUTS: PageLayouts = {
  desktop: [
    { i: 'profile', x: 0, y: 0, w: 3, h: 14 },
    { i: 'presets', x: 3, y: 0, w: 3, h: 1 },
    { i: 'app', x: 6, y: 0, w: 1, h: 1 },
    { i: 'featured', x: 3, y: 1, w: 7, h: 3 },
    { i: 'video', x: 3, y: 4, w: 4, h: 5 },
    { i: 'photos', x: 7, y: 4, w: 3, h: 5 },
    { i: 'pack', x: 3, y: 9, w: 4, h: 3 },
    { i: 'membership', x: 7, y: 9, w: 3, h: 3 },
  ],
};

export const CreatorsOwnDesktopLayout: Story = {
  args: { layouts: OWN_LAYOUTS },
  globals: { theme: 'light', ...onScreen('desktop') },
  play: async ({ canvasElement }) => {
    await expectGridFits(canvasElement, 'desktop');
    const profile = boxOf(canvasElement, 'profile');
    const presets = boxOf(canvasElement, 'presets');
    const app = boxOf(canvasElement, 'app');
    const video = boxOf(canvasElement, 'video');
    const photos = boxOf(canvasElement, 'photos');
    await expect(profile.right).toBeLessThan(presets.left);
    // The app link was saved 1 column wide, too narrow for a link, so it
    // was widened to the 2 a link needs: over half the 3-column one.
    await expect(app.right - app.left).toBeGreaterThan(
      (presets.right - presets.left) / 2
    );
    await expect(Math.round(photos.top)).toBe(Math.round(video.top));
    await expect(video.right).toBeLessThan(photos.left);
    // Blocks with no saved place go at the bottom, full width.
    const footer = boxOf(canvasElement, 'footer');
    await expect(Math.round(footer.left)).toBe(Math.round(profile.left));
  },
};
