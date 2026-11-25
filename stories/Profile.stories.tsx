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
