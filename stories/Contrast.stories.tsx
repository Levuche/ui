import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  CreatorTheme,
  SCHEME_COLORS,
  LinkList,
  SiteHeading,
  SiteLinkButton,
  SiteText,
  contrastIssues,
  fixContrast,
  type SiteTheme,
} from '../src';

/*
 * What the theme editor shows when a creator picks colours too faint to read:
 * each pair that fails, with the colour to try instead, and the page with
 * every suggestion applied. The faint pairs are drawn as plain swatches, with
 * no text on them, so this page itself stays readable.
 */

function ThemeCheck({ theme }: { theme: SiteTheme }) {
  const issues = contrastIssues(theme);
  const fixed = fixContrast(theme);
  // The colours the page would really use: the scheme's, with the creator's on top.
  const colors: Record<string, string> = {
    ...SCHEME_COLORS[theme.scheme ?? 'light'],
    ...theme.colors,
  };
  return (
    <div className="flex flex-col gap-4">
      <SiteHeading as="h2" size="sm">
        {issues.length
          ? `${issues.length} colour pairs are too faint to read`
          : 'Every colour pair can be read'}
      </SiteHeading>
      <ul aria-label="Faint pairs" className="flex flex-col gap-3">
        {issues.map((issue) => (
          <li
            key={`${issue.foreground}/${issue.background}`}
            className="flex items-center gap-3"
          >
            <span
              aria-hidden="true"
              className="border-site-border flex size-10 shrink-0 items-center justify-center rounded-md border"
              style={{ background: colors[issue.background] }}
            >
              <span
                className="size-4 rounded-full"
                style={{ background: colors[issue.foreground] }}
              />
            </span>
            <SiteText className="text-sm">
              {issue.label}: {issue.ratio}:1, needs {issue.needed}:1. Try{' '}
              <code>{issue.suggestion}</code> for {issue.change}.
            </SiteText>
          </li>
        ))}
      </ul>
      <SiteHeading as="h3" size="sm">
        With the suggestions
      </SiteHeading>
      <CreatorTheme
        theme={fixed}
        data-testid="fixed"
        className="rounded-site flex flex-col gap-3 p-4"
      >
        <SiteText>One origin story every Friday.</SiteText>
        <SiteLinkButton href="#presets" fullWidth>
          Shop my presets
        </SiteLinkButton>
        <LinkList
          label="Links"
          links={[{ label: 'Read the guide', href: '#guide' }]}
        />
      </CreatorTheme>
    </div>
  );
}

const meta = {
  title: 'System/Contrast',
  component: ThemeCheck,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A pale yellow accent with white text, and light grey soft text. */
export const FaintTheme: Story = {
  args: {
    theme: {
      scheme: 'light',
      colors: { accent: '#fbbf24', onAccent: '#ffffff', text2: '#a1a1aa' },
    },
  },
  play: async ({ canvas, args }) => {
    const list = canvas.getByRole('list', { name: 'Faint pairs' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(
      contrastIssues(args.theme).length
    );
    await expect(
      canvas.getByText(/Button text on the accent colour/)
    ).toBeVisible();
    await expect(contrastIssues(fixContrast(args.theme))).toEqual([]);
  },
};

/** A creator's own colours that already pass: nothing to warn about. */
export const ReadableTheme: Story = {
  args: {
    theme: {
      scheme: 'dark',
      colors: { accent: '#0f766e', onAccent: '#ffffff', link: '#5eead4' },
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Every colour pair can be read' })
    ).toBeVisible();
  },
};
