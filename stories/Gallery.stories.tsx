import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { BentoGallery, ImageCarousel, SiteImage, VideoTile } from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/** A plain picture in one colour with a word on it, for the stories. */
const picture = (fill: string, word: string, w = 320, h = 320) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${fill}"/><text x="${w / 2}" y="${h / 2}" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#fff">${word}</text></svg>`
  )}`;

/** A clip the stories never download: each has a cover, so nothing preloads. */
const CLIP = '/videos/pouring-chai.mp4';

const ITEMS = [
  {
    src: picture('#9a3412', 'Chai'),
    alt: 'Chai on a clay stove',
    span: '2x2' as const,
    caption: 'Morning chai',
    href: 'https://example.com/chai',
  },
  {
    video: CLIP,
    src: picture('#0f766e', 'Clip', 180, 320),
    alt: 'Pouring chai from a height',
    span: '1x2' as const,
    caption: 'The pour',
  },
  {
    src: picture('#1e1b4b', 'Assam'),
    alt: 'Tea leaves drying in Assam',
    span: '2x1' as const,
    caption: 'Assam',
  },
  { src: picture('#854d0e', 'Kochi'), alt: 'A spice market in Kochi' },
];

/*
 * The stories have no real clip, so playing is stood in for: play() starts
 * at once and pause() does nothing. Every press still goes through the block.
 */
const fakePlayback = () => {
  const { play, pause } = HTMLMediaElement.prototype;
  HTMLMediaElement.prototype.play = () => Promise.resolve();
  HTMLMediaElement.prototype.pause = () => undefined;
  return () => {
    HTMLMediaElement.prototype.play = play;
    HTMLMediaElement.prototype.pause = pause;
  };
};

const lessMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const meta = {
  title: 'Blocks/Gallery',
  component: BentoGallery,
  tags: ['autodocs'],
  args: { items: ITEMS },
  beforeEach: fakePlayback,
} satisfies Meta<typeof BentoGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

const gridOf = (canvasElement: HTMLElement) => {
  const grid = canvasElement.querySelector<HTMLElement>(
    '[data-block="bento-gallery"] ul'
  );
  if (!grid) throw new Error('No gallery');
  return grid;
};

const columnsOf = (grid: HTMLElement) =>
  getComputedStyle(grid).gridTemplateColumns.split(' ').length;

const inside = (inner: Element, outer: Element) => {
  const a = inner.getBoundingClientRect();
  const b = outer.getBoundingClientRect();
  return (
    a.left >= b.left - 1 &&
    a.right <= b.right + 1 &&
    a.top >= b.top - 1 &&
    a.bottom <= b.bottom + 1
  );
};

/*
 * Three columns on a desktop. Cells are square, a 2x2 tile is a big square,
 * a 1x2 video is twice as tall as it is wide, and captions sit on the tiles.
 */
