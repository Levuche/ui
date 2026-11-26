import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { GoalTracker } from '../src';
import { onScreen } from './screens';

/*
 * A goal and how far along it is: a deadline with the days left, steps to
 * tick off and a bar with the percentage. The clock is fixed, so the days
 * left never change.
 */

const NOW = Date.UTC(2026, 10, 24, 9, 0, 0);
const DAY = 86_400_000;

const meta = {
  title: 'Blocks/Goal tracker',
  component: GoalTracker,
  tags: ['autodocs'],
  args: {
    title: 'Launch the spice course',
    detail: 'Twelve lessons on where everyday spices come from.',
    deadline: new Date(NOW + 37 * DAY).toISOString(),
    now: NOW,
    items: [
      { label: 'Write the lesson plan', done: true },
      { label: 'Film the first six lessons', done: true },
      { label: 'Film the last six lessons' },
      { label: 'Open sign-ups' },
    ],
  },
} satisfies Meta<typeof GoalTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

const bar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[role="progressbar"]')!;

/** The steps make the percentage: 2 of 4 done is 50%. */
export const Steps: Story = {
  play: async ({ canvas, canvasElement }) => {
    const progress = canvas.getByRole('progressbar', {
      name: 'Launch the spice course',
    });
    await expect(progress).toHaveAttribute('aria-valuemin', '0');
    await expect(progress).toHaveAttribute('aria-valuemax', '4');
    await expect(progress).toHaveAttribute('aria-valuenow', '2');
    await expect(progress).toHaveAttribute(
      'aria-valuetext',
      '2 of 4 done, 50%'
    );
    await expect(canvas.getByText('50%')).toBeVisible();
    await expect(canvas.getByText('37 days left')).toBeVisible();
    // The date is written in the visitor's way, with its date for machines.
    const due = canvasElement.querySelector('time')!;
    await expect(due).toHaveAttribute('dateTime', '2026-12-31T09:00:00.000Z');
    await expect(due.textContent).toMatch(/^Due /);
    const steps = canvas.getByRole('list', { name: 'Steps' });
    const items = Array.from(steps.querySelectorAll('li'));
    await expect(items).toHaveLength(4);
    await expect(items[0]).toHaveTextContent('Done: Write the lesson plan');
    await expect(items[3]).toHaveTextContent('Not done yet: Open sign-ups');
    await expect(canvas.queryByText('Goal reached')).toBeNull();
  },
};

/** A bar in ten steps that fill one by one. */
export const BarInSteps: Story = {
  args: {
    bar: 'steps',
    items: [
      { label: 'Script', done: true },
      { label: 'Shoot', done: true },
      { label: 'Edit', done: true },
      { label: 'Music' },
      { label: 'Captions' },
      { label: 'Cover' },
      { label: 'Trailer' },
      { label: 'Post' },
    ],
  },
  play: async ({ canvasElement }) => {
    const progress = bar(canvasElement);
    await expect(progress).toHaveAttribute(
      'aria-valuetext',
      '3 of 8 done, 37%'
    );
    await expect(progress.querySelectorAll('span')).toHaveLength(10);
    // 37% fills three of ten steps: a step fills once it's reached.
    await expect(progress.querySelectorAll('[data-filled]')).toHaveLength(3);
    const [filled] = progress.querySelectorAll('[data-filled]');
    const empty = progress.querySelector(':scope > span:not([data-filled])')!;
    await expect(getComputedStyle(filled!).backgroundColor).not.toBe(
      getComputedStyle(empty).backgroundColor
    );
  },
};

/** An amount towards a target, written as money. */
export const MoneyRaised: Story = {
  args: {
    title: 'Fund a new camera',
    detail: undefined,
    items: [],
    current: 370,
    target: 1000,
    currency: 'USD',
  },
  play: async ({ canvas }) => {
    const progress = canvas.getByRole('progressbar', {
      name: 'Fund a new camera',
    });
    await expect(progress).toHaveAttribute('aria-valuenow', '370');
    await expect(progress).toHaveAttribute('aria-valuemax', '1000');
    await expect(progress).toHaveAttribute(
      'aria-valuetext',
      '$370 of $1,000, 37%'
    );
    await expect(canvas.getByText('$370 of $1,000')).toBeVisible();
    await expect(canvas.queryByRole('list')).toBeNull();
  },
};

/** A count towards a target, in another language's way of writing numbers. */
export const CountInGerman: Story = {
  args: {
    title: 'Mitglieder',
    detail: undefined,
    deadline: undefined,
    items: [],
    current: 1250,
    target: 5000,
    locale: 'de',
    labels: { amount: '{current} von {target}' },
  },
  play: async ({ canvas }) => {
    const progress = canvas.getByRole('progressbar', { name: 'Mitglieder' });
    await expect(progress.getAttribute('aria-valuetext')).toMatch(
      /^1\.250 von 5\.000, 25\s%$/
    );
  },
};

/** Past the target: the bar is full, at 100%, and says the goal is reached. */
export const GoalReached: Story = {
  args: {
    title: 'Reach 10,000 members',
    detail: undefined,
    items: [],
    current: 12400,
    target: 10000,
  },
  play: async ({ canvas, canvasElement }) => {
    const progress = bar(canvasElement);
    await expect(progress).toHaveAttribute('aria-valuenow', '10000');
    await expect(progress).toHaveAttribute(
      'aria-valuetext',
      '12,400 of 10,000, 100%'
    );
    await expect(canvas.getByText('Goal reached')).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-block="goal-tracker"]')
    ).toHaveAttribute('data-done');
  },
};

/** A target that can't be measured against shows an empty bar. */
export const NoUsableTarget: Story = {
  args: {
    title: 'Fund the trip',
    detail: undefined,
    items: [],
    current: 50,
    target: -100,
    currency: 'USD',
  },
  play: async ({ canvasElement }) => {
    const progress = bar(canvasElement);
    await expect(progress).toHaveAttribute('aria-valuenow', '0');
    await expect(progress).toHaveAttribute('aria-valuetext', '$50, 0%');
  },
};

/** Once the deadline has passed, it says so. */
export const DeadlinePassed: Story = {
  args: { deadline: new Date(NOW - 2 * DAY).toISOString() },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Ended')).toBeVisible();
    await expect(canvas.queryByText(/days left/)).toBeNull();
  },
};

/**
 * On the accent tone the bar turns round with the buttons, so it still
 * stands out. It only slides to a new value when the visitor's device allows
 * motion.
 */
export const OnTheAccent: Story = {
  args: { tone: 'accent' },
  globals: onScreen('phone'),
  play: async ({ canvasElement }) => {
    const progress = bar(canvasElement);
    const fill = progress.querySelector('span')!;
    const block = canvasElement.querySelector<HTMLElement>(
      '[data-block="goal-tracker"]'
    )!;
    await expect(getComputedStyle(fill).backgroundColor).not.toBe(
      getComputedStyle(block).backgroundColor
    );
    await expect(fill.style.width).toBe('50%');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(fill).transitionDuration).toBe(
      still ? '0s' : '0.5s'
    );
  },
};

/** In a creator's own theme and the dark scheme. */
export const InACreatorsOwnTheme: Story = {
  ...Steps,
  globals: { theme: 'custom' },
};
export const Dark: Story = { ...Steps, globals: { theme: 'dark' } };
