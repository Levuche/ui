import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Avatar, CreatorHeader, CreatorTheme } from '../src';

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
