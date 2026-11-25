import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent } from 'storybook/test';
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
