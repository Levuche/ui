import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './a11y';

/*
 * The page blocks, through the gallery (gallery/). Each test runs in every
 * theme: the sample creator's light and dark schemes, and a creator's own
 * colours, corners, button shape and font.
 */

const THEMES = {
  light: { scheme: 'light', accent: 'rgb(194, 65, 12)', hex: '#c2410c' },
  dark: { scheme: 'dark', accent: 'rgb(255, 138, 61)', hex: '#ff8a3d' },
  custom: { scheme: 'light', accent: 'rgb(15, 118, 110)', hex: '#0f766e' },
} as const;

/** control: 44 px on a touch screen (the phone run), 40 px with a mouse. */
const tapMin = (page: Page) =>
  page.evaluate(() => (matchMedia('(pointer: coarse)').matches ? 44 : 40));

test.beforeEach(async ({ page }) => {
  // The video block must not reach YouTube until play is pressed; answer for
  // YouTube here so the tests never depend on it.
  await page.route(/youtube(-nocookie)?\.com|ytimg\.com/, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Video</title>' })
  );
  // The same for the music player.
  await page.route(/soundcloud\.com/, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Player</title>' })
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

    test('music loads SoundCloud only after play, in the theme’s colour', async ({
      page,
    }) => {
      const music = panel.getByTestId('music');
      await expect(music.locator('iframe')).toHaveCount(0);
      const play = music.getByRole('button', { name: 'Play: Chai at dawn' });
      const box = await play.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(await tapMin(page));
      await play.click();
      const frame = music.locator('iframe');
      await expect(frame).toHaveAttribute('title', 'Chai at dawn');
      const src = new URL((await frame.getAttribute('src')) ?? '');
      expect(src.origin).toBe('https://w.soundcloud.com');
      expect(src.searchParams.get('url')).toBe(
        'https://soundcloud.com/desi-origins/chai-at-dawn'
      );
      expect(src.searchParams.get('color')).toBe(expected.hex);
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

    test('link tiles are square, chips sit four to a row, badges name their store', async ({
      page,
    }) => {
      const min = await tapMin(page);
      const tiles = panel.getByTestId('link-tiles');
      const tile = tiles.getByRole('link', { name: 'YouTube' });
      await expect(tile).toHaveAttribute('target', '_blank');
      const box = await tile.boundingBox();
      expect(Math.abs((box?.width ?? 0) - (box?.height ?? 1))).toBeLessThan(2);
      await expect(tile.locator('[data-arrow-badge]')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
      const tops: number[] = [];
      for (const name of ['Instagram', 'Blog', 'Shop', 'Email']) {
        const chip = await tiles.getByRole('link', { name }).boundingBox();
        expect(chip?.height ?? 0, name).toBeGreaterThanOrEqual(min);
        tops.push(chip?.y ?? -1);
      }
      expect(new Set(tops).size).toBe(1);
      const badges = tiles.getByRole('navigation', { name: 'Get the app' });
      await expect(
        badges.getByRole('link', { name: 'Download on the App Store' })
      ).toHaveAttribute('target', '_blank');
      await expect(
        badges.getByRole('link', { name: 'Get it on Google Play' })
      ).toHaveAttribute('data-action', 'app_store_click');
    });

    test('social icons and the featured link open other sites in a new tab', async ({
      page,
    }) => {
      const social = panel.getByTestId('social');
      const icons = social.getByRole('navigation', { name: 'Social accounts' });
      const min = await tapMin(page);
      for (const name of ['Instagram', 'YouTube', 'Email']) {
        const box = await icons.getByRole('link', { name }).boundingBox();
        expect(box?.height ?? 0, name).toBeGreaterThanOrEqual(min);
      }
      await expect(
        icons.getByRole('link', { name: 'YouTube' })
      ).toHaveAttribute('target', '_blank');
      await expect(
        icons.getByRole('link', { name: 'Email' })
      ).not.toHaveAttribute('target', '_blank');
      await expect(
        social.getByRole('link', { name: /how tea came to India/ })
      ).toHaveAttribute('target', '_blank');
    });

    test('the social card links to the profile with a readable button', async ({
      page,
    }) => {
      const card = panel
        .getByTestId('social')
        .locator('[data-block="social-card"]');
      await expect(card).toHaveAttribute('data-platform', 'youtube');
      await expect(card.getByText('86K')).toBeVisible();
      const button = card.getByRole('link', {
        name: 'Subscribe Desi Origins on YouTube',
      });
      await expect(button).toHaveAttribute(
        'href',
        'https://www.youtube.com/@desiorigins'
      );
      await expect(button).toHaveAttribute('target', '_blank');
      await expect(button).toHaveAttribute('data-action', 'social_follow');
      const box = await button.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(await tapMin(page));
      // Tinted: the brand's red, with white words on it.
      await expect(button).toHaveCSS('background-color', 'rgb(204, 0, 0)');
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
    });

    test('a press anywhere on the action card follows its link', async ({
      page,
    }) => {
      await page.route('https://example.com/**', (route) =>
        route.fulfill({ contentType: 'text/html', body: '<title>Shop</title>' })
      );
      const card = panel
        .getByTestId('social')
        .locator('[data-block="action-card"]');
      const link = card.getByRole('link', { name: 'Shop the presets' });
      await expect(link).toHaveAttribute('href', 'https://example.com/presets');
      await expect(link).toHaveAttribute('data-action', 'link_click');
      // On the title, nowhere near the bar.
      const opened = page.waitForEvent('popup');
      await card.click({ position: { x: 12, y: 12 } });
      expect((await opened).url()).toBe('https://example.com/presets');
    });

    test('booking and membership link to their pages', async () => {
      const offers = panel.getByTestId('offers');
      await expect(
        offers.getByRole('link', { name: 'Book a call' })
      ).toHaveAttribute('href', 'https://example.com/book');
      await expect(offers.getByRole('link', { name: 'Join' })).toHaveAttribute(
        'href',
        'https://example.com/join'
      );
    });

    test('the free guide checks the address before sending', async () => {
      const offers = panel.getByTestId('offers');
      const email = offers.getByRole('textbox', { name: 'Email' });
      const send = offers.getByRole('button', { name: 'Send it to me' });
      await email.fill('nope');
      await send.click();
      await expect(offers.getByRole('status')).toHaveCount(0);
      await email.fill('reader@example.com');
      await send.click();
      await expect(offers.getByRole('status')).toHaveText('Guide sent');
    });

    test('the tip jar sends the amount picked or typed', async () => {
      const tips = panel.getByTestId('tips');
      await tips.getByText('$10', { exact: true }).click();
      await expect(tips.getByRole('radio', { name: '$10' })).toBeChecked();
      await tips.getByRole('spinbutton', { name: 'Other amount' }).fill('25');
      await expect(tips.getByRole('radio', { name: '$10' })).not.toBeChecked();
      await tips.getByRole('button', { name: 'Tip $25' }).click();
      await expect(tips.getByRole('status')).toHaveText('Tip of 25 started');
    });

    test('the code copies with one tap and the countdown shows time left', async ({
      page,
      context,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const promo = panel.getByTestId('promo');
      await expect(promo.getByRole('timer')).toHaveText(
        '03days05hours00minutes00seconds'
      );
      await promo.getByRole('button', { name: 'Copy code' }).click();
      await expect(promo.getByRole('status')).toHaveText('Copied ORIGINS10');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        'ORIGINS10'
      );
    });

    test('the event card says how far away it is and adds to a calendar', async ({
      page,
    }) => {
      const card = panel
        .getByTestId('promo')
        .locator('[data-block="event-card"]');
      await expect(card).toHaveAttribute('data-state', 'upcoming');
      await expect(card.locator('[data-chip]')).toHaveText('In 3 months');
      await expect(card.locator('time')).toHaveAttribute(
        'datetime',
        '2027-03-15T13:30:00.000Z'
      );
      await expect(
        card.getByRole('link', { name: /^Get tickets ?: Live cooking night$/ })
      ).toHaveAttribute('href', 'https://example.com/tickets');
      const open = card.locator('summary');
      const box = await open.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(await tapMin(page));
      const google = card.getByRole('link', { name: 'Google Calendar' });
      await expect(google).toBeHidden();
      await open.click();
      await expect(google).toBeVisible();
      const params = new URL((await google.getAttribute('href'))!).searchParams;
      expect(params.get('dates')).toBe('20270315T133000Z/20270315T163000Z');
      expect(params.get('ctz')).toBe('Asia/Kolkata');
      const file = card.getByRole('link', { name: 'Other calendars (.ics)' });
      await expect(file).toHaveAttribute('download', 'live-cooking-night.ics');
      const href = (await file.getAttribute('href'))!;
      expect(href.startsWith('data:text/calendar;charset=utf-8,')).toBe(true);
      const text = decodeURIComponent(href.slice(href.indexOf(',') + 1));
      expect(text).toContain('DTSTART:20270315T133000Z');
      expect(text).toContain('LOCATION:The Old Hall\\, Pune');
    });

    test('goals and lists show how far along they are as progress bars', async () => {
      const goals = panel.getByTestId('goals');
      const series = goals.getByRole('progressbar', {
        name: 'Film the spice series',
      });
      await expect(series).toHaveAttribute('aria-valuenow', '2');
      await expect(series).toHaveAttribute('aria-valuemax', '4');
      await expect(series).toHaveAttribute(
        'aria-valuetext',
        '2 of 4 done, 50%'
      );
      // Ten steps, half of them filled, in the theme's accent.
      await expect(series.locator('span')).toHaveCount(10);
      await expect(series.locator('[data-filled]')).toHaveCount(5);
      await expect(series.locator('[data-filled]').first()).toHaveCSS(
        'background-color',
        expected.accent
      );
      await expect(goals.getByText('37 days left')).toBeVisible();
      await expect(
        goals.getByRole('list', { name: 'Steps' }).getByRole('listitem')
      ).toHaveCount(4);

      const camera = goals.getByRole('progressbar', {
        name: 'Fund a new camera',
      });
      await expect(camera).toHaveAttribute(
        'aria-valuetext',
        '₹37,000 of ₹100,000, 37%'
      );
      await expect(camera.locator('span')).toHaveCSS(
        'background-color',
        expected.accent
      );

      await expect(
        goals.getByRole('progressbar', { name: 'Marathi' })
      ).toHaveAttribute('aria-valuetext', '4 of 5');
    });

    test('a locked link stays out of the page until the code is right', async ({
      page,
    }) => {
      const locked = panel.getByTestId('locked');
      expect(await page.content()).not.toContain('early-access');
      const open = locked.getByRole('button', { name: /Early access/ });
      await open.click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Code').fill('TEA');
      await dialog.getByRole('button', { name: 'Unlock' }).click();
      await expect(dialog.getByRole('status')).toContainText('didn’t work');
      expect(await page.content()).not.toContain('early-access');
      await dialog.getByLabel('Code').fill('chai');
      await dialog.getByRole('button', { name: 'Unlock' }).click();
      await expect(
        dialog.getByRole('link', { name: 'Open the link' })
      ).toHaveAttribute('href', 'https://example.com/early-access');
      await page.keyboard.press('Escape');
      await expect(open).toBeFocused();
    });

    test('questions open to show their answer', async () => {
      const reviews = panel.getByTestId('reviews');
      await expect(
        reviews.getByRole('img', { name: '5 out of 5 stars' })
      ).toBeVisible();
      const answer = reviews.getByText(
        '100 prompts, a guide and 12 templates.'
      );
      await expect(answer).toBeHidden();
      await reviews.getByText('What do I get in the reel pack?').click();
      await expect(answer).toBeVisible();
    });

    test('text blocks show bold words, lists, a line and a quote', async () => {
      const text = panel.getByTestId('text');
      await expect(text.locator(`#${id}-works`)).toContainText('My works');
      await expect(text.locator('strong')).toHaveText('everyday things');
      await expect(text.getByRole('listitem')).toHaveCount(2);
      await expect(
        text.getByRole('link', { name: 'Watch on YouTube' })
      ).toHaveAttribute('target', '_blank');
      await expect(text.getByRole('separator')).toBeVisible();
      await expect(text.locator('blockquote')).toContainText(
        'The best minute of my day.'
      );
    });

    test('pictures are described and a linked one opens in a new tab', async () => {
      const photos = panel.getByTestId('photos');
      await expect(photos.getByRole('img')).toHaveCount(3);
      await expect(
        photos.getByRole('link', { name: 'Chai on a clay stove' })
      ).toHaveAttribute('target', '_blank');
    });

    test('moving words are read once and can be paused', async () => {
      const motion = panel.getByTestId('motion');
      const strip = motion.getByRole('region', { name: 'Shop news' });
      // Screen readers hear each phrase once; the loop's copies are hidden.
      await expect(strip.getByRole('listitem')).toHaveText([
        /New drop/,
        /Free shipping/,
        /Made in Pune/,
      ]);
      const row = strip.locator('ul');
      const state = () =>
        row.evaluate((el) => el.getAnimations()[0]?.playState);
      await strip.scrollIntoViewIfNeeded();
      await expect.poll(state).toBe('running');
      await strip
        .getByRole('button', { name: 'Stop the moving words' })
        .click();
      await expect.poll(state).toBe('paused');
      await expect(
        strip.getByRole('button', { name: 'Move the words again' })
      ).toBeVisible();
      // The ring around the picture reads its words once, and pauses too.
      await expect(
        motion.getByText('Chai • Stories • Since 2019', { exact: true })
      ).toHaveCount(1);
      const ring = motion.locator('[data-word-ring] > svg');
      await expect(ring).toHaveAttribute('aria-hidden', 'true');
      const turning = () =>
        ring.evaluate((el) => el.getAnimations()[0]?.playState);
      // Scroll the still box, not the turning svg, which is never "stable".
      await motion.locator('[data-word-ring]').scrollIntoViewIfNeeded();
      await expect.poll(turning).toBe('running');
      await motion
        .getByRole('button', { name: 'Stop the turning words' })
        .click();
      await expect.poll(turning).toBe('paused');
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
    .getByTestId('links')
    .getByRole('link', { name: 'Instagram' })
    .evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
  expect(tileRadius).toBe('4px');
  const font = await custom.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).toContain('Georgia');
});

test('nothing moves for visitors who ask for less motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const motion = page.getByTestId('panel-light').getByTestId('motion');
  const moving = await motion.evaluate(
    (el) => el.getAnimations({ subtree: true }).length
  );
  expect(moving).toBe(0);
  // Nothing to pause, so no pause buttons, and the words sit still, once.
  await expect(motion.getByRole('button')).toHaveCount(0);
  await expect(motion.locator('li:visible')).toHaveCount(3);
});

test('moving words hold still while they are off screen', async ({ page }) => {
  const row = page
    .getByTestId('panel-light')
    .getByRole('region', { name: 'Shop news' })
    .locator('ul');
  const state = () => row.evaluate((el) => el.getAnimations()[0]?.playState);
  await row.scrollIntoViewIfNeeded();
  await expect.poll(state).toBe('running');
  // Scroll the strip out of sight: above, or else below if the page is short.
  const out = await row.evaluate((el) => {
    window.scrollBy(0, el.getBoundingClientRect().bottom + 50);
    if (el.getBoundingClientRect().bottom > 0) window.scrollTo(0, 0);
    const box = el.getBoundingClientRect();
    return box.bottom <= 0 || box.top >= window.innerHeight;
  });
  expect(out, 'the strip is out of sight').toBe(true);
  await expect.poll(state).toBe('paused');
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
