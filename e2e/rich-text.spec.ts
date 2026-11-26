import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  QuoteBlock,
  SectionHeading,
  Spacer,
  TextBlock,
  spacerHeight,
} from '../src/organisms/text-blocks';
import { BLOCKS } from '../src/system/registry';
import {
  RICH_TEXT_MAX_LENGTH,
  anchorId,
  parseInline,
  parseRichText,
  richTextWords,
} from '../src/system/rich-text';

/* The text blocks' format and what they draw. No browser. */

const html = (element: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(element);

test('paragraphs, line breaks and lists', () => {
  const blocks = parseRichText(
    'Hello 👋\nSecond line\n\n- one\n* two\n• three\n\n3. third\n4) fourth\nAfter'
  );
  expect(blocks.map((block) => block.type)).toEqual([
    'paragraph',
    'list',
    'list',
    'paragraph',
  ]);
  expect(blocks[0]).toEqual({
    type: 'paragraph',
    lines: [
      [{ type: 'text', text: 'Hello 👋' }],
      [{ type: 'text', text: 'Second line' }],
    ],
  });
  expect(blocks[1]).toMatchObject({ ordered: false, start: 1 });
  expect(blocks[2]).toMatchObject({ ordered: true, start: 3 });
  expect(blocks[2]!.type === 'list' && blocks[2]!.items.length).toBe(2);
  expect(parseRichText('')).toEqual([]);
  expect(parseRichText(undefined)).toEqual([]);
  expect(parseRichText('\r\n\r\n  \n')).toEqual([]);
});

test('a bullet list and a numbered list next to each other stay apart', () => {
  const blocks = parseRichText('- a\n1. b');
  expect(blocks).toHaveLength(2);
});

test('bold, italic and links, nested', () => {
  expect(parseInline('**bold *and italic***')).toEqual([
    {
      type: 'strong',
      children: [
        { type: 'text', text: 'bold ' },
        { type: 'em', children: [{ type: 'text', text: 'and italic' }] },
      ],
    },
  ]);
  expect(parseInline('see [**my** works](#my-works).')).toEqual([
    { type: 'text', text: 'see ' },
    {
      type: 'link',
      href: '#my-works',
      children: [
        { type: 'strong', children: [{ type: 'text', text: 'my' }] },
        { type: 'text', text: ' works' },
      ],
    },
    { type: 'text', text: '.' },
  ]);
  expect(parseInline('_soft_ and *soft*')).toEqual([
    { type: 'em', children: [{ type: 'text', text: 'soft' }] },
    { type: 'text', text: ' and ' },
    { type: 'em', children: [{ type: 'text', text: 'soft' }] },
  ]);
});

test('marks that aren’t marks stay as typed', () => {
  const plain = (src: string) => [{ type: 'text', text: src }];
  for (const src of [
    'snake_case_name',
    '2 * 3 * 4',
    '**',
    '* not closed',
    '[no link]',
    '[empty]()',
    'a_b',
  ]) {
    expect(parseInline(src), src).toEqual(plain(src));
  }
  expect(parseInline('\\*kept\\* \\[x\\](y)')).toEqual(plain('*kept* [x](y)'));
});

test('links written out in full become links, without the full stop', () => {
  expect(
    parseInline('Shop: https://example.com/shop. Or (https://example.com/a)')
  ).toEqual([
    { type: 'text', text: 'Shop: ' },
    {
      type: 'link',
      href: 'https://example.com/shop',
      children: [{ type: 'text', text: 'https://example.com/shop' }],
    },
    { type: 'text', text: '. Or (' },
    {
      type: 'link',
      href: 'https://example.com/a',
      children: [{ type: 'text', text: 'https://example.com/a' }],
    },
    { type: 'text', text: ')' },
  ]);
  // Not inside a word, and not inside a link's own words.
  expect(parseInline('xhttps://a.b')).toEqual([
    { type: 'text', text: 'xhttps://a.b' },
  ]);
  expect(parseInline('[https://a.b](https://c.d)')[0]).toMatchObject({
    href: 'https://c.d',
    children: [{ type: 'text', text: 'https://a.b' }],
  });
});

test('very long text is cut, and odd text never throws', () => {
  const long = 'a'.repeat(RICH_TEXT_MAX_LENGTH + 500);
  expect(richTextWords(long)).toHaveLength(RICH_TEXT_MAX_LENGTH);
  const started = Date.now();
  for (const mark of ['*', '**', '_', '[', '[a](', 'https://', '\\']) {
    const src = mark.repeat(RICH_TEXT_MAX_LENGTH / mark.length);
    expect(
      () => html(createElement(TextBlock, { text: src })),
      mark
    ).not.toThrow();
  }
  expect(Date.now() - started).toBeLessThan(5000);
});

test('plain words without marks', () => {
  expect(richTextWords('**Hi** [there](https://x.y)\n\n- one')).toBe(
    'Hi there\n\none'
  );
});

test('text a creator types is never read as HTML', () => {
  const out = html(
    createElement(TextBlock, {
      text: '<script>alert(1)</script> <img src=x onerror=alert(1)> **<b>hi</b>**\n- <i>x</i>',
    })
  );
  expect(out).not.toMatch(/<script|<img|<b>|<i>/i);
  expect(out).toContain('&lt;script&gt;');
  expect(out).toContain('<strong>&lt;b&gt;hi&lt;/b&gt;</strong>');
  const quote = html(
    createElement(QuoteBlock, { quote: '<script>x</script>', name: '<b>A</b>' })
  );
  expect(quote).not.toMatch(/<script|<b>/i);
  const heading = html(
    createElement(SectionHeading, {
      title: '<h1>Hi</h1>',
      detail: '<img src=x>',
    })
  );
  expect(heading).not.toMatch(/<h1|<img/i);
});

test('unsafe links show as words, safe ones as links', () => {
  const out = html(
    createElement(TextBlock, {
      text: '[bad](javascript:alert(1)) [data](data:text/html,x) [good](https://example.com) [mail](mailto:a@b.c) [jump](#works)',
    })
  );
  expect(out).not.toMatch(/javascript|data:/i);
  // Their words stay, as plain text.
  expect(out).toContain('bad data <a');
  expect(out).toContain('href="https://example.com"');
  expect(out).toContain('target="_blank"');
  expect(out).toContain('href="mailto:a@b.c"');
  expect(out).toContain('href="#works"');
});

test('lists keep their numbers, and every block writes its registry id', () => {
  const out = html(createElement(TextBlock, { text: '3. c\n4. d' }));
  expect(out).toContain('<ol start="3"');
  expect(out).toContain('data-block="text-block"');
  for (const [element, id] of [
    [createElement(SectionHeading, { title: 'Hi' }), 'section-heading'],
    [createElement(QuoteBlock, { quote: 'Hi' }), 'quote-block'],
    [createElement(Spacer), 'spacer'],
  ] as const) {
    expect(html(element)).toContain(`data-block="${id}"`);
    expect(BLOCKS.some((block) => block.id === id)).toBe(true);
  }
});

test('a heading’s id is cleaned so a link can jump to it', () => {
  expect(anchorId('My works!')).toBe('my-works');
  expect(anchorId('  Let’s   connect  ')).toBe('let-s-connect');
  expect(anchorId('Café Ünïcode')).toBe('cafe-unicode');
  expect(anchorId('मेरे काम')).toBe('मेरे-काम');
  expect(anchorId('"><script>')).toBe('script');
  expect(anchorId('---')).toBe('');
  expect(anchorId(undefined)).toBe('');
  expect(anchorId('a'.repeat(100))).toHaveLength(64);
  const out = html(
    createElement(SectionHeading, { title: 'My works', id: 'My Works' })
  );
  expect(out).toContain('id="my-works"');
  expect(
    html(createElement(SectionHeading, { title: 'x', id: '!!' }))
  ).not.toContain(' id=');
});

test('a spacer is whole grid rows tall, 1 to 12', () => {
  expect(spacerHeight(1)).toBe(3);
  expect(spacerHeight(2)).toBe(7);
  expect(spacerHeight(0)).toBe(3);
  expect(spacerHeight(Number.NaN)).toBe(3);
  expect(spacerHeight(99)).toBe(12 * 3 + 11);
  const gap = html(createElement(Spacer, { rows: 2 }));
  expect(gap).toContain('aria-hidden="true"');
  expect(gap).toContain('min-height:7rem');
  expect(gap).not.toContain('<hr');
  const line = html(createElement(Spacer, { line: true }));
  expect(line).toContain('<hr');
  expect(line).not.toContain('aria-hidden');
});

test('long runs of punctuation or hyphens stay fast', () => {
  const start = performance.now();
  expect(anchorId('-'.repeat(100_000) + 'a' + '-'.repeat(100_000))).toBe('a');
  parseRichText('https://example.com/' + '!'.repeat(100_000) + 'x');
  expect(performance.now() - start).toBeLessThan(1000);
});
