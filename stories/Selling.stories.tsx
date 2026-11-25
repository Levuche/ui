import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent } from 'react';
import { expect, fn } from 'storybook/test';
import {
  BuyButton,
  FeaturedPack,
  PackCheckout,
  PackGrid,
  PackRow,
} from '../src';
import { expectTapSize } from './expect-tap-size';

const meta = {
  title: 'Blocks/Selling',
  component: PackCheckout,
  tags: ['autodocs'],
  args: {
    price: '$12',
    onSubmit: fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
  },
} satisfies Meta<typeof PackCheckout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Checkout only goes ahead once the buyer ticks the consent box. */
export const Checkout: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const buy = canvas.getByRole('button', { name: 'I’ll take it, $12' });
    await expectTapSize(buy, 'buy button');
    await userEvent.click(buy);
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('checkbox', { name: /14-day right to cancel/ })
    );
    await userEvent.click(buy);
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const CustomLabel: Story = {
  args: { buttonLabel: 'Get the pack' },
};

export const Featured: StoryObj<typeof FeaturedPack> = {
  render: () => (
    <FeaturedPack
      title="Origins reel pack"
      detail="100 prompts, a guide and 12 templates"
      price="$12"
    />
  ),
};

export const Row: StoryObj<typeof PackRow> = {
  render: () => (
    <PackRow title="Prompt starter kit" detail="50 prompts" price="$7" />
  ),
};

export const Grid: StoryObj<typeof PackGrid> = {
  render: () => (
    <PackGrid
      packs={[
        { title: 'Starter kit', price: '$7' },
        { title: 'Caption playbook', price: '$5' },
      ]}
    />
  ),
};

export const Buy: StoryObj<typeof BuyButton> = {
  render: () => <BuyButton>Buy, $7</BuyButton>,
};
