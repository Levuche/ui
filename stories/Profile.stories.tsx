import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Avatar, CreatorHeader, CreatorTheme } from '../src';
import { expectTapSize } from './expect-tap-size';

const meta = {
  title: 'Blocks/Profile',
  component: CreatorHeader,
  tags: ['autodocs'],
  args: { name: 'Desi Origins', tagline: 'How everyday things began' },
  argTypes: {
    align: { control: 'inline-radio', options: ['center', 'start'] },
  },
} satisfies Meta<typeof CreatorHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Where an element's middle is across the page, in px. */
function middle(element: Element) {
  const box = element.getBoundingClientRect();
  return box.left + box.width / 2;
}

/** With no photo, the round avatar shows the creator's initials. */
export const Header: Story = {
  play: async ({ canvas }) => {
    const name = canvas.getByRole('heading', {
      level: 1,
      name: 'Desi Origins',
    });
    await expect(name).toBeVisible();
    await expect(canvas.getByText('DO')).toBeVisible();
    // Centred by default: the picture, name and tagline share one middle.
    const header = canvas.getByRole('banner');
    for (const part of [
      canvas.getByText('DO'),
      name,
      canvas.getByText('How everyday things began'),
    ]) {
      await expect(Math.abs(middle(part) - middle(header))).toBeLessThan(1);
    }
  },
};

/** Lined up on the start side, as in a row of blocks. */
export const AlignedStart: Story = {
  args: { align: 'start' },
  play: async ({ canvas }) => {
    const header = canvas.getByRole('banner').getBoundingClientRect();
    const picture = canvas.getByText('DO').getBoundingClientRect();
    await expect(Math.abs(picture.left - header.left)).toBeLessThan(1);
  },
};

export const AvatarSizes: StoryObj<typeof Avatar> = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar name="Desi Origins" size={40} />
      <Avatar name="Desi Origins" size={56} />
      <Avatar name="Desi Origins" size={76} />
    </div>
  ),
};

/** A bigger name with a verified tick, a ringed photo and a highlight. */
export const Polished: Story = {
  args: {
    nameSize: 'xl',
    verified: true,
    avatarRing: true,
    tagline: 'How everyday things began',
    highlight: 'everyday things',
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('img', { name: 'Verified' })).toBeVisible();
    const words = canvas.getByText('everyday things');
    await expect(words.tagName).toBe('EM');
    // The ring leaves a see-through gap: an outline, not a filled offset.
    const avatar = canvasElement.querySelector(
      '[aria-hidden="true"].rounded-full'
    )!;
    await expect(getComputedStyle(avatar).outlineStyle).toBe('solid');
    await expect(getComputedStyle(avatar).outlineOffset).toBe('2px');
  },
};

/** The highlight in the theme's display font. */
export const HighlightInADisplayFont: Story = {
  args: {
    nameSize: 'lg',
    tagline: 'Short stories about where everyday things come from',
    highlight: 'everyday things',
  },
  render: (args) => (
    <CreatorTheme theme={{ displayFont: 'Georgia, serif' }}>
      <CreatorHeader {...args} />
    </CreatorTheme>
  ),
  play: async ({ canvas }) => {
    const words = canvas.getByText('everyday things');
    await expect(getComputedStyle(words).fontFamily).toContain('Georgia');
  },
};

