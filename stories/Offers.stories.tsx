import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent } from 'react';
import { expect, fn } from 'storybook/test';
import { BookingCard, LeadMagnet, MembershipCard } from '../src';
import { expectTapSize } from './expect-tap-size';
import { wholeText } from './whole-text';

const meta = {
  title: 'Blocks/Offers',
  component: BookingCard,
  tags: ['autodocs'],
  args: {
    title: 'Origin story review',
    detail: 'I read your script and tell you what to cut.',
    duration: '30 min',
    price: '$40',
    href: 'https://example.com/book',
  },
} satisfies Meta<typeof BookingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A call to book: length, price and a link to the booking page. */
export const Booking: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Origin story review' })
    ).toBeVisible();
    await expect(canvas.getByText('30 min')).toBeVisible();
    const book = canvas.getByRole('link', { name: 'Book a call' });
    await expect(book).toHaveAttribute('href', 'https://example.com/book');
    await expectTapSize(book, 'book button');
  },
};

export const FreeCall: Story = {
  args: { price: 'Free', duration: '15 min', buttonLabel: 'Pick a time' },
};

/** A membership tier; `featured` marks the one to pick. */
export const Membership: StoryObj<typeof MembershipCard> = {
  render: () => (
    <MembershipCard
      title="Insiders"
      price="$5"
      perks={[
        'A bonus story every week',
        'Early access to new packs',
        'Ask me anything, once a month',
      ]}
      href="https://example.com/join"
      featured
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.getByText(wholeText('/ month'))).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Join' })).toHaveAttribute(
      'href',
      'https://example.com/join'
    );
  },
};

const onFree = fn((event: FormEvent<HTMLFormElement>) =>
  event.preventDefault()
);

/** A free guide for an email address; the address is checked first. */
export const FreeGuide: StoryObj<typeof LeadMagnet> = {
  render: () => (
    <LeadMagnet
      title="The origin story checklist"
      detail="One page to plan your next video."
      onSubmit={onFree}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    onFree.mockClear();
    const email = canvas.getByRole('textbox', { name: 'Email' });
    const send = canvas.getByRole('button', { name: 'Send it to me' });
    await expectTapSize(email, 'email box');
    await userEvent.type(email, 'nope');
    await userEvent.click(send);
    await expect(onFree).not.toHaveBeenCalled();
    await userEvent.clear(email);
    await userEvent.type(email, 'reader@example.com');
    await userEvent.click(send);
    await expect(onFree).toHaveBeenCalledOnce();
  },
};
