import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  AudioPlayer,
  BookingEmbed,
  LinkEmbed,
  MapCard,
  OUTSIDE_SERVICES,
  SpotifyEmbed,
  YouTubeVideo,
  blockInfo,
} from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/*
 * Blocks that load another site, held back until a visitor agrees. The app
 * passes `consent={false}` until its cookie notice has a yes; each block then
 * says what loading will share, and loads only on the visitor's press.
 */

const meta = {
  title: 'Blocks/Privacy',
  component: YouTubeVideo,
  tags: ['autodocs'],
  args: {
    video: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    title: 'How tea came to India',
    consent: false,
  },
} satisfies Meta<typeof YouTubeVideo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The host of a frame's address. */
const hostOf = (frame: Element | null) =>
  new URL(frame?.getAttribute('src') ?? '').hostname;

/**
 * A YouTube video before the visitor agrees: no YouTube picture, a line on
 * what loading shares, and a Load button that loads the player and moves
 * focus into it.
 */
export const VideoBeforeConsent: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    // YouTube's own picture would reach YouTube before the visitor agrees.
    await expect(canvasElement.querySelector('img')).toBeNull();
    const notice =
      'This loads from YouTube, which will see your IP address and may set cookies.';
    await expect(canvas.getByText(notice)).toBeVisible();
    const load = canvas.getByRole('button', {
      name: 'Load: How tea came to India',
    });
    await expect(load).toHaveAccessibleDescription(notice);
    await expectTapSize(load, 'Load');
    await userEvent.click(load);
    await waitFor(() =>
      expect(canvasElement.querySelector('iframe')).not.toBeNull()
    );
    const frame = canvasElement.querySelector('iframe');
    await expect(frame).toHaveFocus();
    // It loads only from a host its privacy note lists.
    await expect(blockInfo('youtube-video')?.privacy.services).toContain(
      'youtube'
    );
    await expect(OUTSIDE_SERVICES.youtube.hosts).toContain(hostOf(frame));
  },
};

/** Once the visitor has agreed, the player is a play button as usual. */
export const VideoAfterConsent: Story = {
  args: { consent: true, poster: null },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('[data-consent]')).toBeNull();
    await expect(
      canvas.getByRole('button', { name: 'Play video: How tea came to India' })
    ).toBeVisible();
  },
};

/** A map, on a phone: the creator's own picture stays, the map waits. */
export const MapBeforeConsent: StoryObj<typeof MapCard> = {
  globals: onScreen('phone'),
  render: () => (
    <MapCard
      place="Spice Room, Fort Kochi"
      address="12 Princess Street, Fort Kochi, Kerala"
      lat={9.9658}
      lng={76.2421}
      consent={false}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByText(/This loads from OpenStreetMap/)
    ).toBeVisible();
    const load = canvas.getByRole('button', {
      name: 'Load: Map of Spice Room, Fort Kochi',
    });
    await expectTapSize(load, 'Load');
    // Directions are a link, so they work before the map loads.
    await expect(
      canvas.getByRole('link', { name: /Get directions/ })
    ).toBeVisible();
    await userEvent.click(load);
    await waitFor(() =>
      expect(canvasElement.querySelector('iframe')).not.toBeNull()
    );
    await expect(OUTSIDE_SERVICES.openstreetmap.hosts).toContain(
      hostOf(canvasElement.querySelector('iframe'))
    );
  },
};

/** A booking page in the page names the booking site before it loads. */
export const BookingBeforeConsent: StoryObj<typeof BookingEmbed> = {
  globals: onScreen('tablet'),
  render: () => (
    <BookingEmbed
      display="inline"
      height={24}
      title="A 30-minute recipe call"
      src="https://example.com/book"
      consent={false}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('iframe')).toBeNull();
    await expect(
      canvas.getByText(
        'This loads from example.com, which will see your IP address and may set cookies.'
      )
    ).toBeVisible();
    // The plain link works without loading anything.
    await expect(
      canvas.getByRole('link', { name: /Open the booking page/ })
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Load: Booking: A 30-minute recipe call',
      })
    );
    await expect(
      canvas.getByTitle('Booking: A 30-minute recipe call')
    ).toHaveFocus();
  },
};

/** The same in a pop-up: the dialog asks before it loads the page. */
export const BookingPopupBeforeConsent: StoryObj<typeof BookingEmbed> = {
  render: () => (
    <BookingEmbed
      title="A 30-minute recipe call"
      src="https://example.com/book"
      consent={false}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Pick a time' }));
    const dialog = within(
      within(canvasElement.ownerDocument.body).getByRole('dialog')
    );
    await expect(dialog.getByText(/This loads from example.com/)).toBeVisible();
    await expect(
      canvasElement.ownerDocument.querySelector('iframe')
    ).toBeNull();
    await userEvent.click(dialog.getByRole('button', { name: /^Load/ }));
    await expect(
      dialog.getByTitle('Booking: A 30-minute recipe call')
    ).toHaveAttribute('src', 'https://example.com/book');
    await userEvent.click(dialog.getByRole('button', { name: 'Close' }));
  },
};

/** The words come from `consentLabels`, as for a page in German. */
export const OwnWords: StoryObj<typeof LinkEmbed> = {
  render: () => (
    <LinkEmbed
      url="https://vimeo.com/76979871"
      title="Hinter dem Kochbuch"
      consent={false}
      consentLabels={{
        notice:
          'Das lädt Inhalte von {service}; dabei wird deine IP-Adresse übertragen.',
        load: 'Laden',
      }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(
        'Das lädt Inhalte von Vimeo; dabei wird deine IP-Adresse übertragen.'
      )
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Laden: Hinter dem Kochbuch' })
    ).toHaveAttribute('data-action', 'play_vimeo');
  },
};

/** A Spotify player with consent given shows no notice. */
export const SpotifyAfterConsent: StoryObj<typeof SpotifyEmbed> = {
  render: () => (
    <SpotifyEmbed
      url="https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
      title="Chai at dawn"
      consent
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/This loads from/)).toBeNull();
    await expect(
      canvas.getByRole('button', { name: 'Play: Chai at dawn' })
    ).toBeVisible();
  },
};

/**
 * Audio on another site: play is the press that loads it, so the player
 * shows only a line on what playing shares.
 */
export const AudioBeforeConsent: StoryObj<typeof AudioPlayer> = {
  render: () => (
    <AudioPlayer
      src="https://media.example.com/chai-at-dawn.mp3"
      title="Chai at dawn"
      consent={false}
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(
        'This loads from media.example.com, which will see your IP address and may set cookies.'
      )
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Play Chai at dawn' })
    ).toBeVisible();
  },
};
