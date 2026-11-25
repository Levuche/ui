import { isSafeMediaSrc } from '../src/system/href';
import { expect, test } from '@playwright/test';
import { youtubeId } from '../src';
import {
  embedFor,
  instagramEmbed,
  loomEmbed,
  soundcloudEmbed,
  spotifyEmbed,
  tiktokEmbed,
  vimeoEmbed,
} from '../src/system/embeds';

/* Pasted links become players only for the right host, and only by id. */

test('each service reads its own links', () => {
  expect(
    spotifyEmbed(
      'https://open.spotify.com/intl-de/track/4uLU6hMCjMI75M1A2tKUQC?si=x'
    )
  ).toEqual({
    service: 'spotify',
    src: 'https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC',
    shape: 'audio',
  });
  expect(
    spotifyEmbed('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')
      ?.shape
  ).toBe('tall');
  expect(
    tiktokEmbed('https://www.tiktok.com/@chef/video/7212345678901234567')?.src
  ).toBe('https://www.tiktok.com/player/v1/7212345678901234567');
  expect(
    instagramEmbed('https://www.instagram.com/reel/C1a2B3c4D5e/')?.src
  ).toBe('https://www.instagram.com/reel/C1a2B3c4D5e/embed');
  expect(vimeoEmbed('https://vimeo.com/76979871')?.src).toBe(
    'https://player.vimeo.com/video/76979871?dnt=1'
  );
  expect(soundcloudEmbed('https://soundcloud.com/artist/a-song')?.src).toBe(
    'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fartist%2Fa-song&visual=false'
  );
  expect(
    loomEmbed('https://www.loom.com/share/0123456789abcdef0123456789abcdef')
      ?.src
  ).toBe('https://www.loom.com/embed/0123456789abcdef0123456789abcdef');
});

test('look-alike hosts and odd ids are refused', () => {
  expect(
    spotifyEmbed(
      'https://open.spotify.com.evil.test/track/4uLU6hMCjMI75M1A2tKUQC'
    )
  ).toBeNull();
  expect(spotifyEmbed('https://open.spotify.com/track/../../evil')).toBeNull();
  expect(
    tiktokEmbed('https://tiktok.com.evil.test/@a/video/7212345678901234567')
  ).toBeNull();
  expect(instagramEmbed('https://instagram.com/p/<script>')).toBeNull();
  expect(vimeoEmbed('javascript:alert(1)//vimeo.com/123456')).toBeNull();
  // A showcase's or album's number is the collection's, not a video's.
  expect(vimeoEmbed('https://vimeo.com/showcase/1234567')).toBeNull();
  expect(vimeoEmbed('https://vimeo.com/album/1234567')).toBeNull();
  expect(
    vimeoEmbed('https://vimeo.com/showcase/1234567/video/76979871')?.src
  ).toBe('https://player.vimeo.com/video/76979871?dnt=1');
  expect(loomEmbed('https://loom.com/share/not-an-id')).toBeNull();
});

test('embedFor plays listed services and leaves the rest as links', () => {
  expect(embedFor('https://youtu.be/dQw4w9WgXcQ', { youtubeId })?.service).toBe(
    'youtube'
  );
  expect(embedFor('https://vimeo.com/76979871')?.service).toBe('vimeo');
  expect(embedFor('https://example.com/video')).toBeNull();
  expect(
    embedFor('https://vimeo.com/76979871', { services: ['spotify'] })
  ).toBeNull();
});

test('audio takes a link or a local clip, nothing else', () => {
  expect(isSafeMediaSrc('https://example.com/a.mp3')).toBe(true);
  expect(isSafeMediaSrc('/media/a.mp3')).toBe(true);
  expect(isSafeMediaSrc('blob:https://example.com/1234')).toBe(true);
  expect(isSafeMediaSrc('data:audio/wav;base64,AAAA')).toBe(true);
  expect(isSafeMediaSrc('data:text/html;base64,AAAA')).toBe(false);
  expect(isSafeMediaSrc('data:video/mp4;base64,AAAA')).toBe(false);
  expect(isSafeMediaSrc('data:video/mp4;base64,AAAA', 'video')).toBe(true);
  expect(isSafeMediaSrc('javascript:alert(1)')).toBe(false);
  expect(isSafeMediaSrc('mailto:a@example.com')).toBe(false);
});
