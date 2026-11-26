import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
  AudioPlayer,
  BookingEmbed,
  InstagramPost,
  LinkEmbed,
  LinkList,
  MapCard,
  PlayFrame,
  PreviewMode,
  SpotifyEmbed,
  TikTokVideo,
  YouTubeVideo,
  useBlockActions,
} from '../src';
import { Panel } from '../gallery/gallery';
import { RegistrySamples } from './block-samples';

/*
 * Preview mode, as the page editor (Levuche/app) shows a creator's page:
 * every block looks as it does live, but a click selects the block instead
 * of following it. The page here is the whole gallery, every block in the
 * registry as it looks when just added, and the players from other sites.
 * The page reports presses with useBlockActions, as the app does, and lists
 * how many it got.
 */

const SILENCE =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

/** Players and booking pages from other sites: each a still placeholder. */
function Players() {
  return (
    <>
      <YouTubeVideo
        video="https://www.youtube.com/watch?v=M7lc1UVf-VE"
        title="How tea came to India"
        poster={null}
      />
      <SpotifyEmbed
        url="https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
        title="Tea song"
      />
      <TikTokVideo
        url="https://www.tiktok.com/@chef/video/7212345678901234567"
        title="Folding a samosa in 20 seconds"
      />
      <InstagramPost
        url="https://www.instagram.com/reel/C1a2B3c4D5e/"
        title="The spice market at 6 am"
      />
      <LinkEmbed url="https://vimeo.com/76979871" title="Behind the cookbook" />
      {/* A player that loads by itself on a live page. */}
      <PlayFrame
        src="https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC"
        title="Tea song, loaded at once"
        ratio="audio"
        autoLoad
      />
      <MapCard place="Spice Room, Fort Kochi" lat={9.9658} lng={76.2421} />
      <BookingEmbed
        src="https://example.com/book"
        title="Origin story review"
        display="inline"
      />
      <BookingEmbed src="https://example.com/book" title="A quick call" />
      <AudioPlayer src={SILENCE} title="Monsoon" detail="Asha Menon" />
    </>
  );
}

/** How many still placeholders <Players> draws (the last two have none). */
const PLAYER_PLACEHOLDERS = 8;

/** The page in the editor, with what the app's tracking heard. */
function EditorPreview({ enabled = true }: { enabled?: boolean }) {
  const [reported, setReported] = useState(0);
  useBlockActions(() => setReported((n) => n + 1));
  return (
    <>
      <output aria-label="Reported" className="font-mono text-xs">
        {reported}
      </output>
      <PreviewMode enabled={enabled}>
        <Panel id="preview" title="The gallery" theme={{ scheme: 'light' }} />
        <section
          aria-labelledby="registry-title"
          className="flex flex-col gap-4"
        >
          <h2 id="registry-title" className="m-0 text-xl font-bold">
            Every block, as just added
          </h2>
          <RegistrySamples />
        </section>
        <section
          aria-labelledby="players-title"
          data-testid="players"
          className="flex flex-col gap-4"
        >
          <h2 id="players-title" className="m-0 text-xl font-bold">
            Players and booking pages
          </h2>
          <Players />
        </section>
      </PreviewMode>
    </>
  );
}

const meta = {
  title: 'Editor/Preview mode',
  component: EditorPreview,
} satisfies Meta<typeof EditorPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Records requests to other sites, new windows and beacons until undone. */
function watchRequests(log: string[]) {
  const away = (url: string | URL) =>
    new URL(String(url), location.href).origin !== location.origin;
  const { fetch, open: openWindow } = window;
  const { open } = XMLHttpRequest.prototype;
  const beacon = navigator.sendBeacon;
  window.fetch = (input, init) => {
    const url = input instanceof Request ? input.url : input;
    if (away(url)) {
      log.push(`fetch ${String(url)}`);
      return Promise.reject(new Error('Not in a preview'));
    }
    return fetch(input, init);
  };
  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    ...args: Parameters<XMLHttpRequest['open']>
  ) {
    if (away(args[1])) log.push(`request ${String(args[1])}`);
    return (open as (...a: typeof args) => void).apply(this, args);
  } as XMLHttpRequest['open'];
  navigator.sendBeacon = (url) => {
    log.push(`beacon ${String(url)}`);
    return true;
  };
  window.open = (url) => {
    log.push(`new window ${String(url)}`);
    return null;
  };
  return () => {
    window.fetch = fetch;
    window.open = openWindow;
    XMLHttpRequest.prototype.open = open;
    navigator.sendBeacon = beacon;
  };
}

/** The themed page, and the preview inside it. */
const find = (canvasElement: HTMLElement) => {
  const page = canvasElement.querySelector<HTMLElement>(
    '[data-testid="story-theme"]'
  )!;
  return {
    page,
    preview: page.querySelector<HTMLElement>('[data-preview="on"]')!,
  };
};

/**
 * Every link, button and form on every block is pressed and sent: nothing
 * opens, nothing is sent, tracking hears nothing and no player loads. The
 * blocks are read from the page, so a block added to the gallery or the
 * registry later is pressed too.
 */
