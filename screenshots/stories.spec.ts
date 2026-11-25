import { existsSync, readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { SCREENS, type ScreenName } from '../stories/screens';
import type { ThemeName } from '../stories/themes';

/*
 * Screenshot checks of every story. Each story is shown in the light theme on
 * a phone, a tablet and a desktop, and on a phone in the dark theme and in a
 * creator's own theme. A picture that differs from its reference fails the
 * check; the report shows the reference, the new picture and the difference.
 */

const INDEX = 'storybook-static/index.json';

type Entry = { id: string; type: string; title: string; name: string };

const stories = (): Entry[] => {
  if (!existsSync(INDEX)) {
    throw new Error('Build Storybook first: npm run build-storybook');
  }
  const { entries } = JSON.parse(readFileSync(INDEX, 'utf8')) as {
    entries: Record<string, Entry>;
  };
  return Object.values(entries).filter((entry) => entry.type === 'story');
};

/** What each story is checked in: the theme, then the screens for it. */
const RUNS: [ThemeName, ScreenName[]][] = [
  ['light', ['phone', 'tablet', 'desktop']],
  ['dark', ['phone']],
  ['custom', ['phone']],
];

/** The same moment the date stories use, so countdowns never move. */
const NOW = new Date(Date.UTC(2026, 11, 1, 9, 0, 0));

const size = (screen: ScreenName) => ({
  width: parseInt(SCREENS[screen].styles.width, 10),
  height: parseInt(SCREENS[screen].styles.height, 10),
});

async function show(page: Page, id: string, theme: ThemeName) {
  await page.goto(
    `/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=theme:${theme}`
  );
  const root = page.getByTestId('story-theme');
  await expect(root).toBeVisible();
  // Let pictures finish loading or failing before the picture is taken.
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  return root.locator(':scope > div');
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  // Nothing from outside: embeds and outside pictures would make the pictures
  // change between runs.
  await page.route(
    (url) => url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
    (route) => route.abort()
  );
});

for (const story of stories()) {
  test(`${story.title} / ${story.name}`, async ({ page }) => {
    for (const [theme, screens] of RUNS) {
      await page.setViewportSize(size(screens[0]));
      const content = await show(page, story.id, theme);
      for (const screen of screens) {
        await page.setViewportSize(size(screen));
        await expect(content).toHaveScreenshot(
          `${story.id}--${screen}--${theme}.png`
        );
      }
    }
  });
}
