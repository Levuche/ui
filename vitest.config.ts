import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Runs every story as a test in Chromium: it renders, its play function
// (the interaction test) passes, and axe finds no accessibility violation.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    storybookTest({
      configDir: '.storybook',
      storybookScript: 'npm run storybook -- --ci',
    }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
});
