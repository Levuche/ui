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

/** With no photo, the round avatar shows the creator's initials. */
export const Header: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Desi Origins' })
    ).toBeVisible();
    await expect(canvas.getByText('DO')).toBeVisible();
  },
};

export const AlignedStart: Story = { args: { align: 'start' } };

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