export const EveryBlock: Story = {
  play: async ({ canvasElement, canvas }) => {
    const { page, preview } = find(canvasElement);
    const blocks = [...preview.querySelectorAll<HTMLElement>('[data-block]')];
    const kinds = new Set(blocks.map((block) => block.dataset.block));
    await expect(kinds.size).toBeGreaterThan(50);

    const leaks: string[] = [];
    const requests: string[] = [];
    // If preview mode let something through, note it and stop it here, so
    // the test never leaves the page.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href]');
      if (link && !event.defaultPrevented) {
        event.preventDefault();
        leaks.push(`opened ${link.getAttribute('href')}`);
      }
    };
    const onSubmit = (event: Event) => {
      event.preventDefault();
      const block = (event.target as Element).closest('[data-block]');
      leaks.push(`sent a form in ${block?.getAttribute('data-block')}`);
    };
    window.addEventListener('click', onClick);
    window.addEventListener('submit', onSubmit);
    const restore = watchRequests(requests);
    try {
      for (const block of blocks) {
        const controls = block.querySelectorAll<HTMLElement>(
          'a[href], button, input[type="submit"]'
        );
        for (const control of controls) {
          if (control.isConnected) control.click();
        }
        const forms = [
          ...(block.matches('form') ? [block as HTMLFormElement] : []),
          ...block.querySelectorAll('form'),
        ];
        for (const form of forms) {
          if (!form.isConnected) continue;
          // Sent as it is, even with fields left empty.
          form.noValidate = true;
          form.requestSubmit();
        }
      }
      // The keyboard too: Enter on a link doesn't follow it.
      const link = preview.querySelector<HTMLAnchorElement>('a[href]')!;
      link.focus();
      await expect(link).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await new Promise((done) => setTimeout(done, 100));

      await expect(leaks).toEqual([]);
      await expect(requests).toEqual([]);
      await expect(canvas.getByLabelText('Reported')).toHaveTextContent('0');
      await expect(page.querySelectorAll('iframe')).toHaveLength(0);
      await expect(page.querySelectorAll('dialog[open]')).toHaveLength(0);
    } finally {
      restore();
      window.removeEventListener('click', onClick);
      window.removeEventListener('submit', onSubmit);
    }
  },
};

/**
 * Players from other sites show a still placeholder that can take focus,
 * so the editor can select the block from the keyboard; pressing it loads
 * nothing.
 */
export const StillPlayers: Story = {
  render: () => (
    <PreviewMode>
      <div data-testid="players" className="flex flex-col gap-4">
        <Players />
      </div>
    </PreviewMode>
  ),
  play: async ({ canvasElement }) => {
    const { page } = find(canvasElement);
    const players = page.querySelector<HTMLElement>('[data-testid="players"]')!;
    const stills = [
      ...players.querySelectorAll<HTMLElement>('[data-preview-placeholder]'),
    ];
    await expect(stills).toHaveLength(PLAYER_PLACEHOLDERS);
    for (const still of stills.filter((s) => s.tagName === 'BUTTON')) {
      still.focus();
      await expect(still).toHaveFocus();
      await userEvent.keyboard('{Enter}');
    }
    await expect(players.querySelectorAll('iframe')).toHaveLength(0);
    // The pop-up booking page doesn't open either.
    await userEvent.click(
      players.querySelector<HTMLElement>('[data-action="booking_open"]')!
    );
    await expect(players.querySelectorAll('dialog[open]')).toHaveLength(0);
  },
};

/** A part of the page can opt out with enabled={false}: it works as live. */
export const OptOut: Story = {
  render: () => {
    function Page() {
      const [reported, setReported] = useState(0);
      useBlockActions(() => setReported((n) => n + 1));
      return (
        <>
          <output aria-label="Reported" className="font-mono text-xs">
            {reported}
          </output>
          <PreviewMode>
            <LinkList
              label="In the preview"
              links={[{ label: 'Preview link', href: '#preview-link' }]}
            />
            <PreviewMode enabled={false}>
              <LinkList
                label="Live"
                links={[{ label: 'Live link', href: '#live-link' }]}
              />
            </PreviewMode>
          </PreviewMode>
        </>
      );
    }
    return <Page />;
  },
  play: async ({ canvas, canvasElement }) => {
    const { page } = find(canvasElement);
    // The test stays on this page: a live link is reported but not followed.
    const stay = (event: MouseEvent) => event.preventDefault();
    page.addEventListener('click', stay);
    try {
      await userEvent.click(canvas.getByRole('link', { name: 'Preview link' }));
      await expect(canvas.getByLabelText('Reported')).toHaveTextContent('0');
      await userEvent.click(canvas.getByRole('link', { name: 'Live link' }));
      await waitFor(() =>
        expect(canvas.getByLabelText('Reported')).toHaveTextContent('1')
      );
    } finally {
      page.removeEventListener('click', stay);
    }
  },
};
