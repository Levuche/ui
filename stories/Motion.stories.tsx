import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
  BLOCK_EFFECTS,
  BookingCard,
  TextStrip,
  useBlockEffects,
  type BlockEffect,
} from '../src';
import { expectTapSize } from './expect-tap-size';

/*
 * Motion inside blocks: small loops on any block (`effect`), and a band of
 * words that scrolls across (TextStrip). Loops play for under five seconds;
 * anything that moves for longer has a pause button. Nothing moves for
 * visitors who ask for less motion, so each play function checks what it
 * can when motion is on and that nothing moves when it's off.
 */
const meta = {
  title: 'Blocks/Motion',
  component: TextStrip,
  tags: ['autodocs'],
  args: {
    items: ['New drop', 'Free shipping over ₹999', 'Made in Pune'],
    label: 'Shop news',
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['start', 'end'] },
    speed: { control: { type: 'number', min: 5, max: 60 } },
  },
} satisfies Meta<typeof TextStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

const lessMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The theme's page inside the story, where the blocks are. */
const page = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-testid="story-theme"]') ??
  canvasElement;

/** The scrolling row's animation, or undefined when nothing moves. */
const rowMotion = (canvasElement: HTMLElement) =>
  page(canvasElement)
    .querySelector('[data-block="text-strip"] ul')
    ?.getAnimations()[0];

/**
 * The words scroll by. Screen readers hear each phrase once, in order; the
 * copies that make the loop seamless are hidden from them.
 */
export const ScrollingWords: Story = {
  play: async ({ canvas, canvasElement }) => {
    const strip = canvas.getByRole('region', { name: 'Shop news' });
    await expect(strip).toHaveAttribute('data-block', 'text-strip');
    await expect(strip).toHaveAttribute('data-tone', 'band');
    const read = canvas.getAllByRole('listitem').map((li) => li.textContent);
    await expect(read).toEqual([
      'New drop✦',
      'Free shipping over ₹999✦',
      'Made in Pune✦',
    ]);
    const motion = rowMotion(canvasElement);
    if (lessMotion()) {
      await expect(motion).toBeUndefined();
      return;
    }
    await expect(motion).toBeDefined();
    // At least one copy of the words is hidden from screen readers.
    await expect(
      strip.querySelectorAll('li[aria-hidden="true"]').length
    ).toBeGreaterThanOrEqual(3);
  },
};

/** The pause button stops the words, and plays them again. */
export const PauseButton: Story = {
  play: async ({ canvas, canvasElement }) => {
    if (lessMotion()) {
      // Nothing moves, so there's nothing to pause.
      await expect(canvas.queryByRole('button')).toBeNull();
      return;
    }
    const pause = canvas.getByRole('button', {
      name: 'Stop the moving words',
    });
    await expectTapSize(pause, 'pause button');
    await userEvent.click(pause);
    await waitFor(() =>
      expect(rowMotion(canvasElement)?.playState).toBe('paused')
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Move the words again' })
    );
    await waitFor(() =>
      expect(rowMotion(canvasElement)?.playState).toBe('running')
    );
  },
};

/** Moving towards the end of the line, slower, with a different separator. */
export const OtherWay: Story = {
  args: { direction: 'end', speed: 30, separator: '/', tone: 'accent' },
  play: async ({ canvasElement, canvas }) => {
    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent(
      'New drop/'
    );
    const motion = rowMotion(canvasElement);
    if (!motion) return;
    const timing = motion.effect?.getComputedTiming();
    await expect(timing?.direction).toBe('reverse');
    await expect(Number(timing?.duration)).toBeGreaterThanOrEqual(30_000);
  },
};

/** A speed under five seconds a pass is slowed to five. */
export const NeverRaces: Story = {
  args: { speed: 1 },
  play: async ({ canvasElement }) => {
    const motion = rowMotion(canvasElement);
    if (!motion) return;
    await expect(
      Number(motion.effect?.getComputedTiming().duration)
    ).toBeGreaterThanOrEqual(5_000);
  },
};

function EffectCards({ effects }: { effects: readonly BlockEffect[] }) {
  const root = useRef<HTMLDivElement>(null);
  useBlockEffects(root);
  return (
    <div ref={root} className="flex flex-col gap-4">
      {effects.map((effect) => (
        <BookingCard
          key={effect}
          title={`Effect: ${effect}`}
          detail="I watch your draft and send notes."
          duration="30 min"
          price="$40"
          href="https://example.com/book"
          effect={effect}
          motion={effect === 'pulse' ? 'rise' : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Small loops on any block: float, pulse and shimmer each play for under five
 * seconds, so they need no pause button; tilt leans towards the mouse.
 */
export const Effects: StoryObj<typeof EffectCards> = {
  render: () => <EffectCards effects={BLOCK_EFFECTS} />,
  play: async ({ canvasElement }) => {
    const cards = [
      ...page(canvasElement).querySelectorAll<HTMLElement>('[data-block]'),
    ];
    await expect(cards.map((card) => card.dataset.effect)).toEqual([
      undefined,
      'float',
      'pulse',
      'shimmer',
      'tilt',
    ]);
    for (const card of cards) {
      for (const motion of card.getAnimations()) {
        // Every loop is over within five seconds (WCAG 2.2.2).
        await expect(
          Number(motion.effect?.getComputedTiming().endTime)
        ).toBeLessThanOrEqual(5_000);
      }
      if (lessMotion()) await expect(card.getAnimations()).toHaveLength(0);
    }
    if (!lessMotion()) {
      // Pulse runs after the block rises into place, not instead of it.
      const pulse = cards[2]!.getAnimations() as CSSAnimation[];
      await expect(pulse.map((a) => a.animationName)).toEqual([
        'levuche-rise',
        'levuche-pulse',
      ]);
    }
  },
};

/** Tilt follows the mouse a little and settles when it leaves. */
export const Tilt: StoryObj<typeof EffectCards> = {
  render: () => <EffectCards effects={['tilt']} />,
  play: async ({ canvasElement }) => {
    const card = page(canvasElement).querySelector<HTMLElement>(
      '[data-effect="tilt"]'
    )!;
    const box = card.getBoundingClientRect();
    card.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerType: 'mouse',
        clientX: box.right - 2,
        clientY: box.top + 2,
      })
    );
    if (lessMotion()) {
      await expect(card.style.getPropertyValue('--tilt-x')).toBe('');
      return;
    }
    await expect(
      parseFloat(card.style.getPropertyValue('--tilt-x'))
    ).toBeGreaterThan(3);
    await expect(
      parseFloat(card.style.getPropertyValue('--tilt-y'))
    ).toBeGreaterThan(3);
    card.dispatchEvent(
      new PointerEvent('pointerout', {
        bubbles: true,
        pointerType: 'mouse',
        relatedTarget: document.body,
      })
    );
    await expect(card.style.getPropertyValue('--tilt-x')).toBe('');
  },
};
