import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { ReelGrid, YouTubeVideo } from '../src';

const meta = {
  title: 'Blocks/Media',
  component: YouTubeVideo,
  tags: ['autodocs'],
  args: {
    video: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    title: 'How tea came to India',
    // No poster, so the story never loads anything from YouTube on its own.
    poster: null,
  },
} satisfies Meta<typeof YouTubeVideo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing from YouTube loads until the visitor presses play. */
export const Video: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Play: How tea came to India' })
    );
    await waitFor(() =>
      expect(canvasElement.querySelector('iframe')).not.toBeNull()
    );
    const frame = canvasElement.querySelector('iframe');
    await expect(frame).toHaveAttribute('title', 'How tea came to India');
    await expect(frame?.getAttribute('src')).toMatch(
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/M7lc1UVf-VE\?/
    );
  },
};

/** A Short, shown tall. */
export const Vertical: Story = {
  args: {
    video: 'https://www.youtube.com/shorts/M7lc1UVf-VE',
    title: 'Tea in 30 seconds',
    vertical: true,
  },
};

export const Reels: StoryObj<typeof ReelGrid> = {
  render: () => <ReelGrid reels={[{}, {}, {}]} />,
};
