import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Avatar, CreatorHeader } from '../src';

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
