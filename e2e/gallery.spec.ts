import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  TileGallery,
  CAPTION_STYLES,
  GALLERY_SPANS,
  SiteImage,
  VIDEO_LABELS,
  VIDEO_TILE_LABELS,
  VideoTile,
  safeImageSource,
} from '../src';
import { blockInfo } from '../src/system/registry';

/* Galleries with tiles of mixed sizes, captions on pictures, uploaded video. */

const html = (element: Parameters<typeof renderToString>[0]) =>
  renderToString(element);

test('the new blocks are in the media group of the registry', () => {
  for (const id of ['tile-gallery', 'video-tile']) {
    const block = blockInfo(id);
    expect(block, id).toBeDefined();
    expect(block?.group).toBe('media');
    expect(block?.pack).toBe('media');
  }
  expect(GALLERY_SPANS).toEqual(['1x1', '2x1', '1x2', '2x2']);
  expect(CAPTION_STYLES).toEqual(['below', 'bar', 'chip']);
});

test('a video’s cover goes through the safe picture check', () => {
  expect(safeImageSource('https://cdn.example.com/a.jpg')).toEqual({
    src: 'https://cdn.example.com/a.jpg',
  });
  expect(safeImageSource('/covers/a.jpg')?.src).toBe('/covers/a.jpg');
  expect(safeImageSource('data:image/png;base64,AAAA')).not.toBeNull();
  for (const unsafe of [
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//evil.example/a.jpg',
    null,
    undefined,
    '',
  ]) {
    expect(safeImageSource(unsafe), String(unsafe)).toBeNull();
  }
});

test('a video never plays or makes sound from the page’s HTML', () => {
  const page = html(
    createElement(VideoTile, {
      src: 'https://cdn.example.com/clip.mov',
      title: 'Pouring chai',
      poster: 'javascript:alert(1)',
      loop: true,
    })
  );
  expect(page).toContain('data-block="video-tile"');
  expect(page).not.toMatch(/autoplay/i);
  expect(page).not.toMatch(/\scontrols/);
  // The block starts the loop itself, after checking for less motion.
  expect(page).toContain('data-video-mode="still"');
  expect(page).toContain('aria-label="Play Pouring chai"');
  expect(page).toMatch(/playsinline/i);
  // An unsafe cover is dropped, and the first frame stands in for it.
  expect(page).not.toContain('javascript:');
  expect(page).toContain('clip.mov#t=0.1');
  expect(page).toContain('preload="metadata"');
});

test('a video address that could run code shows nothing', () => {
  for (const src of ['javascript:alert(1)', 'data:text/html,hi', 'tel:123']) {
    expect(html(createElement(VideoTile, { src, title: 'x' })), src).toBe('');
  }
  // In a gallery it falls back to a picture tile.
  const gallery = html(
    createElement(TileGallery, {
      items: [{ video: 'javascript:alert(1)', alt: 'A clip' }],
    })
  );
  expect(gallery).not.toContain('<video');
  expect(gallery).toContain('aria-label="A clip"');
});

test('only safe caption files reach the video, as captions by default', () => {
  const page = html(
    createElement(VideoTile, {
      src: '/clip.webm',
      title: 'Pouring chai',
      poster: '/cover.jpg',
      tracks: [
        { src: '/clip.en.vtt', lang: 'en', label: 'English', default: true },
        { src: '/clip.hi.vtt', lang: 'hi', label: 'Hindi', kind: 'subtitles' },
        { src: 'javascript:alert(1)', lang: 'fr', label: 'French' },
      ],
    })
  );
  expect(page.match(/<track/g)).toHaveLength(2);
  expect(page).toContain('kind="captions"');
  expect(page).toContain('kind="subtitles"');
  expect(page).toContain('crossorigin="anonymous"');
  expect(page).not.toContain('javascript:');
  // A cover means nothing downloads until play.
  expect(page).toContain('preload="none"');
});

test('tiles take their span, and pictures their share of the width', () => {
  const page = html(
    createElement(TileGallery, {
      columns: 4,
      items: [
        {
          alt: 'Big',
          span: '2x2',
          src: { src: 'a.jpg', srcSet: 'a.jpg 800w' },
        },
        { alt: 'Tall', span: '1x2' },
        { alt: 'Wide', span: '2x1' },
        { alt: 'Small' },
      ],
    })
  );
  expect(page).toContain('col-span-2 row-span-2');
  expect(page).toContain('row-span-2');
  expect(page).toContain('@md:grid-cols-4');
  // Two of four columns from a tablet; the whole width of two on a phone.
  expect(page).toContain('sizes="(min-width: 768px) 288px, 100vw"');
});

test('captions sit below, on a bar or on a chip', () => {
  const caption = (captionStyle: (typeof CAPTION_STYLES)[number]) =>
    html(
      createElement(SiteImage, {
        src: '/a.jpg',
        alt: 'Chai',
        caption: 'Morning chai',
        captionStyle,
      })
    );
  expect(caption('below')).toContain('text-site-text-2');
  expect(caption('bar')).toContain('backdrop-blur');
  expect(caption('chip')).toContain('bg-site-text');
  for (const style of CAPTION_STYLES) {
    expect(caption(style)).toMatch(
      /<figcaption[^>]*>Morning chai<\/figcaption><\/figure>/
    );
  }
});

test('the video words have English defaults for every key', () => {
  for (const [key, words] of Object.entries(VIDEO_LABELS)) {
    expect(VIDEO_TILE_LABELS[key as keyof typeof VIDEO_LABELS]).toBe(words);
  }
  expect(VIDEO_TILE_LABELS.transcript).toBe('Transcript');
});
