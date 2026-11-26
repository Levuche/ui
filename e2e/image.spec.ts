import { expect, test } from '@playwright/test';
import { columnSizes, imageAttrs, toImageSource } from '../src';

/* Pictures in the sizes they come in, loading now or when near the screen. */

test('a plain address and a picture with sizes both become a source', () => {
  expect(toImageSource('https://cdn.example.com/a.jpg')).toEqual({
    src: 'https://cdn.example.com/a.jpg',
  });
  expect(toImageSource({ src: 'a.jpg', width: 800, height: 600 })).toEqual({
    src: 'a.jpg',
    width: 800,
    height: 600,
  });
  for (const none of [null, undefined, '', { src: '' }]) {
    expect(toImageSource(none)).toBeNull();
  }
});

test('sizes follow the page column: the screen on a phone, 576 px from a tablet', () => {
  expect(columnSizes()).toBe('(min-width: 768px) 576px, 100vw');
  expect(columnSizes(1 / 3)).toBe('(min-width: 768px) 192px, 33vw');
  // Four to a row from a tablet, three on a phone.
  expect(columnSizes(1 / 4, 1 / 3)).toBe('(min-width: 768px) 144px, 33vw');
  expect(columnSizes(2)).toBe('(min-width: 768px) 576px, 100vw');
});

test('a picture loads when near the screen unless it asks for priority', () => {
  expect(imageAttrs({ src: 'a.jpg' })).toEqual({
    src: 'a.jpg',
    loading: 'lazy',
    decoding: 'async',
  });
  expect(imageAttrs({ src: 'a.jpg', priority: true })).toMatchObject({
    loading: 'eager',
    fetchPriority: 'high',
  });
});

test('other sizes come with the width the block shows them at', () => {
  const srcSet = 'a-400.jpg 400w, a-800.jpg 800w';
  expect(imageAttrs({ src: 'a.jpg', srcSet }, '52px')).toMatchObject({
    srcSet,
    sizes: '52px',
  });
  // The creator's own sizes win, for a page laid out differently.
  expect(
    imageAttrs({ src: 'a.jpg', srcSet, sizes: '50vw' }, '52px')
  ).toMatchObject({ sizes: '50vw' });
  // No sizes without other sizes to pick from.
  expect(imageAttrs({ src: 'a.jpg' }, '52px')).not.toHaveProperty('sizes');
});

test('the picture’s own width and height keep its space while it loads', () => {
  expect(imageAttrs({ src: 'a.jpg', width: 800, height: 600 })).toMatchObject({
    width: 800,
    height: 600,
  });
  expect(imageAttrs({ src: 'a.jpg', width: 800 })).not.toHaveProperty('width');
});
