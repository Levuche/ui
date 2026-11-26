import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  CreatorHeader,
  QuoteBlock,
  SectionHeading,
  SiteGrid,
  Spacer,
  TextBlock,
  type SiteGridBlock,
} from '../src';
import { onScreen, type ScreenName } from './screens';

/*
 * Blocks for the words on a page: a heading that starts a part of the page,
 * paragraphs and lists with bold, italic and links, a quote, and a gap or a
 * line between blocks. What a creator types is only ever shown as text.
 */
const meta = {
  title: 'Blocks/Text',
  component: TextBlock,
  tags: ['autodocs'],
  args: {
    text: [
      'Short stories about where **everyday things** come from, told in *under a minute* 🍵.',
      'New here? Start with [my works](#my-works) or the [YouTube channel](https://www.youtube.com/@example).',
      '',
      '- A new story every Friday',
      '- Sources for every fact',
      '- No ads, ever',
      '',
      '1. Pick a story',
      '2. Watch it',
      '3. Tell a friend',
    ].join('\n'),
  },
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The themed page inside the story's canvas. */
const pageOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-testid="story-theme"]')!;

/** Bold, italic, links, both kinds of list and emoji. */
export const Text: Story = {
  play: async ({ canvas, canvasElement }) => {
    const block = pageOf(canvasElement).querySelector(
      '[data-block="text-block"]'
    )!;
    await expect(block.querySelector('strong')).toHaveTextContent(
      'everyday things'
    );
    await expect(block.querySelector('em')).toHaveTextContent('under a minute');
    await expect(
      canvas.getByRole('link', { name: 'my works' })
    ).toHaveAttribute('href', '#my-works');
    const youtube = canvas.getByRole('link', { name: 'YouTube channel' });
    await expect(youtube).toHaveAttribute('target', '_blank');
    await expect(youtube).toHaveAttribute('rel', /noopener/);
    const [bullets, steps] = canvas.getAllByRole('list');
    await expect(bullets!.tagName).toBe('UL');
    await expect(steps!.tagName).toBe('OL');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(6);
    await expect(canvas.getByText(/🍵/)).toBeVisible();
  },
};

/** Tags and unsafe links are shown as words; nothing runs. */
export const TypedTagsStayText: Story = {
  args: {
    text: '<b>not bold</b> <img src=x onerror="window.ran=1"> [a trick](javascript:alert(1))',
  },
  play: async ({ canvas, canvasElement }) => {
    const block = pageOf(canvasElement).querySelector(
      '[data-block="text-block"]'
    )!;
    await expect(block.querySelector('b, img, script')).toBeNull();
    await expect(canvas.getByText(/<b>not bold<\/b>/)).toBeVisible();
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByText(/a trick/)).toBeVisible();
    await expect((window as unknown as { ran?: number }).ran).toBeUndefined();
  },
};

/** Large and centred, on the accent colour. */
export const LargeAndCentred: Story = {
  args: {
    size: 'lg',
    align: 'center',
    tone: 'accent',
    text: 'Made in **Pune** 🇮🇳\n- Stories\n- Packs',
  },
  play: async ({ canvasElement }) => {
    const block = pageOf(canvasElement).querySelector<HTMLElement>(
      '[data-block="text-block"]'
    )!;
    await expect(block).toHaveAttribute('data-block-size', 'lg');
    await expect(getComputedStyle(block).textAlign).toBe('center');
    // Bullets stay next to centred words.
    await expect(
      getComputedStyle(block.querySelector('ul')!).listStylePosition
    ).toBe('inside');
  },
};

/** A heading a link can jump to, with a line of detail. */
export const Heading: StoryObj<typeof SectionHeading> = {
  render: () => (
    <SectionHeading
      id="My works!"
      title="My works"
      detail="Every story, newest first"
    />
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 2, name: 'My works' });
    await expect(heading).toBeVisible();
    const block = heading.closest('[data-block="section-heading"]');
    await expect(block).toHaveAttribute('id', 'my-works');
    await expect(canvas.getByText('Every story, newest first')).toBeVisible();
  },
};

