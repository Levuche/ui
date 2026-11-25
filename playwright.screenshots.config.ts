import { defineConfig, devices } from '@playwright/test';

/**
 * Screenshot checks: every story, compared with the reference pictures in
 * screenshots/__screenshots__. `npm run build-storybook` first; Playwright then
 * serves storybook-static. The references are made on CI's Linux runner, so
 * this runs there (the Screenshot checks job). To make new ones, run the CI
 * workflow by hand on your branch with "Update the reference screenshots"
 * ticked; see the README.
 */
const port = 6007;

export default defineConfig({
  testDir: './screenshots',
  // One file per picture, named after the story, screen and theme. No
  // platform suffix: only CI's Linux runner makes or checks them.
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`,
    timezoneId: 'UTC',
    locale: 'en-US',
    // A picture is of a resting page: with less motion asked for, a carousel
    // jumps to its slide instead of scrolling there over several frames.
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory storybook-static`,
    url: `http://localhost:${port}/index.json`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
