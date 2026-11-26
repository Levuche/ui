import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CreatorFooter } from '../src';

const meta = {
  title: 'Blocks/CreatorFooter',
  component: CreatorFooter,
  tags: ['autodocs'],
  args: {
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Refunds', href: '/refunds' },
    ],
  },
} satisfies Meta<typeof CreatorFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The policy links in a named list, then the credit. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Site policies' });
    await expect(nav).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/privacy'
    );
    await expect(canvas.getByRole('link', { name: 'Refunds' })).toBeVisible();
    await expect(canvas.getByText('Made with Levuche')).toBeVisible();
  },
};

/** `credit={null}` leaves only the links. */
export const NoCredit: Story = {
  args: { credit: null },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Made with Levuche')).toBeNull();
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
  },
};