export const Desktop: Story = {
  globals: onScreen('desktop'),
  play: async ({ canvas, canvasElement }) => {
    const grid = gridOf(canvasElement);
    await expect(columnsOf(grid)).toBe(3);
    const [big, tall, wide, small] = [...grid.children] as HTMLElement[];
    if (!big || !tall || !wide || !small) throw new Error('Missing tiles');
    const cell = small.getBoundingClientRect();
    await expect(Math.abs(cell.width - cell.height)).toBeLessThan(1.5);
    const bigBox = big.getBoundingClientRect();
    await expect(Math.abs(bigBox.width - bigBox.height)).toBeLessThan(1.5);
    await expect(bigBox.width).toBeGreaterThan(cell.width * 2);
    const tallBox = tall.getBoundingClientRect();
    await expect(tallBox.height).toBeGreaterThan(tallBox.width * 2);
    const wideBox = wide.getBoundingClientRect();
    await expect(wideBox.width).toBeGreaterThan(wideBox.height * 2);
    // The chip caption sits on its picture, and the link still works.
    const link = canvas.getByRole('link', { name: 'Chai on a clay stove' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(inside(canvas.getByText('Morning chai'), link)).toBe(true);
  },
};

/** A tablet with four columns. */
export const Tablet: Story = {
  globals: onScreen('tablet'),
  args: { columns: 4, captionStyle: 'bar' },
  play: async ({ canvasElement }) => {
    await expect(columnsOf(gridOf(canvasElement))).toBe(4);
  },
};

/** Two columns on a phone, whatever `columns` says, and nothing spills. */
export const Phone: Story = {
  globals: onScreen('phone'),
  args: { columns: 4 },
  play: async ({ canvasElement }) => {
    const grid = gridOf(canvasElement);
    await expect(columnsOf(grid)).toBe(2);
    const box = grid.getBoundingClientRect();
    for (const tile of grid.children) {
      const rect = tile.getBoundingClientRect();
      await expect(rect.right).toBeLessThanOrEqual(box.right + 1);
    }
    const root = document.documentElement;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
  },
};

/** A video tile shows its cover and plays with sound only when pressed. */
export const VideoInTheGallery: Story = {
  play: async ({ canvas, canvasElement }) => {
    const video = canvasElement.querySelector('video');
    if (!video) throw new Error('No video');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).not.toHaveAttribute('controls');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Play Pouring chai from a height' })
    );
    await expect(video).toHaveAttribute('controls');
    await expect(video.muted).toBe(false);
    // The caption over the video steps aside for the player's own controls.
    await expect(canvas.queryByText('The pour')).toBeNull();
  },
};

/** Captions under the tiles, and a gallery with a title. */
export const CaptionsBelow: Story = {
  args: { title: 'From the road', captionStyle: 'below' },
  play: async ({ canvas }) => {
    const caption = canvas.getByText('Assam');
    const image = canvas.getByRole('img', {
      name: 'Tea leaves drying in Assam',
    });
    await expect(caption.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      image.getBoundingClientRect().bottom
    );
  },
};

/** An address that could run code makes a picture tile, not a video. */
export const UnsafeVideo: Story = {
  args: {
    items: [
      {
        video: 'javascript:alert(1)',
        src: picture('#0f766e', 'Clip'),
        alt: 'A clip',
      },
    ],
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('video')).toBeNull();
    await expect(canvas.getByRole('img', { name: 'A clip' })).toBeVisible();
  },
};

/*
 * A video on its own. Pressing play brings up the browser's own player,
 * with sound, and moves focus to it.
 */
export const Video: StoryObj<typeof VideoTile> = {
  render: () => (
    <VideoTile
      src={CLIP}
      title="Pouring chai"
      poster={picture('#0f766e', 'Chai', 320, 180)}
      caption="How I pour it"
      transcriptHref="/pouring-chai-words"
      tracks={[
        { src: '/videos/pouring-chai.en.vtt', lang: 'en', label: 'English' },
        { src: 'javascript:alert(1)', lang: 'hi', label: 'Hindi' },
      ]}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const video = canvasElement.querySelector('video');
    if (!video) throw new Error('No video');
    // Captions: only the safe file, as captions, in English.
    const tracks = video.querySelectorAll('track');
    await expect(tracks).toHaveLength(1);
    await expect(tracks[0]).toHaveAttribute('kind', 'captions');
    await expect(tracks[0]).toHaveAttribute('srclang', 'en');
    await expect(
      canvas.getByRole('link', { name: 'Transcript' })
    ).toBeVisible();
    const play = canvas.getByRole('button', { name: 'Play Pouring chai' });
    await expectTapSize(play, 'play');
    await userEvent.click(play);
    await expect(video).toHaveAttribute('controls');
    await expect(video).toHaveFocus();
    await expect(canvas.getByText('How I pour it')).toBeVisible();
  },
};

/*
 * A tall phone video that loops without sound while on the screen, with
 * buttons to pause it and to play it with sound. For visitors who ask for
 * less motion it stays still, with the play button.
 */
