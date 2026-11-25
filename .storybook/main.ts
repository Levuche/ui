import type { StorybookConfig } from '@storybook/react-vite';

// Storybook for the page blocks: one story per block and state, in each
// creator theme. `npm run storybook` to browse; `npm run test:stories` runs
// every story's interaction test and accessibility check in Chromium.
const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      // The repo's vite.config.ts builds the gallery; Storybook has its own.
      builder: { viteConfigPath: '.storybook/vite.config.ts' },
    },
  },
  core: { disableTelemetry: true },
};

export default config;