/** A colour as the browser resolves it inside `element`, as rgb(). */
function resolved(element: Element, color: string) {
  const probe = document.createElement('span');
  probe.style.color = color;
  element.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/**
 * The name set apart: in the accent colour, in capitals and black weight.
 * Screen readers still hear it as typed.
 */
export const NameInItsOwnStyle: Story = {
  args: {
    nameSize: 'lg',
    nameColor: 'accent',
    nameCase: 'upper',
    nameWeight: 'black',
  },
  play: async ({ canvas }) => {
    const name = canvas.getByRole('heading', {
      level: 1,
      name: 'Desi Origins',
    });
    await expect(name).toHaveTextContent('Desi Origins');
    const style = getComputedStyle(name);
    await expect(style.textTransform).toBe('uppercase');
    await expect(style.fontWeight).toBe('900');
    await expect(style.color).toBe(resolved(name, 'var(--site-accent)'));
    // The tagline keeps its own colour.
    const tagline = canvas.getByText('How everyday things began');
    await expect(getComputedStyle(tagline).color).not.toBe(style.color);
  },
};

/** The same in the dark scheme, where the accent is lighter. */
export const NameInItsOwnStyleDark: Story = {
  ...NameInItsOwnStyle,
  globals: { theme: 'dark' },
};

/** A colour of the creator's own for the name, and a lighter weight. */
export const NameInAnOwnColour: Story = {
  args: { nameColor: 'accent', nameTint: '#1d4ed8', nameWeight: 'medium' },
  play: async ({ canvas }) => {
    const name = canvas.getByRole('heading', { level: 1 });
    const style = getComputedStyle(name);
    await expect(style.color).toBe('rgb(29, 78, 216)');
    await expect(style.fontWeight).toBe('500');
    await expect(style.textTransform).toBe('none');
  },
};

/** A colour that isn't a plain one is ignored, and the name keeps the text colour. */
export const NameWithAnUnsafeColour: Story = {
  args: { nameTint: 'url(https://example.com/a.png)' },
  play: async ({ canvas }) => {
    const name = canvas.getByRole('heading', { level: 1 });
    await expect(name.getAttribute('style') ?? '').not.toContain('url');
    await expect(getComputedStyle(name).color).toBe(
      resolved(name, 'var(--site-text)')
    );
  },
};

/** The header's picture is at the top of the page, so it loads at once. */
export const HeaderWithPicture: Story = {
  args: {
    avatar:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect width="1" height="1" fill="%23c2410c"/%3E%3C/svg%3E',
  },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector('header img');
    await expect(image).toHaveAttribute('loading', 'eager');
  },
};

/**
 * Words in a ring that turns slowly around the picture. Screen readers hear
 * them once, in order; the pause button stops the ring, and it stays still
 * for visitors who ask for less motion.
 */
export const WordRing: Story = {
  args: {
    wordRing: 'Chai • Stories • Since 2019',
    avatarSize: 96,
  },
  play: async ({ canvas }) => {
    const header = canvas.getByRole('banner');
    // Read once: the drawn ring is hidden, the words are there as text.
    await expect(
      canvas.getAllByText('Chai • Stories • Since 2019')
    ).toHaveLength(1);
    const ring = header.querySelector('[data-word-ring] > svg')!;
    await expect(ring).toHaveAttribute('aria-hidden', 'true');
    await expect(ring.querySelector('textPath')?.textContent).toContain(
      'Chai • Stories • Since 2019 •'
    );
    // The ring goes round the picture, centred on it.
    const picture = canvas.getByText('DO').getBoundingClientRect();
    const box = ring.getBoundingClientRect();
    await expect(box.width).toBeGreaterThan(picture.width + 20);
    await expect(
      Math.abs(box.left + box.width / 2 - (picture.left + picture.width / 2))
    ).toBeLessThan(1);
    const [turn] = ring.getAnimations();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(turn).toBeUndefined();
      return;
    }
    await expect(turn).toBeDefined();
    const pause = canvas.getByRole('button', {
      name: 'Stop the turning words',
    });
    await expectTapSize(pause, 'ring pause button');
    await userEvent.click(pause);
    await waitFor(() => expect(turn?.playState).toBe('paused'));
    await expect(
      canvas.getByRole('button', { name: 'Turn the words again' })
    ).toBeVisible();
  },
};

/** The ring works beside the name too. */
export const WordRingInARow: Story = {
  args: { wordRing: 'Chai • Stories', layout: 'row', align: 'start' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Chai • Stories')).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: 'Desi Origins' })
    ).toBeVisible();
  },
};

/** With no picture, the initials can be set in the theme's display font. */
export const InitialsInADisplayFont: Story = {
  args: { initialsFont: 'display' },
  render: (args) => (
    <CreatorTheme theme={{ displayFont: '"Courier New", monospace' }}>
      <CreatorHeader {...args} />
    </CreatorTheme>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText('DO')).fontFamily).toContain(
      'Courier New'
    );
    // The name keeps the page's own font.
    const name = canvas.getByRole('heading', { level: 1 });
    await expect(getComputedStyle(name).fontFamily).not.toContain(
      'Courier New'
    );
  },
};

/** By default the initials are in the page's own font, as before. */
export const InitialsInThePageFont: Story = {
  render: (args) => (
    <CreatorTheme theme={{ displayFont: '"Courier New", monospace' }}>
      <CreatorHeader {...args} />
    </CreatorTheme>
  ),
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByText('DO')).fontFamily
    ).not.toContain('Courier New');
  },
};
