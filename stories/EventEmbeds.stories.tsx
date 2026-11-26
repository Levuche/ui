import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CalendarEmbed, PreviewMode, TicketEmbed } from '../src';
import { expectTapSize } from './expect-tap-size';

/*
 * A public calendar and an event's tickets. Each story stops before the
 * other site would load, so nothing here reaches the network.
 */

const CALENDAR =
  'https://calendar.google.com/calendar/embed?src=c_8f1e2d3c4b5a%40group.calendar.google.com';

const meta = {
  title: 'Blocks/Calendar and tickets',
  component: CalendarEmbed,
  tags: ['autodocs'],
  args: {
    src: CALENDAR,
    title: 'Pottery classes',
    detail: 'Every week at the studio. Pick a class to see the details.',
    consent: false,
  },
} satisfies Meta<typeof CalendarEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A Google calendar on a page that asks first: it says it loads from
 * Google Calendar, with a plain link to the same calendar under it.
 */
export const GoogleCalendar: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    await expect(canvas.getByText(/Google Calendar/)).toBeVisible();
    const link = canvas.getByRole('link', { name: 'Open the calendar' });
    await expect(link.getAttribute('href')).toMatch(
      /^https:\/\/calendar\.google\.com\/calendar\/embed\?src=/
    );
    await expectTapSize(canvas.getByRole('button', { name: /Load/ }));
  },
};

/** A published Outlook calendar, which Outlook lays out its own way. */
export const OutlookCalendar: Story = {
  args: {
    src: 'https://outlook.office365.com/owa/calendar/classes@studio.example/60273ad624a54608b36477c210b7237f13787421943746669401/calendar.html',
    title: 'Open studio hours',
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-block="calendar-embed"]')
    ).toHaveAttribute('data-service', 'outlookcalendar');
    await expect(canvas.getByText(/Outlook/)).toBeVisible();
  },
};

/** A link to another calendar site is only a link. */
export const OtherCalendar: Story = {
  args: { src: 'https://example.com/calendar', title: 'Upcoming classes' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('[role="img"]')).toBeNull();
    await expect(
      canvas.getByRole('link', { name: 'Open the calendar' })
    ).toHaveAttribute('href', 'https://example.com/calendar');
  },
};

/** Tickets on Luma open in a pop-up; nothing loads until it's opened. */
export const LumaTickets: Story = {
  render: () => (
    <TicketEmbed
      src="evt-AbC123xyz"
      title="Launch night"
      detail="Friday, doors at 7."
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    const button = canvas.getByRole('button', { name: 'Get tickets' });
    await expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(button).toHaveAttribute('data-action', 'tickets_open');
    await expectTapSize(button);
  },
};

/** In the page, on a page that asks first. */
export const LumaTicketsInThePage: Story = {
  render: () => (
    <TicketEmbed
      src="https://luma.com/embed/event/evt-AbC123xyz/simple"
      title="Launch night"
      display="inline"
      consent={false}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    await expect(canvas.getByText(/Luma/)).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Open the ticket page' })
    ).toHaveAttribute('href', 'https://luma.com/event/evt-AbC123xyz');
  },
};

/** An Eventbrite event's button opens its ticket page on Eventbrite. */
export const EventbriteTickets: Story = {
  render: () => (
    <TicketEmbed
      src="https://www.eventbrite.com/e/summer-workshop-tickets-123456789012"
      title="Summer workshop"
      display="inline"
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    const link = canvas.getByRole('link', { name: 'Get tickets' });
    await expect(link).toHaveAttribute(
      'href',
      'https://www.eventbrite.com/e/summer-workshop-tickets-123456789012'
    );
    await expect(link).toHaveAttribute('target', '_blank');
  },
};

/** In the page editor, a still placeholder stands in for the checkout. */
export const TicketsInPreview: Story = {
  render: () => (
    <PreviewMode enabled>
      <TicketEmbed src="evt-AbC123xyz" title="Launch night" display="inline" />
    </PreviewMode>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    await expect(
      canvas.getByRole('img', { name: 'Tickets: Launch night' })
    ).toBeVisible();
  },
};
