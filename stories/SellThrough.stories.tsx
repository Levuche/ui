import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';
import {
  BookingCard,
  CreditPack,
  CourseCard,
  FeaturedPack,
  PackGrid,
  PackRow,
  PricingTable,
  SlotPicker,
  useBlockActions,
  type BlockAction,
  type ItemSell,
} from '../src';
import { onScreen } from './screens';

/*
 * Selling through BuildBase: each block takes `sell`, its button reports the
 * press with it, and the app starts the checkout. Here the "app" only shows
 * the last action, so a test can read what a press would check out.
 */

const PACK: ItemSell = { itemId: 'pack1', variantId: 'std', priceId: 'inr' };
const SESSION: ItemSell = {
  itemId: 'call1',
  variantId: 'session',
  priceId: 'inr',
};

function App({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [last, setLast] = useState<BlockAction | null>(null);
  useBlockActions(setLast, root);
  return (
    <div ref={root} className="flex flex-col gap-4">
      {children}
      <output aria-label="Last action" className="font-mono text-xs">
        {last ? JSON.stringify({ action: last.action, sell: last.sell }) : ''}
      </output>
    </div>
  );
}

async function lastAction(canvas: {
  getByLabelText: (t: string) => HTMLElement;
}) {
  let parsed: { action: string; sell?: Record<string, unknown> } | null = null;
  await waitFor(() => {
    const text = canvas.getByLabelText('Last action').textContent ?? '';
    expect(text).not.toBe('');
    parsed = JSON.parse(text);
  });
  return parsed!;
}

const meta = {
  title: 'Blocks/Selling through BuildBase',
  component: PackRow,
  tags: ['autodocs'],
  args: {
    title: 'Weeknight dinners',
    detail: '24 recipes, PDF',
    price: '₹499',
    sell: PACK,
  },
  render: (args) => (
    <App>
      <PackRow {...args} />
    </App>
  ),
} satisfies Meta<typeof PackRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A press reports what it buys, and goes nowhere by itself. */
export const Row: Story = {
  globals: onScreen('phone'),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Buy' }));
    await expect(await lastAction(canvas)).toEqual({
      action: 'buy',
      sell: PACK,
    });
  },
};

/** While the app starts the checkout, the button waits. */
export const Sending: Story = {
  args: { sellState: 'sending' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Buy' })).toBeDisabled();
  },
};

/** Sold out: the button says so and can't be pressed. */
export const SoldOut: Story = {
  args: { sellState: 'sold_out' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Sold out' })
    ).toBeDisabled();
  },
};

/** The checkout was refused: the words say to try again. */
export const Refused: Story = {
  args: { sellState: 'error' },
  play: async ({ canvas }) => {
    // The app's own <output> is a status too, so find the words.
    await expect(
      canvas.getByText('That didn’t go through. Please try again.')
    ).toHaveAttribute('role', 'status');
    await expect(canvas.getByRole('button', { name: 'Buy' })).toBeEnabled();
  },
};

/** The app's own buy button, drawn in the block's place. */
export const OwnButton: Story = {
  args: {
    renderBuy: ({ label, sell }) => (
      <button type="button" data-item={'itemId' in sell ? sell.itemId : ''}>
        App: {label}
      </button>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'App: Buy' })
    ).toHaveAttribute('data-item', 'pack1');
  },
};

