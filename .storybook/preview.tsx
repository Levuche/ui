import type { Preview } from '@storybook/react-vite';
import { CreatorTheme } from '../src';
import { THEMES, type ThemeName } from '../stories/themes';
import './preview.css';

const preview: Preview = {
  // Pick the creator theme from the toolbar; a story can fix one with
  // `globals: { theme: 'dark' }`.
  initialGlobals: { theme: 'light' },
  globalTypes: {
    theme: {
      description: 'Creator theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Sample creator, light' },
          { value: 'dark', title: 'Sample creator, dark' },
          { value: 'custom', title: 'A creator’s own theme' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const name = (context.globals.theme ?? 'light') as ThemeName;
      return (
        <CreatorTheme
          theme={THEMES[name].theme}
          className="min-h-screen p-5"
          data-testid="story-theme"
        >
          <div className="max-w-page mx-auto flex flex-col gap-4">
            <Story />
          </div>
        </CreatorTheme>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: {
      // Fail the story's test on any accessibility violation (WCAG 2.2 AA).
      test: 'error',
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      },
    },
  },
};

export default preview;
