import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BookingEmbed, CourseCard, PricingTable, TopPicks } from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/** A plain picture in one colour with a word on it, for the stories. */
const picture = (fill: string, word: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="${fill}"/><text x="160" y="100" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#fff">${word}</text></svg>`
  )}`;

const meta = {
  title: 'Blocks/Store',
  component: CourseCard,
  tags: ['autodocs'],
  args: {
    title: 'Spice blending at home',
    detail: 'Make your own garam masala, sambar powder and chai masala.',
    level: 'Beginner',
    image: picture('#9a3412', 'Spices'),
    imageAlt: 'Bowls of whole spices',
    lessons: 12,
    duration: '2 h 40 min',
    price: '₹1,499',
    was: '₹1,999',
    href: 'https://example.com/course',
  },
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A course with its lessons, length and price. */
export const Course: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('12 lessons')).toBeVisible();
    await expect(canvas.getByText('₹1,499')).toBeVisible();
    const buy = canvas.getByRole('link', { name: 'Start learning' });
    await expect(buy).toHaveAttribute('data-action', 'buy_course');
    await expectTapSize(buy, 'Start learning');
  },
};

/** On a phone, in the creator's own words. */
export const CourseOwnWords: Story = {
  globals: onScreen('phone'),
  args: {
    tone: 'surface',
    labels: { lessons: '{n} videos', button: 'Join the course' },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('12 videos')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Join the course' })
    ).toBeVisible();
  },
};

const PLANS = [
  {
    name: 'Reader',
    price: '₹99',
    yearlyPrice: '₹999',
    perks: ['The weekly story', 'Comments'],
    href: 'https://example.com/reader',
  },
  {
    name: 'Supporter',
    price: '₹299',
    yearlyPrice: '₹2,999',
    perks: ['Everything in Reader', 'Monthly live call', 'Early videos'],
    href: 'https://example.com/supporter',
    yearlyHref: 'https://example.com/supporter-yearly',
    featured: true,
    featuredLabel: 'Most popular',
  },
  {
    name: 'Patron',
    price: '₹999',
    perks: ['Everything in Supporter', 'Your name in the credits'],
    href: 'https://example.com/patron',
  },
];

/** Three plans with a monthly or yearly switch. */
export const Pricing: StoryObj<typeof PricingTable> = {
  globals: onScreen('desktop'),
  render: () => (
    <PricingTable
      title="Support the channel"
      plans={PLANS}
      labels={{ yearlyNote: 'Save 16%' }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('₹299')).toBeVisible();
    const yearly = canvas.getByRole('radio', { name: /Yearly/ });
    await userEvent.click(yearly);
    await expect(yearly).toBeChecked();
    await expect(canvas.getByText('₹2,999')).toBeVisible();
    // Reader's yearly price, and Patron's monthly one: it has no yearly price.
    await expect(canvas.getAllByText('₹999')).toHaveLength(2);
    const links = canvas.getAllByRole('link', { name: 'Join' });
    await expect(links[1]).toHaveAttribute(
      'href',
      'https://example.com/supporter-yearly'
    );
  },
};

/** Two plans on a phone, with no switch when no plan has a yearly price. */
export const PricingOnPhone: StoryObj<typeof PricingTable> = {
  globals: onScreen('phone'),
  render: () => (
    <PricingTable
      plans={PLANS.slice(0, 2).map((plan) => ({
        ...plan,
        yearlyPrice: undefined,
      }))}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('radio')).toBeNull();
    await expect(canvas.getAllByRole('article')).toHaveLength(2);
  },
};

/** Recommended products; affiliate ones are marked and said so under. */
export const Picks: StoryObj<typeof TopPicks> = {
  globals: onScreen('tablet'),
  render: () => (
    <TopPicks
      title="What I cook with"
      columns={2}
      picks={[
        {
          name: 'Cast-iron tawa',
          note: 'Fifteen years and still going.',
          price: '₹1,250',
          image: picture('#1f2937', 'Tawa'),
          href: 'https://example.com/tawa',
          affiliate: true,
        },
        {
          name: 'Brass spice box',
          note: 'Seven spices in reach.',
          image: picture('#a16207', 'Box'),
          href: 'https://example.com/box',
        },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    const tawa = canvas.getByRole('link', { name: /Cast-iron tawa/ });
    await expect(tawa.getAttribute('rel')).toMatch(/sponsored/);
    const box = canvas.getByRole('link', { name: /Brass spice box/ });
    await expect(box.getAttribute('rel') ?? '').not.toMatch(/sponsored/);
    await expect(canvas.getByText(/earn a commission/)).toBeVisible();
  },
};

/** A booking page in a pop-up; it loads only when opened. */
export const Booking: StoryObj<typeof BookingEmbed> = {
  render: () => (
    <BookingEmbed
      title="A 30-minute recipe call"
      detail="Pick a time that suits you."
      src="https://example.com/book"
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    const open = canvas.getByRole('button', { name: 'Pick a time' });
    await expectTapSize(open, 'Pick a time');
    await userEvent.click(open);
    const dialog = within(
      within(canvasElement.ownerDocument.body).getByRole('dialog')
    );
    await expect(
      dialog.getByTitle('Booking: A 30-minute recipe call')
    ).toHaveAttribute('src', 'https://example.com/book');
    await userEvent.click(dialog.getByRole('button', { name: 'Close' }));
    await expect(open).toHaveFocus();
  },
};

/**
 * The closed card says how long a booking is and when the next free time
 * is, which the app passes in, before the visitor opens the booking page.
 */
export const BookingWithNextFreeTime: StoryObj<typeof BookingEmbed> = {
  render: () => (
    <BookingEmbed
      title="A recipe call"
      src="https://example.com/book"
      duration="30 min"
      nextFree="2026-12-03T04:30:00Z"
      timeZone="Asia/Kolkata"
      locale="en-IN"
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('30 min')).toBeVisible();
    // Screen readers hear what the length is.
    await expect(
      canvas.getByText('30 min').closest('li')?.textContent
    ).toContain('Length');
    const time = canvasElement.querySelector('time');
    await expect(time).toHaveAttribute('dateTime', '2026-12-03T04:30:00Z');
    // 04:30 UTC is 10:00 in India.
    await expect(time?.textContent).toMatch(/10:00/);
    await expect(time?.textContent).toMatch(/3 Dec/);
    await expect(canvas.getByText(/Next free:/)).toBeVisible();
    await expect(canvasElement.querySelector('iframe')).toBeNull();
  },
};

/** The same booking page shown in the page, with a plain link under it. */
export const BookingInline: StoryObj<typeof BookingEmbed> = {
  render: () => (
    <BookingEmbed
      display="inline"
      height={30}
      title="A 30-minute recipe call"
      src="https://example.com/book"
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByTitle('Booking: A 30-minute recipe call')
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: /Open the booking page/ })
    ).toHaveAttribute('target', '_blank');
  },
};
