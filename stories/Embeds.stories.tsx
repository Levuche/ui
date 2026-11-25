import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent } from 'storybook/test';
import {
  AudioPlayer,
  InstagramPost,
  LinkEmbed,
  PodcastEpisodes,
  SpotifyEmbed,
  TikTokVideo,
} from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/** A second of silence, so the audio stories never reach the network. */
const SILENCE =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

const meta = {
  title: 'Blocks/Embeds',
  component: SpotifyEmbed,
  tags: ['autodocs'],
  args: {
    url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
    title: 'Chai at dawn',
  },
} satisfies Meta<typeof SpotifyEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A track: a play button until pressed, then Spotify's player. */
export const Spotify: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    const play = canvas.getByRole('button', { name: 'Play: Chai at dawn' });
    await expect(play).toHaveAttribute('data-action', 'play_spotify');
  },
};

/** A link Spotify can't play shows as a plain link. */
export const NotSpotify: Story = {
  args: { url: 'https://example.com/chai', title: 'Chai at dawn' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: /Chai at dawn/ })
    ).toHaveAttribute('href', 'https://example.com/chai');
  },
};

/** A TikTok video, tall, on a phone. */
export const TikTok: StoryObj<typeof TikTokVideo> = {
  globals: onScreen('phone'),
  render: () => (
    <TikTokVideo
      url="https://www.tiktok.com/@chef/video/7212345678901234567"
      title="Folding a samosa in 20 seconds"
      showTitle
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Folding a samosa in 20 seconds' })
    ).toBeVisible();
    await expectTapSize(
      canvas.getByRole('button', { name: /Play: Folding/ }),
      'Play'
    );
  },
};

/** An Instagram reel. */
export const Instagram: StoryObj<typeof InstagramPost> = {
  render: () => (
    <InstagramPost
      url="https://www.instagram.com/reel/C1a2B3c4D5e/"
      title="The spice market at 6 am"
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /Play: The spice market/ })
    ).toHaveAttribute('data-action', 'play_instagram');
  },
};

/** Any listed service plays; this one is a Vimeo link, on a tablet. */
export const AnyLink: StoryObj<typeof LinkEmbed> = {
  globals: onScreen('tablet'),
  render: () => (
    <LinkEmbed url="https://vimeo.com/76979871" title="Behind the cookbook" />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-block="link-embed"]')
    ).toHaveAttribute('data-service', 'vimeo');
  },
};

/** One track with its own controls. */
export const Audio: StoryObj<typeof AudioPlayer> = {
  globals: onScreen('desktop'),
  render: () => (
    <AudioPlayer
      heading="My new single"
      src={SILENCE}
      title="Monsoon"
      detail="Asha Menon"
      transcriptHref="https://example.com/lyrics"
    />
  ),
  play: async ({ canvas }) => {
    const play = canvas.getByRole('button', { name: 'Play Monsoon' });
    await expectTapSize(play, 'Play');
    await expect(
      canvas.getByRole('slider', { name: 'Position' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'Transcript' })
    ).toBeVisible();
    await userEvent.click(play);
    // The silent clip ends at once; the button names the next press.
    fireEvent.ended(play.parentElement!.querySelector('audio')!);
    await expect(
      canvas.getByRole('button', { name: 'Play Monsoon' })
    ).toBeVisible();
  },
};

/** The newest episodes, from data the app reads from the feed. */
export const Podcast: StoryObj<typeof PodcastEpisodes> = {
  render: () => (
    <PodcastEpisodes
      title="Origins, the podcast"
      allHref="https://example.com/podcast"
      data={[
        {
          title: 'Where chai came from',
          audioUrl: `${SILENCE}#1`,
          detail: '12 Nov 2026 · 42 min',
        },
        {
          title: 'The first samosa',
          audioUrl: `${SILENCE}#2`,
          detail: '5 Nov 2026 · 38 min',
        },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(
      canvas.getByRole('button', { name: 'Play Where chai came from' })
    ).toBeVisible();
  },
};

/** While the feed loads. */
export const PodcastLoading: StoryObj<typeof PodcastEpisodes> = {
  render: () => <PodcastEpisodes title="Origins, the podcast" loading />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible();
  },
};
