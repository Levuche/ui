import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Countdown, timeLeft } from '../src';

const NOW = Date.UTC(2026, 11, 1, 9, 0, 0);

const meta = {
  title: 'Blocks/Countdown',
  component: Countdown,
  tags: ['autodocs'],
  args: {
    title: 'The reel pack drops in',
    to: new Date(NOW + 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000),
    now: NOW,
  },
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Days, hours, minutes and seconds left. */
export const Running: Story = {
  play: async ({ canvas }) => {
    const timer = canvas.getByRole('timer');
    await expect(timer).toHaveTextContent('02days03hours04minutes05seconds');
    await expect(timeLeft(new Date(NOW + 61_000), NOW)).toEqual([
      { label: 'days', value: 0 },
      { label: 'hours', value: 0 },
      { label: 'minutes', value: 1 },
      { label: 'seconds', value: 1 },
    ]);
  },
};

/** Once time is up it says so instead. */
export const Done: Story = {
  args: { to: new Date(NOW - 1000), doneLabel: 'Out now' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Out now');
    await expect(canvas.queryByRole('timer')).toBeNull();
  },
};
