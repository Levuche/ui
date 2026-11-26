import { expect, test } from '@playwright/test';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BLOCKS,
  BookingEmbed,
  PREVIEW_FOLLOWS,
  PlayFrame,
  PreviewMode,
  SpotifyEmbed,
  YouTubeVideo,
  inPreview,
  previewStop,
  type BlockInfo,
} from '../src';
import { BlockSample } from '../stories/block-samples';

/* Preview mode for the page editor. No browser. */

/** A stand-in for an element: `marks` are the data-preview values around it,
 * nearest first, and `follows` whether it's (inside) a link or submit button. */
const element = ({ marks = [] as string[], follows = false } = {}) => ({
  closest(selectors: string) {
    if (selectors === '[data-preview]') {
      return marks.length
        ? {
            getAttribute: (name: string) =>
              name === 'data-preview' ? marks[0] : null,
          }
        : null;
    }
    if (selectors === PREVIEW_FOLLOWS) {
      return follows ? { getAttribute: () => null } : null;
    }
    throw new Error(`Unexpected selector: ${selectors}`);
  },
});

test('a node is in a preview when the nearest mark says on', () => {
  expect(inPreview(element({ marks: ['on'] }))).toBe(true);
  expect(inPreview(element({ marks: ['off', 'on'] }))).toBe(false);
  expect(inPreview(element({ marks: ['on', 'off'] }))).toBe(true);
  expect(inPreview(element())).toBe(false);
  // Anything that isn't an element is never in a preview.
  for (const node of [null, undefined, 'a', 3, {}, { closest: 'no' }]) {
    expect(inPreview(node)).toBe(false);
  }
});

test('in a preview, links don’t open and forms don’t send', () => {
  const link = element({ marks: ['on'], follows: true });
  const text = element({ marks: ['on'] });
  expect(previewStop({ type: 'click', target: link })).toBe('prevent');
  expect(previewStop({ type: 'auxclick', target: link })).toBe('prevent');
  // A form is stopped outright: its own handler never runs.
  expect(previewStop({ type: 'submit', target: text })).toBe('stop');
  // Clicks on anything else, and other events, go on as usual, so the
  // editor still hears them and can select the block.
  expect(previewStop({ type: 'click', target: text })).toBe('none');
  expect(previewStop({ type: 'keydown', target: link })).toBe('none');
  expect(previewStop({ type: 'focus', target: link })).toBe('none');
  // Outside a preview, or in a part that opts out, nothing is stopped.
  for (const marks of [[], ['off', 'on']]) {
    const live = element({ marks, follows: true });
    expect(previewStop({ type: 'click', target: live })).toBe('none');
    expect(previewStop({ type: 'submit', target: live })).toBe('none');
  }
});

test('submit buttons count as following, with or without a type', () => {
  for (const selector of [
    'a[href]',
    'area[href]',
    'button:not([type])',
    'button[type="submit" i]',
    'input[type="submit" i]',
    'input[type="image" i]',
  ]) {
    expect(PREVIEW_FOLLOWS.split(', ')).toContain(selector);
  }
});

/** A tree rendered to HTML, in or out of preview mode. */
const render = (node: ReactNode, enabled: boolean) =>
  renderToStaticMarkup(createElement(PreviewMode, { enabled }, node));

/** The HTML without preview mode's own marks. */
const unmarked = (html: string) =>
  html
    .replace(/ data-preview="(on|off)"/g, '')
    .replace(/ data-preview-placeholder=""/g, '');

test('every block in the registry looks the same in preview as live', () => {
  for (const block of BLOCKS as readonly BlockInfo[]) {
    const node = createElement(BlockSample, { block });
    const live = render(node, false);
    const preview = render(node, true);
    // Nothing removed, hidden or taken out of the tab order: preview mode
    // adds no tabindex or inert of its own.
    expect(unmarked(preview), block.id).toBe(unmarked(live));
    expect(preview, block.id).not.toContain('<iframe');
  }
});

test('players from other sites never load in preview', () => {
  const frame = createElement(PlayFrame, {
    src: 'https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC',
    title: 'Tea song',
    autoLoad: true,
  });
  expect(render(frame, false)).toContain('<iframe');
  const still = render(frame, true);
  expect(still).not.toContain('<iframe');
  // The still placeholder is the play button: it can still take focus.
  expect(still).toMatch(/<button[^>]*data-preview-placeholder=""/);

  for (const player of [
    createElement(YouTubeVideo, {
      video: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      title: 'How tea came to India',
      poster: null,
    }),
    createElement(SpotifyEmbed, {
      url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
      title: 'Tea song',
    }),
  ]) {
    const html = render(player, true);
    expect(html).toContain('data-preview-placeholder=""');
    expect(html).not.toContain('<iframe');
  }
});

test('a booking page shows a still placeholder in preview', () => {
  const booking = createElement(BookingEmbed, {
    src: 'https://example.com/book',
    title: 'Origin story review',
    display: 'inline',
  });
  expect(render(booking, false)).toContain('<iframe');
  const html = render(booking, true);
  expect(html).not.toContain('<iframe');
  expect(html).toMatch(
    /role="img" aria-label="Booking: Origin story review" data-preview-placeholder=""/
  );
  // Its plain link stays, so the block still has something to focus.
  expect(html).toContain('href="https://example.com/book"');
});
