import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect } from 'storybook/test';
import {
  BLOCK_TONES,
  BookingCard,
  Block,
  LinkTile,
  SiteText,
  SiteHeading,
  withBlockLook,
} from '../src';

/*
 * The look every block shares: tone, size, corners, alignment, shadow,
 * motion, its own colours and font, and screens to hide it on. One creator
 * setting restyles any block the same way, because each block spreads
 * lookProps() on its outermost element and CSS does the rest.
 */
const meta = {
  title: 'System/Look',
  component: BookingCard,
  tags: ['autodocs'],
  args: {
    title: 'Origin story review',
    detail: 'I watch your draft and send notes.',
    duration: '30 min',
    price: '$40',
    href: 'https://example.com/book',
    tone: 'surface',
    size: 'md',
    radius: 'theme',
    shadow: 'none',
    motion: 'none',
  },
  argTypes: {
    tone: { control: 'select', options: [...BLOCK_TONES] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    radius: {
      control: 'select',
      options: ['theme', 'none', 'sm', 'md', 'lg', 'full'],
    },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    shadow: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    motion: {
      control: 'inline-radio',
      options: ['none', 'fade', 'rise', 'scale'],
    },
  },
} satisfies Meta<typeof BookingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change any control: the same block, restyled by its look props. */
export const Playground: Story = {
  play: async ({ canvas }) => {
    const card = canvas.getByRole('article');
    await expect(card).toHaveAttribute('data-block', 'booking-card');
    await expect(card).toHaveAttribute('data-tone', 'surface');
  },
};

/** Every tone keeps text and buttons readable without changing the block. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {BLOCK_TONES.map((tone) => (
        <BookingCard key={tone} {...args} title={`Tone: ${tone}`} tone={tone} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const accent = canvas
      .getAllByRole('article')
      .find((el) => el.dataset.tone === 'accent')!;
    const button = accent.querySelector('a')!;
    // Inside an accent block the button turns inside out.
    await expect(getComputedStyle(button).backgroundColor).toBe(
      getComputedStyle(accent).color
    );
  },
};

/** Small, medium and large change the padding, gaps and type together. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <BookingCard key={size} {...args} title={`Size: ${size}`} size={size} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const [sm, , lg] = canvas.getAllByRole('article');
    const pad = (el: HTMLElement) =>
      parseFloat(getComputedStyle(el).paddingTop);
    await expect(pad(lg!)).toBeGreaterThan(pad(sm!));
  },
};

/** A block's own colours and font, over the page theme. */
export const OwnColours: Story = {
  args: {
    colors: {
      surface: '#1e1b4b',
      surface2: '#312e81',
      text: '#ffffff',
      text2: '#e0e7ff',
      link: '#fde68a',
      border: '#4338ca',
      accent: '#facc15',
      onAccent: '#1e1b4b',
    },
    font: 'Georgia, serif',
    radius: 'lg',
  },
  play: async ({ canvas }) => {
    const card = canvas.getByRole('article');
    await expect(getComputedStyle(card).backgroundColor).toBe(
      'rgb(30, 27, 75)'
    );
    await expect(getComputedStyle(card).fontFamily).toContain('Georgia');
    await expect(getComputedStyle(card).borderTopLeftRadius).toBe('28px');
  },
};

/** An unsafe address shows the words without a link. */
export const SafeLinks: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <LinkTile href="https://example.com">A safe link</LinkTile>
      <LinkTile href={'java\tscript:alert(1)'}>An unsafe link</LinkTile>
      <LinkTile href="/shop" newTab>
        Same site, opened in a new tab
      </LinkTile>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
    await expect(canvas.getByText('An unsafe link').closest('a')).toBeNull();
    await expect(
      canvas.getByRole('link', { name: /Same site/ })
    ).toHaveAttribute('target', '_blank');
  },
};

function Quote({
  text,
  className,
  style,
  ...rest
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <blockquote className={className} style={style} {...rest}>
      {text}
    </blockquote>
  );
}
const LookingQuote = withBlockLook(Quote, 'app-quote', { tone: 'muted' });

/**
 * An app's own component gets the same look with withBlockLook, and any
 * layout with <Block>.
 */
export const OwnComponents: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <LookingQuote text="Tea, and the stories it carried." size="lg" />
      <Block name="app-note" tone="outline" radius="sm">
        <SiteHeading as="h3" size="block">
          A note
        </SiteHeading>
        <SiteText muted>
          Built with Block, so it takes every look prop.
        </SiteText>
      </Block>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const quote = canvasElement.querySelector('[data-block="app-quote"]');
    await expect(quote).toHaveAttribute('data-tone', 'muted');
    await expect(quote).toHaveAttribute('data-block-size', 'lg');
  },
};