/** A quote, with who said it and a small picture (initials when there's none). */
export const Quote: StoryObj<typeof QuoteBlock> = {
  render: () => (
    <QuoteBlock
      quote={'The best minute of my day.\nEvery single Friday.'}
      name="Meera K."
      detail="Watches every story"
      avatar={null}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const figure = pageOf(canvasElement).querySelector('figure')!;
    await expect(figure).toHaveAttribute('data-block', 'quote-block');
    await expect(figure.querySelector('blockquote')).toHaveTextContent(
      'The best minute of my day.'
    );
    await expect(figure.querySelector('figcaption')).toHaveTextContent(
      'Meera K.'
    );
    await expect(canvas.getByText('MK')).toBeVisible();
  },
};

/** A gap two grid rows tall, then a thin line. */
export const GapAndLine: StoryObj<typeof Spacer> = {
  render: () => (
    <>
      <TextBlock text="Above the gap" />
      <Spacer rows={2} />
      <TextBlock text="Above the line" />
      <Spacer line />
      <TextBlock text="Below the line" />
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const [gap, line] = pageOf(canvasElement).querySelectorAll<HTMLElement>(
      '[data-block="spacer"]'
    );
    // 2 rows of 48 px and the 16 px between them.
    await expect(Math.round(gap!.getBoundingClientRect().height)).toBe(112);
    await expect(gap).toHaveAttribute('aria-hidden', 'true');
    await expect(Math.round(line!.getBoundingClientRect().height)).toBe(48);
    await expect(canvas.getByRole('separator')).toBeVisible();
  },
};

const GRID_BLOCKS: SiteGridBlock[] = [
  {
    id: 'profile',
    kind: 'profile',
    children: (
      <CreatorHeader name="Desi Origins" tagline="How everyday things began" />
    ),
  },
  {
    id: 'works',
    kind: 'text',
    children: (
      <SectionHeading
        id="works"
        title="My works"
        detail="Every story, newest first"
      />
    ),
  },
  {
    id: 'about',
    kind: 'text',
    children: (
      <TextBlock text="Short stories about where **everyday things** come from. [Say hello](#connect) 👋" />
    ),
  },
  {
    id: 'quote',
    kind: 'band',
    children: (
      <QuoteBlock
        quote="The best minute of my day."
        name="Meera K."
        avatar={null}
      />
    ),
  },
  { id: 'line', kind: 'text', children: <Spacer line /> },
  {
    id: 'connect',
    kind: 'text',
    children: <SectionHeading id="connect" title="Let’s connect" />,
  },
  {
    id: 'reach',
    kind: 'text',
    children: (
      <TextBlock text={'- Email: hello@example.com\n- Replies within a day'} />
    ),
  },
];

/*
 * The text blocks on a grid page. Headings take the whole width of their
 * column, the same as the text under them, and the link jumps to one.
 */
const gridStory = (
  screen: ScreenName,
  theme: 'light' | 'dark'
): StoryObj<typeof SiteGrid> => ({
  parameters: { frame: 'wide' },
  globals: { theme, ...onScreen(screen) },
  render: () => <SiteGrid as="main" blocks={GRID_BLOCKS} />,
  play: async ({ canvas, canvasElement }) => {
    const page = document.documentElement;
    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
    const box = (id: string) =>
      canvasElement
        .querySelector(`[data-grid-block="${id}"]`)!
        .getBoundingClientRect();
    const works = box('works');
    const about = box('about');
    await expect(Math.round(works.width)).toBe(Math.round(about.width));
    await expect(works.bottom).toBeLessThanOrEqual(about.top);
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Let’s connect' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Say hello' })
    ).toHaveAttribute('href', '#connect');
    await expect(canvasElement.querySelector('#connect')).not.toBeNull();
  },
});

export const GridOnPhone = gridStory('phone', 'light');
export const GridOnTablet = gridStory('tablet', 'dark');
export const GridOnDesktop = gridStory('desktop', 'light');
export const GridOnDesktopDark = gridStory('desktop', 'dark');
