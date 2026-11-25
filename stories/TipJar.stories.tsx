import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent } from 'react';
import { expect, fn } from 'storybook/test';
import { TipJar } from '../src';
import { expectTapSize } from './expect-tap-size';

const meta = {
  title: 'Blocks/Tip jar',
  component: TipJar,
  tags: ['autodocs'],
  args: {
    detail: 'Every tip pays for one more story.',
    onSubmit: fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    }),
  },
} satisfies Meta<typeof TipJar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pick an amount or type another; the button says what will be sent. */
export const Tip: Story = {
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'Tip $5' });
    await expectTapSize(button, 'tip button');
    await userEvent.click(canvas.getByRole('radio', { name: '$10' }));
    await expect(canvas.getByRole('radio', { name: '$10' })).toBeChecked();
    await userEvent.type(
      canvas.getByRole('spinbutton', { name: 'Other amount' }),
      '25'
    );
    await expect(canvas.getByRole('radio', { name: '$10' })).not.toBeChecked();
    const form = canvasElement.querySelector('form');
    await expect(form && new FormData(form).getAll('amount')).toEqual(['25']);
    await userEvent.click(canvas.getByRole('button', { name: 'Tip $25' }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const Euros: Story = {
  args: { currency: '€', amounts: [2, 4, 8], title: 'Buy me a chai' },
};
