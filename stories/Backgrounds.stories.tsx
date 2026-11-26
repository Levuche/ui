import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect } from 'storybook/test';
import {
  BACKGROUND_PATTERNS,
  BLOCK_TONES,
  Block,
  BookingCard,
  SiteHeading,
  SiteText,
  fixBackground,
  withBlockLook,
  type BlockBackground,
  type BlockLook,
} from '../src';

/*
 * A block's own background, behind its words: a gradient through the theme's
 * colours, a faint pattern, or a picture under a dim layer. Part of the look
 * every block shares, so any block takes `background` with no code of its
 * own, and it follows the theme and dark mode. Pick the theme from the
 * toolbar to see each in a creator's own colours.
 */
const meta = {
  title: 'System/Backgrounds',
  component: BookingCard,
  tags: ['autodocs'],
  args: {
    title: 'Origin story review',
    detail: 'I watch your draft and send notes.',
    duration: '30 min',
    price: '$40',
    href: 'https://example.com/book',
  },
} satisfies Meta<typeof BookingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A busy picture, half dark and half light, the hardest kind to read on. */
const PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="160" height="180" fill="#000"/><rect x="160" width="160" height="180" fill="#fff"/><circle cx="160" cy="90" r="60" fill="#c2410c"/></svg>'
)}`;

const style = (element: Element) => getComputedStyle(element);
const blocks = (canvasElement: HTMLElement, selector = '[data-block]') => [
  ...canvasElement.querySelectorAll<HTMLElement>(selector),
];

/** The page's own colour for a token, as the browser writes colours. */
function tokenColor(canvasElement: HTMLElement, token: string) {
  const page = canvasElement.querySelector<HTMLElement>(
    '[data-testid="story-theme"]'
  )!;
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  page.append(probe);
  const color = style(probe).color;
  probe.remove();
  return color;
}

const gradients: { label: string; look: BlockLook }[] = [
  {
    label: 'Card to panel, on a card',
    look: { background: { type: 'gradient', stops: ['surface', 'surface2'] } },
  },
  {
    label: 'Page to card, straight down',
    look: {
      tone: 'muted',
      background: { type: 'gradient', stops: ['bg', 'surface'], angle: 180 },
    },
  },
  {
    label: 'Accent to band, on the accent',
    look: {
      tone: 'accent',
      background: {
        type: 'gradient',
        stops: ['accent', 'band', 'accent'],
        angle: 90,
      },
    },
  },
];

const Gradients: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {gradients.map(({ label, look }) => (
        <BookingCard key={label} {...args} title={label} {...look} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = blocks(canvasElement, '[data-background="gradient"]');
    await expect(cards).toHaveLength(3);
    for (const card of cards) {
      await expect(style(card).backgroundImage).toMatch(/^linear-gradient/);
    }
    // The gradient is drawn in the page theme's own colours.
    await expect(style(cards[2]!).backgroundImage).toContain(
      tokenColor(canvasElement, '--site-accent')
    );
    await expect(style(cards[0]!).backgroundImage).toContain(
      tokenColor(canvasElement, '--site-surface-2')
    );
  },
};

/** Two or three of the theme's colours, by name, at any angle. */
export const GradientLight: Story = { ...Gradients };
export const GradientDark: Story = {
  ...Gradients,
  globals: { theme: 'dark' },
};
export const GradientInACreatorsOwnTheme: Story = {
  ...Gradients,
  globals: { theme: 'custom' },
};

/**
 * A gradient that drifts slowly. It stands still for visitors who ask their
 * device for less motion.
 */
export const MovingGradient: Story = {
  args: {
    tone: 'accent',
    background: { type: 'gradient', stops: ['accent', 'band'], move: true },
  },
  play: async ({ canvasElement }) => {
    const [card] = blocks(canvasElement, '[data-background-move]');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(style(card!).animationName).toBe(
      still ? 'none' : 'levuche-drift'
    );
  },
};

const Patterns: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {BACKGROUND_PATTERNS.map((pattern, index) => (
        <BookingCard
          key={pattern}
          {...args}
          title={`Pattern: ${pattern}`}
          tone={index % 2 ? 'muted' : 'surface'}
          background={{
            type: 'pattern',
            pattern,
            color: index === 4 ? 'text' : 'accent',
          }}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = blocks(canvasElement, '[data-background="pattern"]');
    await expect(cards.map((card) => card.dataset.pattern)).toEqual([
      ...BACKGROUND_PATTERNS,
    ]);
    for (const card of cards) {
      await expect(style(card).backgroundImage).toMatch(/gradient/);
      // The lines sit over the tone's fill, which stays.
      await expect(style(card).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  },
};

/** Fine lines, rings, dots, a grid and waves, faint, in a theme colour. */
export const PatternLight: Story = { ...Patterns };
export const PatternDark: Story = { ...Patterns, globals: { theme: 'dark' } };
export const PatternInACreatorsOwnTheme: Story = {
  ...Patterns,
  globals: { theme: 'custom' },
};

const pictureLooks: { label: string; look: BlockLook }[] = [
  {
    label: 'A picture behind the words',
    look: { background: { type: 'image', src: PICTURE } },
  },
  {
    label: 'Lighter layer, the top kept in view',
    look: {
      tone: 'plain',
      background: { type: 'image', src: PICTURE, dim: 85, position: 'top' },
    },
  },
  {
    label: 'On the accent, made readable',
    look: {
      tone: 'accent',
      background: fixBackground({
        tone: 'accent',
        background: { type: 'image', src: PICTURE },
      }),
    },
  },
];

const Pictures: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {pictureLooks.map(({ label, look }) => (
        <BookingCard key={label} {...args} title={label} {...look} />
      ))}
      <BookingCard
        {...args}
        title="An unsafe address shows no picture"
        background={{ type: 'image', src: 'javascript:alert(1)' }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = blocks(canvasElement, '[data-block]');
    const pictures = cards.filter(
      (card) => card.dataset.background === 'image'
    );
    await expect(pictures).toHaveLength(3);
    for (const card of pictures) {
      const image = style(card).backgroundImage;
      // A dim layer of the block's own fill, over the picture.
      await expect(image).toMatch(/^linear-gradient\(.*\), url\("data:image/);
      await expect(style(card).backgroundSize).toBe('cover');
    }
    await expect(style(pictures[1]!).backgroundPosition).toBe('50% 0%');
    // A plain block gets its padding back over a picture.
    await expect(parseFloat(style(pictures[1]!).paddingTop)).toBeGreaterThan(0);
    // The accent block's layer was raised until its words can be read.
    await expect(
      Number(pictures[2]!.style.getPropertyValue('--block-dim').slice(0, -1))
    ).toBeGreaterThan(80);
    const unsafe = cards.at(-1)!;
    await expect(unsafe).not.toHaveAttribute('data-background');
    await expect(style(unsafe).backgroundImage).toBe('none');
  },
};

/** A picture under a layer of the block's fill, so its words stay readable. */
export const PictureLight: Story = { ...Pictures };
export const PictureDark: Story = { ...Pictures, globals: { theme: 'dark' } };

/** The inset tone: pressed into the page beside a raised card. */
export const InsetTone: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <BookingCard {...args} title="Pressed in" tone="inset" />
      <BookingCard {...args} title="Raised" shadow="md" />
      <BookingCard
        {...args}
        title="Pressed in, with its own shadow"
        tone="inset"
        shadow="sm"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [inset, , own] = blocks(canvasElement);
    await expect(inset).toHaveAttribute('data-tone', 'inset');
    await expect(style(inset!).boxShadow).toMatch(/inset/);
    // A block's own shadow replaces the pressed-in one.
    await expect(style(own!).boxShadow).not.toMatch(/inset/);
    // A shade off the page, not the card colour.
    await expect(style(inset!).backgroundColor).not.toBe(
      tokenColor(canvasElement, '--site-surface')
    );
  },
};

export const InsetToneDark: Story = {
  ...InsetTone,
  globals: { theme: 'dark' },
};

/** Every tone takes a background, and keeps its own text colours on it. */
export const EveryTone: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {BLOCK_TONES.map((tone) => (
        <BookingCard
          key={tone}
          {...args}
          title={`Tone: ${tone}`}
          tone={tone}
          radius={tone === 'inset' ? 'lg' : 'theme'}
          background={{ type: 'pattern', pattern: 'dots' }}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = blocks(canvasElement);
    await expect(cards).toHaveLength(BLOCK_TONES.length);
    for (const card of cards) {
      await expect(card).toHaveAttribute('data-pattern', 'dots');
    }
    const accent = cards.find((card) => card.dataset.tone === 'accent')!;
    await expect(style(accent).color).toBe(
      tokenColor(canvasElement, '--site-on-accent')
    );
  },
};

/** Card styles still apply: raised cards keep their shadow over a pattern. */
export const WithRaisedCards: Story = {
  ...Patterns,
  globals: { cards: 'raised' },
  play: async ({ canvasElement }) => {
    const [card] = blocks(canvasElement, '[data-background="pattern"]');
    await expect(style(card!).boxShadow).not.toBe('none');
  },
};

function Quote({
  text,
  className,
  style: own,
  ...rest
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <blockquote className={className} style={own} {...rest}>
      {text}
    </blockquote>
  );
}
const LookingQuote = withBlockLook(Quote, 'app-quote', {
  tone: 'inset',
  background: { type: 'pattern', pattern: 'waves' },
});

const appBackground: BlockBackground = {
  type: 'gradient',
  stops: ['surface', 'bg'],
  angle: 160,
};

/** An app's own blocks get backgrounds too, by withBlockLook or <Block>. */
export const OwnComponents: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <LookingQuote text="Tea, and the stories it carried." size="lg" />
      <Block name="app-note" background={appBackground}>
        <SiteHeading as="h3" size="block">
          A note
        </SiteHeading>
        <SiteText muted>Built with Block, over a gradient.</SiteText>
      </Block>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const quote = canvasElement.querySelector('[data-block="app-quote"]')!;
    await expect(quote).toHaveAttribute('data-tone', 'inset');
    await expect(quote).toHaveAttribute('data-pattern', 'waves');
    const note = canvasElement.querySelector('[data-block="app-note"]')!;
    await expect(style(note).backgroundImage).toMatch(/^linear-gradient/);
  },
};
