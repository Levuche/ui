import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { EventCard } from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/*
 * One event with its date badge, how far away it is and an "Add to
 * calendar" button. A fixed clock (`now`), so every story reads the same.
 */

const NOW = Date.UTC(2026, 10, 15, 9, 0, 0);
const H = 3_600_000;

/** A plain picture for the stories, a sunset in two bands. */
const picture = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="#7c2d12"/><rect y="110" width="320" height="70" fill="#1e293b"/><circle cx="160" cy="110" r="40" fill="#f59e0b"/></svg>'
)}`;

const meta = {
  title: 'Blocks/Event card',
  component: EventCard,
  tags: ['autodocs'],
  args: {
    title: 'Live cooking night',
    start: '2027-03-15T19:00',
    end: '2027-03-15T22:00',
    timeZone: 'Europe/London',
    venue: 'The Old Hall',
    city: 'Leeds',
    href: 'https://example.com/tickets',
    now: NOW,
    locale: 'en-US',
  },
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const card = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-block="event-card"]')!;

/** Decodes the .ics file behind the download link. */
const icsOf = (link: HTMLElement) => {
  const href = link.getAttribute('href') ?? '';
  return decodeURIComponent(href.slice(href.indexOf(',') + 1));
};

/**
 * A full row (2x1): the date badge, "In 4 months", the time where the event
 * is with its zone, tickets and "Add to calendar", which opens its two
 * choices.
 */
export const Wide: Story = {
  globals: onScreen('desktop'),
  play: async ({ canvas, canvasElement }) => {
    const block = card(canvasElement);
    await expect(block).toHaveAttribute('data-tile', '2x1');
    await expect(block).toHaveAttribute('data-state', 'upcoming');
    await expect(await canvas.findByText('In 4 months')).toBeVisible();
    await expect(
      canvas.getByRole('heading', { name: 'Live cooking night' })
    ).toBeVisible();
    // The badge is for the eye; the date line is what screen readers read.
    const badge = block.querySelector('[aria-hidden] .tabular-nums');
    await expect(badge).toHaveTextContent('15');
    const time = block.querySelector('time')!;
    await expect(time).toHaveAttribute('datetime', '2027-03-15T19:00:00.000Z');
    await expect(time.textContent).toMatch(/^Mon, Mar 15, 2027, 7:00/);
    await expect(canvas.getByText('UTC')).toBeVisible();
    await expect(canvas.getByText('The Old Hall, Leeds')).toBeVisible();

    const tickets = canvas.getByRole('link', {
      name: /^Get tickets ?: Live cooking night$/,
    });
    await expect(tickets).toHaveAttribute('data-action', 'event_tickets');
    await expectTapSize(tickets, 'Tickets');

    const open = block.querySelector('summary')!;
    await expect(open).toHaveTextContent('Add to calendar: Live cooking night');
    await expectTapSize(open, 'Add to calendar');
    await expect(
      within(open.parentElement!).getByText('Google Calendar')
    ).not.toBeVisible();
    open.focus();
    await expect(open).toHaveFocus();
    await userEvent.click(open);
    await expect(open.parentElement).toHaveAttribute('open');
    const google = canvas.getByRole('link', { name: 'Google Calendar' });
    const params = new URL(google.getAttribute('href')!).searchParams;
    await expect(params.get('dates')).toBe('20270315T190000Z/20270315T220000Z');
    await expect(params.get('ctz')).toBe('Europe/London');
    await expect(params.get('location')).toBe('The Old Hall, Leeds');
    await expect(google).toHaveAttribute('target', '_blank');
    await expect(google).toHaveAttribute('data-action', 'calendar_google');
    await expectTapSize(google, 'Google Calendar');
    const file = canvas.getByRole('link', { name: 'Other calendars (.ics)' });
    await expect(file).toHaveAttribute('download', 'live-cooking-night.ics');
    await expect(file).toHaveAttribute('data-action', 'calendar_ics');
    await expect(icsOf(file)).toContain('DTSTART:20270315T190000Z');
    await expect(icsOf(file)).toContain('URL:https://example.com/tickets');
    await expectTapSize(file, 'Download');
  },
};

/** The same card on a phone: everything stacks and nothing spills over. */
export const WideOnAPhone: Story = {
  globals: onScreen('phone'),
  play: async ({ canvas, canvasElement }) => {
    const block = card(canvasElement);
    const tickets = canvas.getByRole('link', { name: /^Get tickets/ });
    const open = block.querySelector('summary')!;
    await expect(open.getBoundingClientRect().top).toBeGreaterThan(
      tickets.getBoundingClientRect().top
    );
    await expect(block.scrollWidth).toBeLessThanOrEqual(block.clientWidth);
  },
};

/** On a tablet: tickets and the calendar button side by side. */
export const WideOnATablet: Story = {
  globals: onScreen('tablet'),
  play: async ({ canvas, canvasElement }) => {
    const block = card(canvasElement);
    const tickets = canvas.getByRole('link', { name: /^Get tickets/ });
    const open = block.querySelector('summary')!;
    await expect(
      Math.abs(
        open.getBoundingClientRect().top - tickets.getBoundingClientRect().top
      )
    ).toBeLessThan(2);
    await expect(block.scrollWidth).toBeLessThanOrEqual(block.clientWidth);
  },
};

/** A picture behind the words, dimmed so they stay readable. */
export const WithPicture: Story = {
  args: { image: picture },
  play: async ({ canvasElement }) => {
    const img = card(canvasElement).querySelector('img')!;
    await expect(img).toHaveAttribute('alt', '');
    await expect(img.closest('[aria-hidden]')).not.toBeNull();
    await expect(getComputedStyle(img).filter).toBe('none');
  },
};

/** Two rows (2x2): the picture across the top, the description, and tickets sold through BuildBase. */
export const Large: Story = {
  args: {
    tile: '2x2',
    image: picture,
    description:
      'Four dishes from one spice box, cooked live. Bring an apron; we bring the chai.',
    sell: { itemId: 'item_1', variantId: 'var_1', priceId: 'price_1' },
  },
  play: async ({ canvas, canvasElement }) => {
    const block = card(canvasElement);
    await expect(block).toHaveAttribute('data-tile', '2x2');
    await expect(canvas.getByText(/Four dishes/)).toBeVisible();
    const buy = canvas.getByRole('button', { name: /^Get tickets/ });
    await expect(buy).toHaveAttribute('data-sell');
    await expect(buy).toHaveAttribute('data-action', 'event_tickets');
    // The picture sits above the words, not behind them.
    const img = block.querySelector('img')!;
    await expect(img.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      canvas.getByRole('heading').getBoundingClientRect().top + 1
    );
  },
};

/** No picture: a soft wash of the accent colour, so it never looks empty. */
export const NoPicture: Story = {
  play: async ({ canvasElement }) => {
    const wash = card(canvasElement).querySelector<HTMLElement>(
      ':scope > [aria-hidden]'
    )!;
    await expect(getComputedStyle(wash).backgroundImage).toMatch(
      /^linear-gradient/
    );
  },
};

/** While it's on: "Happening now". */
export const HappeningNow: Story = {
  args: { now: Date.UTC(2027, 2, 15, 20, 0, 0) },
  play: async ({ canvas, canvasElement }) => {
    await expect(card(canvasElement)).toHaveAttribute('data-state', 'live');
    await expect(await canvas.findByText('Happening now')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: /^Get tickets/ })
    ).toBeVisible();
  },
};

/** Once it's over: "Ended", a grey picture and no buttons. */
export const Ended: Story = {
  args: { image: picture, now: Date.UTC(2027, 2, 16, 9, 0, 0) },
  play: async ({ canvas, canvasElement }) => {
    const block = card(canvasElement);
    await expect(block).toHaveAttribute('data-state', 'past');
    await expect(await canvas.findByText('Ended')).toBeVisible();
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(block.querySelector('summary')).toBeNull();
    await expect(getComputedStyle(block.querySelector('img')!).filter).toMatch(
      /grayscale/
    );
  },
};

/** Over three days, all day: dates only, and the calendar gets whole days. */
export const AllDay: Story = {
  args: {
    title: 'Spice fair',
    start: '2027-03-15',
    end: '2027-03-17',
    allDay: true,
    timeZone: undefined,
  },
  play: async ({ canvas, canvasElement }) => {
    const block = card(canvasElement);
    const time = block.querySelector('time')!;
    await expect(time).toHaveAttribute('datetime', '2027-03-15');
    await expect(time.textContent).toMatch(/Mar 15/);
    await expect(time.textContent).toMatch(/17/);
    await expect(time.textContent).not.toMatch(/PM|AM/);
    await userEvent.click(block.querySelector('summary')!);
    const file = canvas.getByRole('link', { name: 'Other calendars (.ics)' });
    await expect(icsOf(file)).toContain('DTSTART;VALUE=DATE:20270315');
    await expect(icsOf(file)).toContain('DTEND;VALUE=DATE:20270318');
  },
};

/** In the visitor's language: the badge and the chip come from the locale. */
export const InFrench: Story = {
  args: {
    locale: 'fr-FR',
    labels: {
      tickets: 'Billets',
      addToCalendar: 'Ajouter au calendrier',
      download: 'Autres calendriers (.ics)',
    },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText('Dans 4 mois')).toBeVisible();
    await expect(
      card(canvasElement).querySelector('time')?.textContent
    ).toMatch(/15 mars 2027/);
    await expect(canvas.getByText(/Ajouter au calendrier/)).toBeVisible();
  },
};

/** Sold out: says so in place of tickets; the calendar button stays. */
export const SoldOut: Story = {
  args: { soldOut: true },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Sold out')).toBeVisible();
    await expect(canvas.queryByRole('link', { name: /tickets/ })).toBeNull();
    await expect(card(canvasElement).querySelector('summary')).not.toBeNull();
  },
};

/** The creator pasted the event's link; the app filled in what it read there. */
export const FilledFromItsLink: Story = {
  args: {
    title: undefined,
    start: undefined,
    end: undefined,
    timeZone: undefined,
    venue: undefined,
    city: undefined,
    details: {
      data: {
        title: 'Chai tasting',
        start: '2026-11-17T09:00:00Z',
        end: '2026-11-17T11:00:00Z',
        venue: 'Tea Room',
        image: picture,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Chai tasting' })
    ).toBeVisible();
    await expect(await canvas.findByText('In 2 days')).toBeVisible();
    await expect(canvas.getByText('Tea Room')).toBeVisible();
    await expect(canvas.getByText('UTC')).toBeVisible();
  },
};

/** While the app reads the event's link: a skeleton, read out as loading. */
export const Loading: Story = {
  args: {
    title: undefined,
    start: undefined,
    details: { data: null, loading: true },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('status', { name: 'Loading the event' })
    ).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.queryByRole('heading')).toBeNull();
  },
};

/** The calendar button can be turned off. */
export const NoCalendarButton: Story = {
  args: { calendar: false, now: NOW + H },
  play: async ({ canvasElement }) => {
    await expect(card(canvasElement).querySelector('summary')).toBeNull();
  },
};
