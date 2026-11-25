import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';
import {
  ActionCard,
  FeaturedPack,
  PricingTable,
  useBlockActions,
  type BlockAction,
  type ItemSell,
} from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/** A plain picture in one colour with a word on it, for the stories. */
const picture = (fill: string, word: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260"><rect width="200" height="260" fill="${fill}"/><text x="100" y="140" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#fff">${word}</text></svg>`
  )}`;

/*
 * A bold card for one of the creator's main offers, with a bar that says
 * what happens next. A press anywhere on the card is one press on the bar.
 */
const meta = {
  title: 'Blocks/Action card',
  component: ActionCard,
  tags: ['autodocs'],
  args: {
    title: 'Book a 1:1 call',
    detail: 'Thirty minutes on your next video, with notes after',
    buttonLabel: 'Pick a time',
    href: 'https://example.com/book',
  },
} satisfies Meta<typeof ActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The point a visitor would press: the middle of the card's title. */
const titleCentre = (title: HTMLElement) => {
  const box = title.getBoundingClientRect();
  return [box.left + box.width / 2, box.top + box.height / 2] as const;
};

/** In the accent colour, as a link. Pressing the title presses the bar. */
export const AsALink: Story = {
  play: async ({ canvas, canvasElement }) => {
    const link = canvas.getByRole('link', { name: 'Pick a time' });
    await expectTapSize(link, 'bar');
    await expect(link).toHaveAttribute('href', 'https://example.com/book');
    await expect(
      canvasElement.querySelector('[data-block="action-card"]')
    ).toHaveAttribute('data-tone', 'accent');
    const [x, y] = titleCentre(
      canvas.getByRole('heading', { name: 'Book a 1:1 call' })
    );
    await expect(link.contains(document.elementFromPoint(x, y))).toBe(true);
  },
};

export const WithAPicture: Story = {
  args: {
    title: 'Origins reel pack',
    detail: '100 prompts, a guide and 12 templates',
    buttonLabel: 'See what’s inside',
    media: { type: 'picture', src: picture('#9a3412', 'Reels') },
  },
};

/** A bundle, its covers fanned out, with a ribbon over the corner. */
export const WithCoversAndARibbon: Story = {
  args: {
    title: 'The whole bundle',
    detail: 'Every pack so far, and the next two',
    buttonLabel: 'Get the bundle',
    ribbon: 'Most popular',
    media: {
      type: 'covers',
      covers: [
        { src: picture('#9a3412', 'Reels') },
        { src: picture('#0f766e', 'Hooks') },
        { src: picture('#1e1b4b', 'Scripts') },
      ],
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Most popular')).toBeVisible();
    // Even over the covers, a press lands on the bar.
    const covers = canvasElement.querySelectorAll('img');
    await expect(covers).toHaveLength(3);
    const box = covers[2].getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2
    );
    await expect(
      canvas.getByRole('link', { name: 'Get the bundle' }).contains(hit)
    ).toBe(true);
  },
};

/** The creator's photo, with a dot while they're live. */
export const WithALivePhoto: Story = {
  args: {
    title: 'Live: Q&A on hooks',
    detail: 'Ask me anything about your first three seconds',
    buttonLabel: 'Join the stream',
    tone: 'band',
    media: { type: 'photo', name: 'Desi Origins', live: true },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Live now' })).toBeVisible();
  },
};

const PACK: ItemSell = { itemId: 'pack1', variantId: 'std', priceId: 'inr' };

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

/** Selling through BuildBase: a press reports what it buys, once. */
export const Selling: Story = {
  args: {
    title: 'Origins reel pack',
    detail: '100 prompts, a guide and 12 templates',
    buttonLabel: 'Buy for ₹999',
    href: undefined,
    sell: PACK,
  },
  render: (args) => (
    <App>
      <ActionCard {...args} />
    </App>
  ),
  play: async ({ canvas, userEvent }) => {
    const buy = canvas.getByRole('button', { name: 'Buy for ₹999' });
    await expectTapSize(buy, 'bar');
    const [x, y] = titleCentre(
      canvas.getByRole('heading', { name: 'Origins reel pack' })
    );
    const hit = document.elementFromPoint(x, y) as HTMLElement;
    await expect(buy.contains(hit)).toBe(true);
    await userEvent.click(hit);
    await waitFor(() => {
      const text = canvas.getByLabelText('Last action').textContent ?? '';
      const last = JSON.parse(text || 'null');
      expect(last).toEqual({ action: 'buy', sell: PACK });
    });
  },
};

/** Two cards side by side on a tablet, as a page might lead with them. */
export const TwoOnATablet: Story = {
  globals: onScreen('tablet'),
  render: (args) => (
    <div className="grid gap-4 md:grid-cols-2">
      <ActionCard {...args} />
      <ActionCard
        title="Story presets"
        detail="Twelve looks for your reels"
        buttonLabel="Shop the presets"
        href="https://example.com/presets"
        tone="band"
        ribbon="New"
      />
    </div>
  ),
};

/** Right to left: the arrow and the ribbon turn round. */
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'احجز مكالمة',
    detail: 'ثلاثون دقيقة عن فيديوك القادم',
    buttonLabel: 'اختر وقتاً',
    ribbon: 'جديد',
  },
};

/** The ribbon also goes on a featured pack and a pricing plan. */
export const RibbonsOnOtherCards: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <FeaturedPack
        title="Origins reel pack"
        detail="100 prompts, a guide and 12 templates"
        price="$12"
        ribbon="Best seller"
      />
      <PricingTable
        plans={[
          {
            name: 'Reader',
            price: '₹299',
            perks: ['Every new story'],
            href: 'https://example.com/reader',
          },
          {
            name: 'Supporter',
            price: '₹999',
            perks: ['Every new story', 'Early access'],
            href: 'https://example.com/supporter',
            featured: true,
            ribbon: 'Best value',
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Best seller')).toBeVisible();
    await expect(canvas.getByText('Best value')).toBeVisible();
  },
};
