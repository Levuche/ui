import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ImageGrid } from '../src';

const meta = {
  title: 'Blocks/Images',
  component: ImageGrid,
  tags: ['autodocs'],
  args: {
    images: [
      { alt: 'Chai on a clay stove', href: 'https://example.com/chai' },
      { alt: 'A spice market in Kochi' },
      { alt: 'Tea leaves drying in Assam' },
    ],
  },
} satisfies Meta<typeof ImageGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every picture is described; a linked one is named by its description. */
export const ThreeAcross: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('img')).toHaveLength(3);
    await expect(
      canvas.getByRole('link', { name: 'Chai on a clay stove' })
    ).toHaveAttribute('target', '_blank');
  },
};

export const TwoAcross: Story = { args: { columns: 2 } };
