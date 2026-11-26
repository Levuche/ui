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

/** An old price shows what the visitor saves, in words a creator can change. */
export const WhatYouSave: StoryObj<typeof FeaturedPack> = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FeaturedPack
        title="Origins reel pack"
        detail="100 prompts, a guide and 12 templates"
        price="$12"
        was="$20"
      />
      <PackRow
        title="Prompt starter kit"
        detail="50 prompts"
        price="₹1,499"
        was="₹2,499"
        saveLabel="{amount} off"
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Save $8')).toBeVisible();
    await expect(canvas.getByText('₹1,000 off')).toBeVisible();
  },
};

/**
 * Sold on another site: the button links to that checkout, and a service
 * shows how long it takes beside a price written as the creator likes.
 */
export const OutsideCheckout: StoryObj<typeof FeaturedPack> = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FeaturedPack
        title="Pottery workshop"
        detail="Throw two bowls and a cup on the wheel"
        duration="4.5 h"
        price="from 159 €"
        href="https://shop.example.com/checkout/pottery"
        buttonLabel="Buy now"
      />
      <PackRow
        title="Portrait session"
        detail="In the studio, with ten edited photos"
        duration="1.5 h"
        price="90 €"
        href="https://shop.example.com/portrait"
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const buy = canvas.getByRole('link', { name: 'Buy now' });
    await expect(buy).toHaveAttribute(
      'href',
      'https://shop.example.com/checkout/pottery'
    );
    // Another site, so it opens in a new tab.
    await expect(buy).toHaveAttribute('target', '_blank');
    await expectTapSize(buy, 'Buy now');
    await expect(canvas.getByText('4.5 h')).toBeVisible();
    await expect(canvas.getByText('from 159 €')).toBeVisible();
    await expect(canvas.getByText('1.5 h')).toBeVisible();
  },
};

/** Without a checkout link or a product, the button stays a plain label. */
export const NoCheckoutYet: StoryObj<typeof FeaturedPack> = {
  render: () => (
    <FeaturedPack
      title="Origins reel pack"
      detail="100 prompts, a guide and 12 templates"
      price="$12"
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getByText('I’ll take it')).toBeVisible();
  },
};