export const LoopingTallVideo: StoryObj<typeof VideoTile> = {
  render: () => (
    <VideoTile
      src={CLIP}
      title="Pouring chai"
      poster={picture('#0f766e', 'Chai', 180, 320)}
      ratio="tall"
      loop
      caption="The pour"
      captionStyle="chip"
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const video = canvasElement.querySelector('video');
    const frame = video?.parentElement;
    if (!video || !frame) throw new Error('No video');
    const box = frame.getBoundingClientRect();
    await expect(Math.abs(box.height - (box.width * 16) / 9)).toBeLessThan(2);
    // Never autoplays through the HTML: the block starts it, without sound.
    await expect(video).not.toHaveAttribute('autoplay');
    if (lessMotion()) {
      await expect(frame).toHaveAttribute('data-video-mode', 'still');
      await expect(
        canvas.getByRole('button', { name: 'Play Pouring chai' })
      ).toBeVisible();
      return;
    }
    await waitFor(() =>
      expect(frame).toHaveAttribute('data-video-mode', 'loop')
    );
    await expect(video.muted).toBe(true);
    const pause = canvas.getByRole('button', { name: 'Pause Pouring chai' });
    await expectTapSize(pause, 'pause');
    await userEvent.click(pause);
    await expect(
      canvas.getByRole('button', { name: 'Play Pouring chai' })
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Play Pouring chai with sound' })
    );
    await expect(video).toHaveAttribute('controls');
    await expect(video.muted).toBe(false);
  },
};

/** With no cover, the video's first frame is the cover. */
export const VideoFirstFrame: StoryObj<typeof VideoTile> = {
  render: () => <VideoTile src={CLIP} title="Pouring chai" ratio="square" />,
  play: async ({ canvasElement }) => {
    const video = canvasElement.querySelector('video');
    await expect(video).toHaveAttribute('preload', 'metadata');
    await expect(video?.getAttribute('src')).toBe(`${CLIP}#t=0.1`);
    await expect(video).not.toHaveAttribute('poster');
  },
};

/** A caption on a frosted bar over the bottom of the picture. */
export const CaptionBar: StoryObj<typeof SiteImage> = {
  render: () => (
    <SiteImage
      src={picture('#9a3412', 'Chai', 320, 180)}
      alt="Chai on a clay stove"
      ratio="video"
      caption="Morning chai in Kochi"
      captionStyle="bar"
      href="https://example.com/chai"
    />
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Chai on a clay stove' });
    const caption = canvas.getByText('Morning chai in Kochi');
    await expect(inside(caption, link)).toBe(true);
    await expect(
      Math.abs(
        caption.getBoundingClientRect().bottom -
          link.getBoundingClientRect().bottom
      )
    ).toBeLessThan(1.5);
    // Clicks go through the caption to the link.
    await expect(getComputedStyle(caption).pointerEvents).toBe('none');
  },
};

/** A caption on a small label in the picture's corner. */
export const CaptionChip: StoryObj<typeof SiteImage> = {
  render: () => (
    <SiteImage
      src={picture('#9a3412', 'Chai', 320, 180)}
      alt="Chai on a clay stove"
      ratio="video"
      caption="Kochi"
      captionStyle="chip"
    />
  ),
  play: async ({ canvas }) => {
    const image = canvas.getByRole('img', { name: 'Chai on a clay stove' });
    const caption = canvas.getByText('Kochi');
    await expect(inside(caption, image)).toBe(true);
    await expect(caption.getBoundingClientRect().width).toBeLessThan(
      image.getBoundingClientRect().width / 2
    );
  },
};

/** The carousel's "1/3" follows the slide; screen readers hear the slide. */
export const CarouselCounter: StoryObj<typeof ImageCarousel> = {
  render: () => (
    <ImageCarousel
      counter
      slides={[
        { src: picture('#9a3412', 'Kochi', 320, 180), alt: 'Kochi' },
        { src: picture('#0f766e', 'Assam', 320, 180), alt: 'Assam' },
        { src: picture('#1e1b4b', 'Darjeeling', 320, 180), alt: 'Darjeeling' },
      ]}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const counter = canvasElement.querySelector('[data-carousel-counter]');
    await expect(counter).toHaveTextContent('1/3');
    await expect(counter).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
    await expect(counter).toHaveTextContent('2/3');
  },
};
