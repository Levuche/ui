import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent } from 'storybook/test';
import {
  AppleMusicEmbed,
  AudioPlayer,
  DeezerEmbed,
  InstagramPost,
  LinkEmbed,
  PodcastEpisodes,
  SoundCloudEmbed,
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

/** The height of a block's player, in pixels. */
const playerHeight = (canvasElement: HTMLElement, name: RegExp) =>
  [...canvasElement.querySelectorAll('button')]
    .find((button) => name.test(button.getAttribute('aria-label') ?? ''))
    ?.getBoundingClientRect().height ?? 0;

/**
 * A SoundCloud track in the slim player. When play is pressed it takes the
 * colour of the page's buttons.
 */
export const SoundCloud: StoryObj<typeof SoundCloudEmbed> = {
  render: () => (
    <SoundCloudEmbed
      url="https://soundcloud.com/desi-origins/chai-at-dawn"
      title="Chai at dawn"
      showTitle
      detail="Asha Menon"
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    const play = canvas.getByRole('button', { name: 'Play: Chai at dawn' });
    await expect(play).toHaveAttribute('data-action', 'play_soundcloud');
    await expectTapSize(play, 'Play');
    await expect(
      canvasElement.querySelector('[data-block="soundcloud-embed"]')
    ).toHaveAttribute('data-service', 'soundcloud');
    await expect(
      canvas.getByRole('heading', { name: 'Chai at dawn' })
    ).toBeVisible();
  },
};

/** The player with big artwork, on a phone: taller than the slim one. */
export const SoundCloudArtwork: StoryObj<typeof SoundCloudEmbed> = {
  globals: onScreen('phone'),
  render: () => (
    <div className="flex flex-col gap-4">
      <SoundCloudEmbed
        url="https://soundcloud.com/desi-origins/chai-at-dawn"
        title="Chai at dawn"
        player="visual"
      />
      <SoundCloudEmbed
        url="https://soundcloud.com/desi-origins/monsoon"
        title="Monsoon"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const big = playerHeight(canvasElement, /Chai at dawn/);
    const slim = playerHeight(canvasElement, /Monsoon/);
    await expect(slim).toBeGreaterThanOrEqual(44);
    await expect(big).toBeGreaterThan(slim);
  },
};

/** An Apple Music album, then one song of it. */
export const AppleMusic: StoryObj<typeof AppleMusicEmbed> = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AppleMusicEmbed
        url="https://music.apple.com/us/album/monsoon-songs/1440857781"
        title="Monsoon songs"
      />
      <AppleMusicEmbed
        url="https://music.apple.com/us/album/monsoon-songs/1440857781?i=1440857786"
        title="Chai at dawn"
      />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    await expect(
      canvas.getByRole('button', { name: 'Play: Monsoon songs' })
    ).toHaveAttribute('data-action', 'play_applemusic');
    await expect(playerHeight(canvasElement, /Monsoon songs/)).toBeGreaterThan(
      playerHeight(canvasElement, /Chai at dawn/)
    );
  },
};

/** A Deezer playlist, with the creator's own words on the button, on a tablet. */
export const Deezer: StoryObj<typeof DeezerEmbed> = {
  globals: onScreen('tablet'),
  render: () => (
    <DeezerEmbed
      url="https://www.deezer.com/en/playlist/908622995"
      title="Morning chai"
      labels={{ play: 'Listen: {title}' }}
    />
  ),
  play: async ({ canvas }) => {
    const play = canvas.getByRole('button', { name: 'Listen: Morning chai' });
    await expect(play).toHaveAttribute('data-action', 'play_deezer');
    await expectTapSize(play, 'Play');
  },
};

/** A music link the block can't play shows as a plain link. */
export const NotMusic: StoryObj<typeof DeezerEmbed> = {
  render: () => (
    <DeezerEmbed url="https://example.com/playlist" title="Morning chai" />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('link', { name: /Morning chai/ })
    ).toHaveAttribute('href', 'https://example.com/playlist');
    await expect(canvasElement.querySelector('button')).toBeNull();
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
