import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ProgressBar, ProgressList } from '../src';

/*
 * Bars in a list, for skills, ratings or languages, with the same bar as the
 * goal tracker.
 */

const meta = {
  title: 'Blocks/Progress list',
  component: ProgressList,
  tags: ['autodocs'],
  args: {
    title: 'What I work with',
    items: [
      { label: 'Food photography', value: 90 },
      { label: 'Video editing', value: 75 },
      { label: 'Writing scripts', value: 60 },
    ],
  },
} satisfies Meta<typeof ProgressList>;

export default meta;
type Story = StoryObj<typeof meta>;

const bars = (canvasElement: HTMLElement) =>
  Array.from(
    canvasElement.querySelectorAll<HTMLElement>('[role="progressbar"]')
  );

/** Skills as percentages: each bar is named by its skill. */
export const Skills: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { name: 'What I work with' })
    ).toBeVisible();
    const editing = canvas.getByRole('progressbar', { name: 'Video editing' });
    await expect(editing).toHaveAttribute('aria-valuenow', '75');
    await expect(editing).toHaveAttribute('aria-valuemax', '100');
    await expect(editing).toHaveAttribute('aria-valuetext', '75%');
    await expect(canvas.getByText('90%')).toBeVisible();
    await expect(bars(canvasElement)).toHaveLength(3);
    await expect(editing.querySelector('span')!.style.width).toBe('75%');
  },
};

/** Ratings out of 5, in five steps, written as "4 of 5". */
export const RatingsInSteps: Story = {
  args: {
    title: 'How the course rates',
    max: 5,
    valueAs: 'amount',
    bar: 'steps',
    steps: 5,
    items: [
      { label: 'Lessons', value: 5 },
      { label: 'Recipes', value: 4 },
      { label: 'Videos', value: 3.5 },
    ],
  },
  play: async ({ canvas }) => {
    const recipes = canvas.getByRole('progressbar', { name: 'Recipes' });
    await expect(recipes).toHaveAttribute('aria-valuetext', '4 of 5');
    await expect(recipes.querySelectorAll('span')).toHaveLength(5);
    await expect(recipes.querySelectorAll('[data-filled]')).toHaveLength(4);
    const videos = canvas.getByRole('progressbar', { name: 'Videos' });
    await expect(videos).toHaveAttribute('aria-valuetext', '3.5 of 5');
    // Half a step isn't a step reached.
    await expect(videos.querySelectorAll('[data-filled]')).toHaveLength(3);
    await expect(canvas.getByText('4 of 5')).toBeVisible();
  },
};

/** One item can have its own most; values over it are held at full. */
export const OwnMostAndOverTheTop: Story = {
  args: {
    items: [
      { label: 'Hindi', value: 7, max: 5 },
      { label: 'Spanish', value: -2 },
    ],
  },
  play: async ({ canvas }) => {
    const hindi = canvas.getByRole('progressbar', { name: 'Hindi' });
    await expect(hindi).toHaveAttribute('aria-valuenow', '5');
    await expect(hindi).toHaveAttribute('aria-valuetext', '100%');
    const spanish = canvas.getByRole('progressbar', { name: 'Spanish' });
    await expect(spanish).toHaveAttribute('aria-valuenow', '0');
  },
};

/** Just the bars, with no numbers beside them; screen readers still hear them. */
export const NoNumbers: Story = {
  args: { valueAs: 'none', title: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('90%')).toBeNull();
    await expect(
      canvas.getByRole('progressbar', { name: 'Food photography' })
    ).toHaveAttribute('aria-valuetext', '90%');
  },
};

/** The bar on its own, as an app can use it anywhere. */
export const BarOnItsOwn: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ProgressBar value={37} label="Smooth" size="sm" />
      <ProgressBar value={37} label="In steps" steps={10} />
      <ProgressBar value={3} max={4} label="Large" size="lg" />
    </div>
  ),
  play: async ({ canvas }) => {
    const smooth = canvas.getByRole('progressbar', { name: 'Smooth' });
    await expect(smooth).toHaveAttribute('aria-valuetext', '37%');
    const steps = canvas.getByRole('progressbar', { name: 'In steps' });
    await expect(steps.querySelectorAll('[data-filled]')).toHaveLength(3);
    const large = canvas.getByRole('progressbar', { name: 'Large' });
    await expect(large).toHaveAttribute('aria-valuetext', '75%');
    await expect(large.getBoundingClientRect().height).toBe(16);
  },
};
