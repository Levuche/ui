import type { Preview } from '@storybook/react-vite';
import { CreatorTheme, type SiteCardStyle } from '../src';
import { SCREENS } from '../stories/screens';
import { THEMES, type ThemeName } from '../stories/themes';
import './preview.css';

const preview: Preview = {
  // Pick the creator theme from the toolbar; a story can fix one with
  // `globals: { theme: 'dark' }`. Direction does the same for right-to-left
  // scripts, such as Arabic, Hebrew and Urdu.
  initialGlobals: { theme: 'light', cards: 'flat', direction: 'ltr' },
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
    cards: {
      description: 'Card style',
      toolbar: {
        title: 'Cards',
        icon: 'component',
        items: [
          { value: 'flat', title: 'Flat cards' },
          { value: 'outline', title: 'Outlined cards' },
          { value: 'raised', title: 'Raised cards' },
          { value: 'glass', title: 'Glass cards' },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Which way the text runs',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'Left to right' },
          { value: 'rtl', title: 'Right to left' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const name = (context.globals.theme ?? 'light') as ThemeName;
      // Grid pages are wider than one column; they set `frame: 'wide'`.
      const wide = context.parameters.frame === 'wide';
      const dir = context.globals.direction === 'rtl' ? 'rtl' : 'ltr';
      return (
        <CreatorTheme
          dir={dir}
          theme={{
            ...THEMES[name].theme,
            cards: (context.globals.cards ?? 'flat') as SiteCardStyle,
          }}
          className="min-h-screen p-5"
          data-testid="story-theme"
        >
          <div
            className={
              wide
                ? 'mx-auto flex flex-col gap-4'
                : 'max-w-site mx-auto flex flex-col gap-4'
            }
          >
            <Story />
          </div>
        </CreatorTheme>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    viewport: { options: SCREENS },
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
