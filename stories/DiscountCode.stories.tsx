import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { DiscountCode } from '../src';
import { expectTapSize } from './expect-tap-size';

const meta = {
  title: 'Blocks/Discount code',
  component: DiscountCode,
  tags: ['autodocs'],
  args: {
    code: 'ORIGINS10',
    detail: '10% off the reel pack',
    copy: fn(() => Promise.resolve()),
  },
} satisfies Meta<typeof DiscountCode>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One tap copies the code and says so. */
export const Copy: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'Copy code' });
    await expectTapSize(button, 'copy button');
    await userEvent.click(button);
    await expect(args.copy).toHaveBeenCalledWith('ORIGINS10');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Copied ORIGINS10'
    );
    await expect(canvas.getByRole('button', { name: 'Copied' })).toBeVisible();
  },
};

/** If the browser won't copy, the code is read out instead. */
export const CopyFails: Story = {
  args: { copy: fn(() => Promise.reject(new Error('blocked'))) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copy code' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'The code is ORIGINS10'
    );
  },
};
