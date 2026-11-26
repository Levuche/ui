import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import {
  Countdown,
  CreditPack,
  DiscountCode,
  NewsletterBand,
  PackRow,
  type PageLanguage,
} from '../src';
import { LANGUAGES } from './languages';

/*
 * The page's language (SiteTheme.language with <CreatorTheme words>): every
 * block's own words, and its numbers, follow it with no `labels` on any
 * block. Pick a language for any story from the toolbar's Language menu.
 */
const NOW = Date.UTC(2026, 11, 1, 9, 0, 0);
const TO = new Date(NOW + 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000);

function LanguageSample({
  countdownLabels,
}: {
  /** The countdown's own words, which win over the page's. */
  countdownLabels?: { days?: string };
}) {
  return (
    <>
      <Countdown to={TO} now={NOW} labels={countdownLabels} />
      <DiscountCode code="ORIGINS10" copy={fn(() => Promise.resolve())} />
      <NewsletterBand title="Origins, every Friday" />
      <CreditPack credits={12000} price="₹499" />
      <PackRow title="Reel pack" price="$32" was="$40" />
    </>
  );
}

const meta = {
  title: 'Pages/Page language',
  component: LanguageSample,
} satisfies Meta<typeof LanguageSample>;

export default meta;
type Story = StoryObj<typeof meta>;

// Spaces as the eye sees them: French puts a no-break space before "!",
// and some languages group thousands with one.
const plain = (text: string) => text.replace(/\s+/g, ' ');

const languageStory = (language: PageLanguage): Story => ({
  name: LANGUAGES[language].title,
  globals: { language },
  play: async ({ canvas, canvasElement }) => {
    const words = LANGUAGES[language].words;
    const page = canvasElement.querySelector<HTMLElement>(
      '[data-testid="story-theme"]'
    )!;
    // Screen readers read the page in its language.
    if (language === 'en') {
      await expect(page).not.toHaveAttribute('lang');
    } else {
      await expect(page).toHaveAttribute('lang', language);
    }
    const { days, hours, minutes, seconds } = words.countdown;
    await expect(canvas.getByRole('timer')).toHaveTextContent(
      `02${days}03${hours}04${minutes}05${seconds}`
    );
    // Words a block sets for itself follow the page too.
    await expect(
      canvas.getByRole('button', { name: words.props.copyCode })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: words.emailForm.button })
    ).toBeVisible();
    // Numbers are written the page's way.
    const credits = new Intl.NumberFormat(language).format(12000);
    await expect(
      canvas.getByRole('heading', {
        // Accessible names keep the space a number is grouped with, so
        // compare them as the eye sees them.
        name: (name) =>
          plain(name) ===
          plain(words.creditPack.credits.replace('{n}', credits)),
      })
    ).toBeVisible();
    await expect(
      canvas.getByText(plain(words.props.save.replace('{amount}', '$8')))
    ).toBeVisible();
  },
});

export const English = languageStory('en');
export const Hindi = languageStory('hi');
export const Spanish = languageStory('es');
export const German = languageStory('de');
export const French = languageStory('fr');
export const Portuguese = languageStory('pt');

/** A block's own `labels` win over the page's words, word by word. */
export const OwnLabelsWin: Story = {
  name: 'A block’s own words win',
  globals: { language: 'es' },
  args: { countdownLabels: { days: 'jornadas' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('timer')).toHaveTextContent(
      '02jornadas03horas04minutos05segundos'
    );
  },
};
