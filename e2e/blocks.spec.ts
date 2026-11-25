import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

/*
 * The page blocks, through the gallery (gallery/). Each test runs in every
 * theme: the sample creator's light and dark schemes, and a creator's own
 * colours, corners, button shape and font.
 */

const THEMES = {
  light: { scheme: 'light', accent: 'rgb(194, 65, 12)' },
  dark: { scheme: 'dark', accent: 'rgb(255, 138, 61)' },
  custom: { scheme: 'light', accent: 'rgb(15, 118, 110)' },
} as const;

/** control-sm: 44 px on a touch screen (the phone run), 40 px with a mouse. */
const tapMin = (page: Page) =>
  page.evaluate(() => (matchMedia('(pointer: coarse)').matches ? 44 : 40));

test.beforeEach(async ({ page }) => {
  // The video block must not reach YouTube until play is pressed; answer for
  // YouTube here so the tests never depend on it.
  await page.route(/youtube(-nocookie)?\.com|ytimg\.com/, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Video</title>' })
  );
  const response = await page.goto('/');
  expect(response?.status(), 'the gallery should load').toBe(200);
});

for (const [id, expected] of Object.entries(THEMES)) {
  test.describe(`${id} theme`, () => {
    let panel: Locator;
    test.beforeEach(async ({ page }) => {
      panel = page.getByTestId(`panel-${id}`);
      await expect(panel).toHaveAttribute('data-site', expected.scheme);
    });

    test('buttons use the theme’s colour and are big enough to tap', async ({
      page,
    }) => {
      const min = await tapMin(page);
      const buttons = panel.getByTestId('buttons');
      const solid = buttons.getByRole('button', { name: 'Solid' });
      expect(
        await solid.evaluate((el) => getComputedStyle(el).backgroundColor)
      ).toBe(expected.accent);
      await expect(
        buttons.getByRole('button', { name: 'Sold out' })
      ).toBeDisabled();
      for (const name of ['Small', 'Medium', 'Large', 'Outline', 'Text']) {
        const box = await buttons
          .getByRole('button', { name, exact: true })
          .boundingBox();
        expect(box?.height ?? 0, name).toBeGreaterThanOrEqual(min);
      }
    });

    test('links to other sites open in a new tab', async ({ page }) => {
      const links = panel.getByRole('navigation', {
        name: 'Desi Origins links',
      });
      const youtube = links.getByRole('link', { name: /YouTube channel/ });
      await expect(youtube).toHaveAttribute('target', '_blank');
      await expect(youtube).toHaveAttribute('rel', /noopener/);
      await expect(youtube).toContainText('New video every Friday');
      const email = links.getByRole('link', { name: 'Email me' });
      await expect(email).not.toHaveAttribute('target', '_blank');
      const shop = panel.getByRole('link', { name: 'Shop my presets' });
      await expect(shop).toHaveAttribute('target', '_blank');
      const box = await shop.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(await tapMin(page));
    });

    test('video loads YouTube only after play is pressed', async () => {
      const video = panel.getByTestId('video');
      await expect(video.locator('iframe')).toHaveCount(0);
      await video
        .getByRole('button', { name: 'Play video: How tea came to India' })
        .click();
      const frame = video.locator('iframe');
      await expect(frame).toHaveAttribute('title', 'How tea came to India');
      await expect(frame).toHaveAttribute(
        'src',
        /^https:\/\/www\.youtube-nocookie\.com\/embed\/M7lc1UVf-VE\?/
      );
    });

    test('checkout needs the consent box ticked', async () => {
      const selling = panel.getByTestId('selling');
      const buy = selling.getByRole('button', { name: 'I’ll take it, $12' });
      await buy.click();
      await expect(selling.getByRole('status')).toHaveCount(0);
      await selling
        .getByRole('checkbox', { name: /14-day right to cancel/ })
        .check();
      await buy.click();
      await expect(selling.getByRole('status')).toHaveText('Checkout started');
    });

    test('newsletter checks the address before subscribing', async () => {
      const band = panel.getByTestId('newsletter');
      const email = band.getByRole('textbox', { name: 'Email' });
      const subscribe = band.getByRole('button', { name: 'Subscribe' });
      await email.fill('not-an-email');
      await subscribe.click();
      await expect(email).toHaveJSProperty('validity.valid', false);
      await email.fill('reader@example.com');
      await subscribe.click();
      await expect(band.getByRole('status')).toHaveText('Subscribed');
    });

    test('has no serious accessibility problems', async ({ page }) => {
      await expectNoA11yViolations(page, `[data-testid="panel-${id}"]`);
    });
  });
}

test('a creator’s theme changes corners, button shape and font', async ({
  page,
}) => {
  const custom = page.getByTestId('panel-custom');
  const light = page.getByTestId('panel-light');
  const radius = (panel: Locator, name: string) =>
    panel
      .getByRole('button', { name, exact: true })
      .evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
  expect(await radius(custom, 'Solid')).toBe('12px');
  expect(await radius(light, 'Solid')).not.toBe('12px');
  const tileRadius = await custom
    .getByRole('link', { name: 'Instagram' })
    .evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
  expect(tileRadius).toBe('4px');
  const font = await custom.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).toContain('Georgia');
});

test('the page does not scroll sideways on any screen', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('controls are 40 px with a mouse and grow to 44 px on touch', async ({
  page,
}) => {
  const coarse = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches
  );
  const small = page
    .getByTestId('panel-light')
    .getByTestId('buttons')
    .getByRole('button', { name: 'Small', exact: true });
  const box = await small.boundingBox();
  expect(box?.height).toBe(coarse ? 44 : 40);
});
