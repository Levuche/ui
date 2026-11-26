import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { MapCard, QrCode, StatsRow, Timeline } from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

const meta = {
  title: 'Blocks/Info',
  component: StatsRow,
  tags: ['autodocs'],
  args: {
    title: 'In numbers',
    locale: 'en-IN',
    stats: [
      { value: 124000, label: 'Followers', format: { notation: 'compact' } },
      { value: 3200, label: 'Students', suffix: '+' },
      {
        value: 4.9,
        label: 'Average rating',
        format: { maximumFractionDigits: 1 },
      },
    ],
  },
} satisfies Meta<typeof StatsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three numbers that count up once when they scroll into view. */
export const Stats: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'In numbers' })
    ).toBeVisible();
    // Screen readers get the final number, whatever the count shows.
    await expect(canvas.getAllByText('1.2L').length).toBeGreaterThan(0);
    await expect(canvas.getByText('Students')).toBeVisible();
  },
};

/** Four numbers on a phone, two to a row, with no counting. */
export const StatsOnPhone: Story = {
  globals: onScreen('phone'),
  args: {
    animate: false,
    tone: 'band',
    stats: [
      { value: 12, label: 'Years cooking' },
      { value: 340, label: 'Recipes' },
      { value: 28, label: 'Countries', suffix: '+' },
      { value: 1, label: 'Cookbook' },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('340')).toHaveLength(2);
  },
};

/** Dated milestones, with one linked. */
export const Milestones: Story = {
  render: () => (
    <Timeline
      title="How it started"
      items={[
        {
          date: '2019',
          dateTime: '2019',
          title: 'First recipe video',
          detail: 'Filmed on a phone in a rented kitchen.',
        },
        { date: '2021', dateTime: '2021', title: 'Opened the online school' },
        {
          date: 'March 2024',
          dateTime: '2024-03',
          title: 'Published the cookbook',
          href: 'https://example.com/book',
          newTab: true,
        },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(
      canvas.getByRole('link', { name: 'Published the cookbook' })
    ).toHaveAttribute('target', '_blank');
  },
};

/** A shop with a map that loads on a tap, hours and directions. */
export const Place: Story = {
  render: () => (
    <MapCard
      place="Spice Room, Fort Kochi"
      address="12 Princess Street, Fort Kochi, Kerala"
      lat={9.9658}
      lng={76.2421}
      hours={[
        { days: 'Mon–Fri', time: '10 am – 7 pm' },
        { days: 'Sat', time: '10 am – 4 pm' },
        { days: 'Sun', time: 'Closed' },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    const show = canvas.getByRole('button', {
      name: 'Show Spice Room, Fort Kochi on a map',
    });
    await expect(show).toHaveAttribute('data-action', 'map_load');
    const directions = canvas.getByRole('link', { name: /Get directions/ });
    await expect(directions).toHaveAttribute('target', '_blank');
    await expectTapSize(directions, 'Directions');
    await expect(canvas.getByText('Mon–Fri')).toBeVisible();
  },
};

/**
 * A dark map with a line over its corner. Taps on the line reach the map
 * under it, and only the loaded map is darkened.
 */
export const DarkMapWithCaption: Story = {
  render: () => (
    <MapCard
      place="Spice Room, Fort Kochi"
      address="12 Princess Street, Fort Kochi, Kerala"
      lat={9.9658}
      lng={76.2421}
      mapStyle="dark"
      mapCaption="Upstairs, blue door"
    />
  ),
  play: async ({ canvas }) => {
    const caption = canvas.getByText('Upstairs, blue door');
    await expect(caption).toBeVisible();
    await expect(getComputedStyle(caption).pointerEvents).toBe('none');
    const show = canvas.getByRole('button', {
      name: 'Show Spice Room, Fort Kochi on a map',
    });
    // The caption sits inside the map's box.
    const box = show.getBoundingClientRect();
    const line = caption.getBoundingClientRect();
    await expect(line.bottom).toBeLessThanOrEqual(box.bottom);
    await expect(line.left).toBeGreaterThanOrEqual(box.left);
    await expect(getComputedStyle(show).filter).toBe('none');
    await userEvent.click(show);
    const map = canvas.getByTitle('Map of Spice Room, Fort Kochi');
    await expect(map.getAttribute('src')).toContain('openstreetmap.org');
    await expect(getComputedStyle(map).filter).toContain('invert');
    await expect(caption).toBeVisible();
  },
};

/** The same place from above. */
export const SatelliteMap: Story = {
  render: () => (
    <MapCard
      place="Spice Room, Fort Kochi"
      lat={9.9658}
      lng={76.2421}
      mapStyle="satellite"
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-map-style="satellite"]')
    ).not.toBeNull();
    // Nothing loads from the map site until the visitor asks for the map.
    await expect(canvasElement.querySelector('iframe')).toBeNull();
  },
};

/** A code that opens the page, with a download button. */
export const Qr: Story = {
  render: () => (
    <QrCode
      title="Scan to open my page"
      value="https://levuche.com/desi-origins"
      fileName="desi-origins"
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('img', { name: 'QR code for levuche.com/desi-origins' })
    ).toBeVisible();
    const save = canvas.getByRole('link', { name: /Save the QR code/ });
    await expect(save).toHaveAttribute('download', 'desi-origins.svg');
    await expectTapSize(save, 'Save');
  },
};