/** The featured pack and a grid, each pack with its own sale, on a tablet. */
export const Packs: Story = {
  globals: onScreen('tablet'),
  render: () => (
    <App>
      <FeaturedPack
        title="The full kitchen"
        price="₹1,499"
        image={null}
        sell={{ ...PACK, itemId: 'bundle1' }}
      />
      <PackGrid
        columns={3}
        packs={[
          {
            title: 'Breads',
            price: '₹299',
            image: null,
            sell: { ...PACK, itemId: 'bread' },
          },
          {
            title: 'Curries',
            price: '₹299',
            image: null,
            sell: { ...PACK, itemId: 'curry' },
            sellState: 'sold_out',
          },
          {
            title: 'Sweets',
            price: '₹299',
            image: null,
            href: 'https://example.com/sweets',
          },
        ]}
      />
    </App>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getAllByRole('button', { name: 'Buy' })[0]);
    await expect((await lastAction(canvas)).sell).toEqual({
      ...PACK,
      itemId: 'bread',
    });
    await expect(
      canvas.getByRole('button', { name: 'Sold out' })
    ).toBeDisabled();
    await expect(canvas.getByRole('link', { name: /Sweets/ })).toBeVisible();
  },
};

/** A course and a call keep their own action names, with the sale on them. */
export const CourseAndCall: Story = {
  render: () => (
    <App>
      <CourseCard title="Spice basics" price="₹999" lessons={12} sell={PACK} />
      <BookingCard
        title="1:1 call"
        duration="30 min"
        price="₹1,200"
        sell={SESSION}
      />
    </App>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Book a call' }));
    await expect(await lastAction(canvas)).toEqual({
      action: 'book',
      sell: SESSION,
    });
  },
};

/** Plans as subscriptions: the yearly switch changes what is checked out. */
export const Plans: Story = {
  globals: onScreen('desktop'),
  render: () => (
    <App>
      <PricingTable
        plans={[
          {
            name: 'Member',
            price: '₹299',
            yearlyPrice: '₹2,999',
            perks: ['Every recipe', 'Monthly live class'],
            sell: { planVersionId: 'member', billingInterval: 'monthly' },
            yearlySell: { planVersionId: 'member', billingInterval: 'yearly' },
          },
        ]}
      />
    </App>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Yearly' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Join' }));
    await expect((await lastAction(canvas)).sell).toEqual({
      planVersionId: 'member',
      billingInterval: 'yearly',
    });
  },
};

/** A credit pack. */
export const Credits: Story = {
  render: () => (
    <App>
      <CreditPack
        credits={500}
        bonus={50}
        price="₹399"
        expires="Credits last a year"
        locale="en"
        sell={{ creditPackageId: 'starter' }}
      />
    </App>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('heading', { name: '500 credits' })
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Buy credits' }));
    await expect(await lastAction(canvas)).toEqual({
      action: 'buy_credits',
      sell: { creditPackageId: 'starter' },
    });
  },
};

const SLOTS = [
  '2026-12-02T04:30:00.000Z',
  '2026-12-02T06:00:00.000Z',
  '2026-12-03T09:30:00.000Z',
];

/** Free times by day; the chosen time goes into the sale as slotStart. */
export const Slots: Story = {
  globals: onScreen('phone'),
  render: () => (
    <App>
      <SlotPicker
        title="Book a 1:1 call"
        data={SLOTS}
        timeZone="Asia/Kolkata"
        locale="en-GB"
        sell={SESSION}
      />
    </App>
  ),
  play: async ({ canvas, userEvent }) => {
    const book = canvas.getByRole('button', { name: 'Pick a time' });
    await expect(book).toBeDisabled();
    await userEvent.click(canvas.getByRole('radio', { name: '11:30' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Book Wed 2 Dec, 11:30' })
    );
    await expect(await lastAction(canvas)).toEqual({
      action: 'book',
      sell: { ...SESSION, slotStart: '2026-12-02T06:00:00.000Z' },
    });
    // Another day clears the time, so nothing is booked by surprise.
    await userEvent.click(canvas.getByRole('radio', { name: 'Thu 3 Dec' }));
    await expect(
      canvas.getByRole('button', { name: 'Pick a time' })
    ).toBeDisabled();
  },
};

/** No free times: the block says so. */
export const NoSlots: Story = {
  render: () => <SlotPicker data={[]} timeZone="Asia/Kolkata" sell={SESSION} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/No free times right now/)).toBeVisible();
  },
};
