import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AppIcon, CameraIcon, EmailIcon, GlobeIcon, VideoIcon } from '../src';
import { SAMPLE_WORDS, SamplePage, type SampleWords } from './sample-page';
import { expectPageFits, onScreen } from './screens';

/*
 * The sample page written in a right-to-left script, and with words far
 * longer than anyone plans for. Each story checks that the page still fits
 * its screen with nothing spilling over the column's edges.
 */
const meta = {
  title: 'Pages/Right to left and long text',
  component: SamplePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SamplePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The creator's own words in Arabic; the blocks' own labels stay as given. */
const ARABIC: SampleWords = {
  name: 'أصول ديسي',
  tagline: 'كيف بدأت الأشياء اليومية',
  button: 'تسوّق إعداداتي',
  featured: 'جديد: كيف وصل الشاي إلى الهند',
  featuredDetail: '١٢ دقيقة، متاح الآن',
  pack: 'حزمة مقاطع الأصول',
  packDetail: '١٠٠ فكرة ودليل و١٢ قالبًا',
  price: '$12',
  links: [
    {
      label: 'قناة يوتيوب',
      href: 'https://www.youtube.com/@example',
      icon: <VideoIcon size={20} />,
      detail: 'فيديو جديد كل جمعة',
    },
    {
      label: 'إنستغرام',
      href: 'https://www.instagram.com/example',
      icon: <CameraIcon size={20} />,
    },
    {
      label: 'حمّل التطبيق',
      href: 'https://example.com/app',
      icon: <AppIcon size={20} />,
    },
    {
      label: 'راسلني',
      href: 'mailto:hello@example.com',
      icon: <EmailIcon size={20} />,
    },
  ],
};

/** Names, titles and prices far longer than usual, and words that never break. */
const LONG: SampleWords = {
  name: 'Dr. Anastasiya Konstantinovna Vasilievska-Rahmanipour',
  tagline:
    'Supercalifragilisticexpialidociousness and other very long words, every Friday',
  button:
    'Shop every single preset, template and colour grade I have ever made, in one place',
  featured:
    'New: the whole three-hour story of how tea travelled from the hills of Assam to every kitchen in India',
  featuredDetail:
    'https://example.com/a/really/long/address/that/never/breaks/anywhere/at/all',
  pack: 'The complete Origins reel pack with every prompt, guide and template',
  packDetail:
    'Pneumonoultramicroscopicsilicovolcanoconiosis-sized bundle of 1,000 prompts',
  price: '₹1,24,999.00',
  links: [
    {
      label:
        'My YouTube channel, where a new origin story goes up every single Friday',
      href: 'https://www.youtube.com/@example',
      icon: <VideoIcon size={20} />,
      detail:
        'https://www.youtube.com/@a-channel-name-that-goes-on-and-on-and-on',
    },
    {
      label: 'Instagramreelsandstoriesandhighlightsallinoneplace',
      href: 'https://www.instagram.com/example',
      icon: <CameraIcon size={20} />,
    },
    {
      label: SAMPLE_WORDS.links[3].label,
      href: 'https://example.com/blog',
      icon: <GlobeIcon size={20} />,
    },
  ],
};

const rtl = { direction: 'rtl' } as const;

/** A link's icon sits on the side the text starts from. */
async function expectIconAtStart(nav: HTMLElement, label: string) {
  const link = within(nav).getByRole('link', { name: new RegExp(label) });
  const icon = link.querySelector('svg');
  const text = within(link).getByText(label);
  if (!icon) throw new Error(`No icon on ${label}`);
  await expect(icon.getBoundingClientRect().left).toBeGreaterThan(
    text.getBoundingClientRect().right - 1
  );
}

export const RightToLeftOnPhone: Story = {
  args: { words: ARABIC },
  globals: { theme: 'light', ...rtl, ...onScreen('phone') },
  play: async ({ canvas }) => {
    const main = canvas.getByRole('main');
    await expect(getComputedStyle(main).direction).toBe('rtl');
    await expectPageFits(main, 'phone', 420);
    const nav = canvas.getByRole('navigation', { name: 'أصول ديسي links' });
    await expectIconAtStart(nav, 'قناة يوتيوب');
  },
};

export const RightToLeftOnTablet: Story = {
  args: { words: ARABIC },
  globals: { theme: 'dark', ...rtl, ...onScreen('tablet') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'tablet', 576);
  },
};

export const RightToLeftOnDesktop: Story = {
  args: { words: ARABIC },
  globals: { theme: 'custom', ...rtl, ...onScreen('desktop') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'desktop', 576);
  },
};

export const LongTextOnPhone: Story = {
  args: { words: LONG },
  globals: { theme: 'light', ...onScreen('phone') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'phone', 420);
  },
};

export const LongTextOnTablet: Story = {
  args: { words: LONG },
  globals: { theme: 'custom', ...onScreen('tablet') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'tablet', 576);
  },
};

export const LongTextOnDesktop: Story = {
  args: { words: LONG },
  globals: { theme: 'dark', ...onScreen('desktop') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'desktop', 576);
  },
};

/** Long words in a right-to-left page, on the narrowest screen. */
export const LongTextRightToLeftOnPhone: Story = {
  args: { words: LONG },
  globals: { theme: 'light', ...rtl, ...onScreen('phone') },
  play: async ({ canvas }) => {
    await expectPageFits(canvas.getByRole('main'), 'phone', 420);
  },
};
