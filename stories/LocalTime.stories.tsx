import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { LocalTime } from '../src';
import { onScreen } from './screens';

/*
 * The creator's local time. A fixed moment, locale and visitor time zone, so
 * the stories never depend on the clock or the machine they run on:
 * Thursday 26 November 2026, 15:05 UTC, read from London.
 */
const AT = Date.UTC(2026, 10, 26, 15, 5, 0);

const meta = {
  title: 'Blocks/Local time',
  component: LocalTime,
  tags: ['autodocs'],
  args: {
    city: 'mumbai',
    cityName: 'Kochi',
    now: AT,
    live: false,
    locale: 'en-US',
    visitorTimeZone: 'Europe/London',
  },
} satisfies Meta<typeof LocalTime>;

export default meta;
type Story = StoryObj<typeof meta>;

const block = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-block="local-time"]')!;

const themedPage = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-testid="story-theme"]')!;

/** A full row (2x1): the time large, the date and city under it. */
export const TwoByOne: Story = {
  globals: onScreen('desktop'),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('My local time')).toBeVisible();
    const time = canvasElement.querySelector('time')!;
    await expect(time).toHaveTextContent('8:35PM');
    await expect(time).toHaveAttribute('datetime', '2026-11-26T20:35+05:30');
    await expect(canvas.getByText('Thu, Nov 26')).toBeVisible();
    await expect(canvas.getByText('Kochi')).toBeVisible();
    await expect(canvas.getByText('5 h 30 min ahead of you')).toBeVisible();
    const root = block(canvasElement);
    await expect(root).toHaveAttribute('data-tile', '2x1');
    await expect(root).toHaveAttribute('data-zone', 'Asia/Kolkata');
    // Nothing reads the time out on its own as it changes.
    await expect(root.querySelector('[aria-live]')).toBeNull();
    await expect(root.querySelector('[role="timer"]')).toBeNull();
  },
};

/** Two rows (2x2) on a phone, with an "Away" chip from the creator's hours. */
export const TwoByTwoAway: Story = {
  args: { tile: '2x2', hours: { from: '09:00', to: '18:00' } },
  globals: onScreen('phone'),
  play: async ({ canvas, canvasElement }) => {
    await expect(block(canvasElement)).toHaveAttribute('data-tile', '2x2');
    // 20:35 in Kochi is after 18:00.
    await expect(canvas.getByText('Away')).toBeVisible();
    await expect(canvas.queryByText('Open now')).toBeNull();
    const chip = canvasElement.querySelector('[data-open]')!;
    await expect(chip).toHaveAttribute('data-open', 'false');
  },
};

/** Inside the creator's hours: "Open now", with a dot in the accent colour. */
export const OpenNow: Story = {
  args: {
    city: 'london',
    cityName: undefined,
    hours: { from: '09:00', to: '17:30' },
    visitorTimeZone: 'Asia/Tokyo',
  },
  globals: onScreen('tablet'),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Open now')).toBeVisible();
    await expect(canvas.getByText('London')).toBeVisible();
    await expect(canvas.getByText('9 h behind you')).toBeVisible();
    // The dot takes the theme's accent, never a colour of its own.
    const probe = document.createElement('span');
    probe.style.color = 'var(--site-accent)';
    themedPage(canvasElement).append(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();
    const dot = canvasElement.querySelector('[data-open] [aria-hidden]')!;
    await expect(getComputedStyle(dot).backgroundColor).toBe(accent);
  },
};

/** The creator picks a 24-hour clock, whatever the visitor's locale. */
export const TwentyFourHours: Story = {
  args: { clock: 24 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toHaveTextContent(
      /^20:35$/
    );
  },
};

/** A time zone that can't be read falls back to the city's. */
export const UnknownTimeZone: Story = {
  args: { city: 'lisbon', cityName: undefined, timeZone: 'Mars/Olympus' },
  play: async ({ canvas, canvasElement }) => {
    await expect(block(canvasElement)).toHaveAttribute(
      'data-zone',
      'Europe/Lisbon'
    );
    await expect(canvasElement.querySelector('time')).toHaveTextContent(
      '3:05PM'
    );
    await expect(canvas.getByText('Same time as you')).toBeVisible();
  },
};

/** Only the time: no date, city, offset or title. */
export const TimeOnly: Story = {
  args: {
    showDate: false,
    showCity: false,
    showOffset: false,
    labels: { title: '' },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toBeVisible();
    await expect(canvas.queryByText('Kochi')).toBeNull();
    await expect(canvas.queryByText(/ahead of you/)).toBeNull();
    await expect(canvas.queryByText('My local time')).toBeNull();
  },
};

/** The creator's own words. */
export const OwnWords: Story = {
  args: {
    labels: {
      title: 'Here it’s',
      ahead: 'I’m {time} ahead of you',
      hours: '{n} hr',
      minutes: '{n} mins',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Here it’s')).toBeVisible();
    await expect(
      canvas.getByText('I’m 5 hr 30 mins ahead of you')
    ).toBeVisible();
  },
};

/** Without a time from the app, a placeholder until the page runs. */
export const Placeholder: Story = {
  args: { now: undefined },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('time')).toBeNull();
    await expect(canvas.getByText('--:--')).toHaveAttribute('aria-hidden');
    await expect(canvas.getByText('Kochi')).toBeVisible();
    await expect(canvas.queryByText(/ahead of you/)).toBeNull();
  },
};

/** Live: the browser's clock takes over once the page runs. */
export const Live: Story = {
  args: { now: undefined, live: true },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('time')).not.toBeNull()
    );
    const time = canvasElement.querySelector('time')!;
    await expect(time.getAttribute('datetime')).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\+05:30$/
    );
    // Nothing moves: no animation or transition on the time.
    const style = getComputedStyle(time.parentElement!);
    await expect(style.animationName).toBe('none');
    await expect(block(canvasElement).querySelector('[aria-live]')).toBeNull();
  },
};
