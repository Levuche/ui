import type { SiteTheme } from '../src';

export type ThemeName = 'light' | 'dark' | 'custom';

/** The themes every story can be shown in (the toolbar's Theme menu). */
export const THEMES: Record<ThemeName, { title: string; theme: SiteTheme }> = {
  light: { title: 'Sample creator, light', theme: { scheme: 'light' } },
  dark: { title: 'Sample creator, dark', theme: { scheme: 'dark' } },
  custom: {
    title: 'A creator’s own theme',
    theme: {
      scheme: 'light',
      colors: {
        surface: '#ecfdf5',
        surface2: '#d1fae5',
        border: '#a7f3d0',
        link: '#0f766e',
        accent: '#0f766e',
        onAccent: '#ffffff',
        band: '#134e4a',
        onBand: '#ffffff',
      },
      corners: 'square',
      buttonShape: 'rounded',
      font: 'Georgia, serif',
    },
  },
};
