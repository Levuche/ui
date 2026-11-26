import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import { BeforeAfter, ImageCarousel, LogoStrip, SiteImage } from '../src';
import { expectTapSize } from './expect-tap-size';

/** A plain picture in one colour with a word on it, for the stories. */
const picture = (fill: string, word: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="${fill}"/><text x="160" y="100" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#fff">${word}</text></svg>`
  )}`;

const meta = {
  title: 'Blocks/Pictures',
  component: SiteImage,
  tags: ['autodocs'],
  args: {
    src: picture('#9a3412', 'Chai'),
    alt: 'Chai on a clay stove',
    caption: 'Morning chai in Kochi',
  },
} satisfies Meta<typeof SiteImage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One picture with a caption. */
export const Image: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('img', { name: 'Chai on a clay stove' })
    ).toBeVisible();
    await expect(canvas.getByText('Morning chai in Kochi')).toBeVisible();
  },
};

/** A linked picture opens another site in a new tab. */
export const LinkedImage: Story = {
  args: { href: 'https://example.com/chai', ratio: 'square' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Chai on a clay stove' })
    ).toHaveAttribute('target', '_blank');
  },
};

const SLIDES = [
  {
    src: picture('#9a3412', 'Kochi'),
    alt: 'A spice market in Kochi',
    caption: 'Kochi, where the spice routes began',
  },
  {
    src: picture('#0f766e', 'Assam'),
    alt: 'Tea leaves drying in Assam',
    caption: 'Assam tea gardens',
    button: { label: 'Shop the tea', href: 'https://example.com/tea' },
  },
  {
    src: picture('#1e1b4b', 'Darjeeling'),
    alt: 'Hills above Darjeeling',
  },
];

/*
 * A picture that comes in several sizes: the browser picks one for the
 * screen, its space is kept from its own width and height while it loads,
 * and it waits until it's near the screen.
 */
export const ImageInSizes: Story = {
  args: {
    src: {
      src: picture('#9a3412', 'Chai 800'),
      srcSet: `${picture('#9a3412', 'Chai 400')} 400w, ${picture('#9a3412', 'Chai 800')} 800w`,
      width: 800,
      height: 600,
    },
  },
  play: async ({ canvas }) => {
    const image = canvas.getByRole('img', { name: 'Chai on a clay stove' });
    await expect(image).toHaveAttribute('srcset');
    await expect(image).toHaveAttribute(
      'sizes',
      '(min-width: 768px) 576px, 100vw'
    );
    await expect(image).toHaveAttribute('loading', 'lazy');
    const box = image.getBoundingClientRect();
    await expect(Math.abs(box.height - (box.width * 3) / 4)).toBeLessThan(1);
  },
};

/** The first picture on a page can load at once. */
export const ImageAtTheTop: Story = {
  args: { src: { src: picture('#9a3412', 'Chai'), priority: true } },
  play: async ({ canvas }) => {
    const image = canvas.getByRole('img', { name: 'Chai on a clay stove' });
    await expect(image).toHaveAttribute('loading', 'eager');
    await expect(image).toHaveAttribute('fetchpriority', 'high');
  },
};

/** Arrows, dots and the arrow keys move between slides. */
export const Carousel: StoryObj<typeof ImageCarousel> = {
  render: () => <ImageCarousel title="Where tea comes from" slides={SLIDES} />,
  play: async ({ canvas }) => {
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await expectTapSize(next, 'next');
    await expect(
      canvas.getByRole('button', { name: 'Slide 1 of 3' })
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.click(next);
    await expect(
      canvas.getByRole('button', { name: 'Slide 2 of 3' })
    ).toHaveAttribute('aria-current', 'true');
    await expect(
      canvas.getByRole('link', { name: 'Shop the tea' })
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous slide' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Slide 1 of 3' })
    ).toHaveAttribute('aria-current', 'true');
  },
};

/** An index past the last slide shows the last one, so a slide always shows. */
export const CarouselIndexPastEnd: StoryObj<typeof ImageCarousel> = {
  render: () => <ImageCarousel slides={SLIDES} index={5} />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Slide 3 of 3' })
    ).toHaveAttribute('aria-current', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Previous slide' })
    ).toBeVisible();
  },
};

/** Moves on its own, with a pause button; never with reduced motion. */
export const CarouselAutoplay: StoryObj<typeof ImageCarousel> = {
  render: () => <ImageCarousel slides={SLIDES} autoplay={4} />,
  play: async ({ canvas }) => {
    const pause = canvas.getByRole('button', { name: 'Pause slides' });
    await userEvent.click(pause);
    await expect(
      canvas.getByRole('button', { name: 'Play slides' })
    ).toBeVisible();
  },
};

/** The handle is a slider: drag it, or use the arrow keys. */
export const Compare: StoryObj<typeof BeforeAfter> = {
  render: () => (
    <BeforeAfter
      before={{ src: picture('#6b7280', 'Before'), alt: 'The kitchen before' }}
      after={{ src: picture('#c2410c', 'After'), alt: 'The kitchen after' }}
      caption="Kitchen refresh, two weekends"
    />
  ),
  play: async ({ canvas }) => {
    const slider = canvas.getByRole('slider', {
      name: 'Compare before and after',
    });
    await expect(slider).toHaveValue('50');
    // The arrow keys move a range input in a real browser; the test sets the
    // value the way a key press would, since simulated keys don't move it.
    fireEvent.change(slider, { target: { value: '52' } });
    await expect(slider).toHaveValue('52');
    await expect(slider).toHaveAttribute(
      'aria-valuetext',
      '52% before, 48% after'
    );
  },
};

/*
 * In a right-to-left script the next slide is on the left: the next button
 * sits on the left, the track scrolls left, and the left arrow key goes on.
 */
export const CarouselRightToLeft: StoryObj<typeof ImageCarousel> = {
  globals: { direction: 'rtl' },
  render: () => <ImageCarousel title="Where tea comes from" slides={SLIDES} />,
  play: async ({ canvas, canvasElement }) => {
    const next = canvas.getByRole('button', { name: 'Next slide' });
    const previous = canvas.getByRole('button', { name: 'Previous slide' });
    await expect(next.getBoundingClientRect().right).toBeLessThan(
      previous.getBoundingClientRect().left
    );
    const track = canvasElement.querySelector<HTMLElement>('[id$="-track"]');
    if (!track) throw new Error('No track');
    await userEvent.click(next);
    await expect(
      canvas.getByRole('button', { name: 'Slide 2 of 3' })
    ).toHaveAttribute('aria-current', 'true');
    // The track really moved to the second slide, scrolling to the left.
    await waitFor(() =>
      expect(Math.round(track.scrollLeft)).toBe(-track.clientWidth)
    );
    track.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(
      canvas.getByRole('button', { name: 'Slide 3 of 3' })
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('button', { name: 'Slide 2 of 3' })
    ).toHaveAttribute('aria-current', 'true');
  },
};

/*
 * In a right-to-left script the before picture shows from the right, where
 * the slider starts, so the handle and the picture move together.
 */
export const CompareRightToLeft: StoryObj<typeof BeforeAfter> = {
  globals: { direction: 'rtl' },
  render: () => (
    <BeforeAfter
      before={{ src: picture('#6b7280', 'Before'), alt: 'The kitchen before' }}
      after={{ src: picture('#c2410c', 'After'), alt: 'The kitchen after' }}
      defaultPosition={30}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const slider = canvas.getByRole('slider', {
      name: 'Compare before and after',
    });
    const box = slider.getBoundingClientRect();
    const line = canvasElement.querySelector<HTMLElement>(
      '[style*="inset-inline-start"]'
    );
    if (!line) throw new Error('No dividing line');
    const lineBox = line.getBoundingClientRect();
    const middle = (lineBox.left + lineBox.right) / 2;
    // 30% in from the right-hand edge.
    await expect(Math.abs(middle - (box.right - box.width * 0.3))).toBeLessThan(
      2
    );
    const before = canvas.getByRole('img', { name: 'The kitchen before' });
    const clip = getComputedStyle(before.parentElement as HTMLElement).clipPath;
    // Clipped from the left, so only its right-hand 30% shows.
    await expect(clip).toMatch(/^inset\(0px 0px 0px (calc\()?70%\)?\)$/);
  },
};

const LOGOS = ['Chai Weekly', 'Spice Route', 'The Kettle', 'Leaf & Co'].map(
  (alt) => ({ src: null, alt })
);

/** Logos in a wrapped row. */
export const Logos: StoryObj<typeof LogoStrip> = {
  render: () => <LogoStrip title="As seen in" logos={LOGOS} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Spice Route')).toBeVisible();
  },
};

/** Scrolling logos pause on hover; screen readers hear each one once. */
export const LogosScrolling: StoryObj<typeof LogoStrip> = {
  render: () => <LogoStrip title="As seen in" logos={LOGOS} mode="scroll" />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getAllByRole('listitem', { hidden: false })
    ).toHaveLength(4);
  },
};

/** The scrolling row's own motion, or none when nothing moves. */
const logoMotion = (root: HTMLElement) =>
  root
    .querySelector<HTMLElement>('[data-block="logo-strip"] ul')
    ?.getAnimations()[0];

/**
 * Logos that keep moving have a pause button, as WCAG 2.2.2 asks; it stops
 * them and moves them again. Nothing moves for visitors who ask for less
 * motion, so they get no button.
 */
export const LogosPauseButton: StoryObj<typeof LogoStrip> = {
  render: () => <LogoStrip title="As seen in" logos={LOGOS} mode="scroll" />,
  play: async ({ canvas, canvasElement }) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(canvas.queryByRole('button')).toBeNull();
      return;
    }
    const pause = canvas.getByRole('button', {
      name: 'Stop the moving logos',
    });
    await expectTapSize(pause, 'pause button');
    await expect(logoMotion(canvasElement)?.playState).toBe('running');
    await userEvent.click(pause);
    await waitFor(() =>
      expect(logoMotion(canvasElement)?.playState).toBe('paused')
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Move the logos again' })
    );
    await waitFor(() =>
      expect(logoMotion(canvasElement)?.playState).toBe('running')
    );
  },
};

/** A still row has nothing to pause. */
export const LogosStillHaveNoButton: StoryObj<typeof LogoStrip> = {
  render: () => <LogoStrip title="As seen in" logos={LOGOS} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(logoMotion(canvasElement)).toBeUndefined();
  },
};

/*
 * In a right-to-left script the row starts at the right-hand edge and moves
 * to the right, by half its length each pass, so the second copy takes the
 * first one's place and the loop has no seam.
 */
export const LogosScrollingRightToLeft: StoryObj<typeof LogoStrip> = {
  globals: { direction: 'rtl' },
  render: () => <LogoStrip title="As seen in" logos={LOGOS} mode="scroll" />,
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector<HTMLElement>('ul');
    const strip = list?.parentElement;
    if (!list || !strip) throw new Error('No scrolling row');
    const [motion] = list.getAnimations();
    // With less motion asked for, the row doesn't move at all.
    if (!motion) return;
    motion.pause();
    const length = Number(motion.effect?.getComputedTiming().duration ?? 0);
    motion.currentTime = 0;
    const start = list.getBoundingClientRect();
    await expect(
      Math.abs(start.right - strip.getBoundingClientRect().right)
    ).toBeLessThan(1);
    motion.currentTime = length / 2;
    const middle = list.getBoundingClientRect();
    await expect(
      Math.abs(middle.left - start.left - start.width / 4)
    ).toBeLessThan(1);
  },
};
