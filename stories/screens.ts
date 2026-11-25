import { expect } from 'storybook/test';

/*
 * The screens to check every block on. Pick one from the toolbar's screen
 * menu; the Pages/Creator page stories fix one each. A story's test (npm run
 * test:stories) runs at the size its story picks.
 */
export const SCREENS = {
  phone: {
    name: 'Phone (390 × 844)',
    styles: { width: '390px', height: '844px' },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet (820 × 1180)',
    styles: { width: '820px', height: '1180px' },
    type: 'tablet',
  },
  tabletSideways: {
    name: 'Tablet, sideways (1180 × 820)',
    styles: { width: '1180px', height: '820px' },
    type: 'tablet',
  },
  desktop: {
    name: 'Desktop (1440 × 900)',
    styles: { width: '1440px', height: '900px' },
    type: 'desktop',
  },
} as const;

export type ScreenName = keyof typeof SCREENS;

/** Story globals that show a story on one of the screens above. */
export const onScreen = (screen: ScreenName) => ({
  viewport: { value: screen, isRotated: false },
});

/**
 * Checks a page at the screen size its story picked: the screen really is that
 * wide, the page never scrolls sideways, the column fills the screen up to
 * `maxColumn` px and no further, and nothing inside it spills over its edges.
 */
export async function expectPageFits(
  column: HTMLElement,
  screen: ScreenName,
  maxColumn: number
) {
  await expect(window.innerWidth).toBe(
    Number.parseInt(SCREENS[screen].styles.width, 10)
  );
  const root = document.documentElement;
  await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
  // The room the page has: the story's frame, less its padding.
  const frame = column.closest<HTMLElement>('[data-testid="story-theme"]');
  const frameStyle = getComputedStyle(frame ?? root);
  const room =
    (frame ?? root).clientWidth -
    Number.parseFloat(frameStyle.paddingLeft) -
    Number.parseFloat(frameStyle.paddingRight);
  const box = column.getBoundingClientRect();
  await expect(Math.round(box.width)).toBe(
    Math.round(Math.min(room, maxColumn))
  );
  const spilled = [...column.querySelectorAll<HTMLElement>('*')]
    .filter((el) => {
      const style = getComputedStyle(el);
      // Screen-reader-only text is clipped to nothing on purpose.
      if (style.clip !== 'auto' && style.position === 'absolute') return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      return rect.left < box.left - 1 || rect.right > box.right + 1;
    })
    .map(
      (el) =>
        `${el.tagName.toLowerCase()} ${el.getAttribute('aria-label') ?? el.textContent?.slice(0, 30) ?? ''}`
    );
  await expect(spilled).toEqual([]);
}
