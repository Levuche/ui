import { isSafeMediaSrc } from '../src/system/href';
import { expect, test } from '@playwright/test';
import { youtubeId } from '../src';
import { colorHex } from '../src/system/contrast';
import {
  appleMusicEmbed,
  deezerEmbed,
  embedFor,
  instagramEmbed,
  loomEmbed,
  soundcloudEmbed,
  spotifyEmbed,
  tiktokEmbed,
  tintedSrc,
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

test('SoundCloud plays compact or with artwork, and takes a colour', () => {
  const page = 'https%3A%2F%2Fsoundcloud.com%2Fartist%2Fa-song';
  expect(soundcloudEmbed('https://soundcloud.com/artist/a-song')).toEqual({
    service: 'soundcloud',
    src: `https://w.soundcloud.com/player/?url=${page}&visual=false`,
    shape: 'track',
    tint: 'color',
  });
  expect(
    soundcloudEmbed('https://soundcloud.com/artist/a-song', { visual: true })
  ).toMatchObject({
    src: `https://w.soundcloud.com/player/?url=${page}&visual=true`,
    shape: 'tall',
  });
  expect(
    soundcloudEmbed('https://soundcloud.com/artist/sets/summer')?.shape
  ).toBe('tall');
  expect(
    soundcloudEmbed('https://soundcloud.com.evil.test/artist/a-song')
  ).toBeNull();
  expect(soundcloudEmbed('https://soundcloud.com/artist/a%22song')).toBeNull();
});

test('Apple Music plays songs, albums and playlists by id', () => {
  expect(
    appleMusicEmbed(
      'https://music.apple.com/us/album/chai-at-dawn/1440857781?i=1440857786'
    )
  ).toEqual({
    service: 'applemusic',
    src: 'https://embed.music.apple.com/us/album/chai-at-dawn/1440857781?i=1440857786',
    shape: 'track',
  });
  expect(
    appleMusicEmbed('https://music.apple.com/us/album/chai-at-dawn/1440857781')
  ).toMatchObject({
    src: 'https://embed.music.apple.com/us/album/chai-at-dawn/1440857781',
    shape: 'tall',
  });
  expect(
    appleMusicEmbed('https://music.apple.com/in/song/monsoon/1440857786')?.shape
  ).toBe('track');
  expect(
    appleMusicEmbed(
      'https://music.apple.com/us/playlist/morning-chai/pl.u-8aAVZAjsXJ6X0v'
    )?.src
  ).toBe(
    'https://embed.music.apple.com/us/playlist/morning-chai/pl.u-8aAVZAjsXJ6X0v'
  );
  // A name in another script is left out; the id is enough.
  expect(
    appleMusicEmbed(
      'https://music.apple.com/jp/album/%E3%81%8A%E8%8C%B6/1440857781'
    )?.src
  ).toBe('https://embed.music.apple.com/jp/album/1440857781');
  expect(
    appleMusicEmbed('https://music.apple.com.evil.test/us/album/a/1440857781')
  ).toBeNull();
  expect(
    appleMusicEmbed('https://music.apple.com/us/artist/someone/1440857781')
  ).toBeNull();
  expect(
    appleMusicEmbed('https://music.apple.com/us/album/a/1440857781?i=x"y')
  ).toBeNull();
  expect(
    appleMusicEmbed('https://music.apple.com/us/album/a/../evil')
  ).toBeNull();
});

test('Deezer plays tracks, albums and playlists by id', () => {
  expect(deezerEmbed('https://www.deezer.com/en/track/3135556')).toEqual({
    service: 'deezer',
    src: 'https://widget.deezer.com/widget/auto/track/3135556',
    shape: 'track',
  });
  expect(deezerEmbed('https://www.deezer.com/album/302127')).toMatchObject({
    src: 'https://widget.deezer.com/widget/auto/album/302127',
    shape: 'tall',
  });
  expect(
    deezerEmbed('https://www.deezer.com/pt-br/playlist/908622995')?.src
  ).toBe('https://widget.deezer.com/widget/auto/playlist/908622995');
  expect(deezerEmbed('https://deezer.com.evil.test/track/3135556')).toBeNull();
  expect(deezerEmbed('https://www.deezer.com/en/artist/27')).toBeNull();
  expect(deezerEmbed('https://www.deezer.com/en/track/abc')).toBeNull();
  expect(deezerEmbed('https://www.deezer.com/en/track/31/extra')).toBeNull();
});

test('a player takes the page’s colour as hex, and only a plain colour', () => {
  const src = 'https://w.soundcloud.com/player/?url=x&visual=false';
  expect(
    new URL(tintedSrc(src, 'color', '#C2410C')).searchParams.get('color')
  ).toBe('#c2410c');
  expect(
    new URL(tintedSrc(src, 'color', 'rgb(15, 118, 110)')).searchParams.get(
      'color'
    )
  ).toBe('#0f766e');
  expect(tintedSrc(src, 'color', 'red; background: url(x)')).toBe(src);
  expect(tintedSrc(src, 'color', null)).toBe(src);
  expect(tintedSrc(src, undefined, '#c2410c')).toBe(src);
  expect(colorHex('#fff')).toBe('#ffffff');
  expect(colorHex('hsl(0 100% 50%)')).toBe('#ff0000');
  expect(colorHex('var(--x)')).toBeNull();
});

test('embedFor plays Apple Music and Deezer links too', () => {
  expect(
    embedFor('https://music.apple.com/us/song/monsoon/1440857786')?.service
  ).toBe('applemusic');
  expect(embedFor('https://www.deezer.com/en/track/3135556')?.service).toBe(
    'deezer'
  );
  expect(
    embedFor('https://www.deezer.com/en/track/3135556', {
      services: ['spotify'],
    })
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
