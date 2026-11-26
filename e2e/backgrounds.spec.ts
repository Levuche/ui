import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import {
  BLOCK_TONES,
  DEFAULT_DIM,
  MIN_DIM,
  backgroundIssues,
  backgroundProps,
  cleanBackground,
  cssImageUrl,
  fixBackground,
  lookProps,
  splitLook,
  type BlockBackground,
} from '../src';

/* A block's own background: gradients, patterns and pictures. No browser. */

/** Anything a saved page could hold, typed or not. */
const loose = (value: unknown) => value as BlockBackground;

test('a gradient runs through theme colours by name, never typed CSS', () => {
  expect(
    backgroundProps({ type: 'gradient', stops: ['accent', 'band'] })
  ).toEqual({
    style: {
      '--block-gradient':
        'linear-gradient(135deg, var(--site-accent), var(--site-band))',
    },
    'data-background': 'gradient',
  });
  const three = backgroundProps({
    type: 'gradient',
    stops: ['surface', 'surface2', 'bg'],
    angle: 90.4,
    move: true,
  });
  expect(three.style['--block-gradient']).toBe(
    'linear-gradient(90deg, var(--site-surface), var(--site-surface-2), var(--site-bg))'
  );
  expect(three['data-background-move']).toBe('true');
  // Unknown names and CSS a creator typed are dropped.
  const typed = backgroundProps(
    loose({
      type: 'gradient',
      stops: ['accent', 'red); background: url(https://evil.example/x', 'band'],
      angle: '45deg; color: red',
    })
  );
  expect(typed.style['--block-gradient']).toBe(
    'linear-gradient(135deg, var(--site-accent), var(--site-band))'
  );
  // Fewer than two known colours is no gradient; more than three keeps three.
  expect(
    backgroundProps(loose({ type: 'gradient', stops: ['accent', '#ff0000'] }))
  ).toEqual({ style: {} });
  expect(
    cleanBackground({
      type: 'gradient',
      stops: ['bg', 'surface', 'accent', 'band'],
      angle: 999,
    })
  ).toMatchObject({ stops: ['bg', 'surface', 'accent'], angle: 360 });
});

test('a pattern is a known shape in a theme colour, kept faint', () => {
  expect(backgroundProps({ type: 'pattern', pattern: 'dots' })).toEqual({
    style: {
      '--block-ink': 'color-mix(in oklab, var(--site-accent) 12%, transparent)',
    },
    'data-background': 'pattern',
    'data-pattern': 'dots',
  });
  for (const pattern of ['lines', 'rings', 'grid', 'waves'] as const) {
    expect(backgroundProps({ type: 'pattern', pattern })['data-pattern']).toBe(
      pattern
    );
  }
  expect(
    backgroundProps({
      type: 'pattern',
      pattern: 'grid',
      color: 'text',
      opacity: 90,
    }).style['--block-ink']
  ).toBe('color-mix(in oklab, var(--site-text) 30%, transparent)');
  expect(
    backgroundProps(
      loose({ type: 'pattern', pattern: 'grid', color: 'url(x)', opacity: 5 })
    ).style['--block-ink']
  ).toBe('color-mix(in oklab, var(--site-accent) 5%, transparent)');
  expect(
    backgroundProps(loose({ type: 'pattern', pattern: 'stripes' }))
  ).toEqual({ style: {} });
});

test('a picture’s address is checked and can’t end its url() early', () => {
  expect(cssImageUrl('https://cdn.example.com/a.jpg')).toBe(
    'url("https://cdn.example.com/a.jpg")'
  );
  expect(cssImageUrl({ src: '/media/a.jpg', width: 800, height: 600 })).toBe(
    'url("/media/a.jpg")'
  );
  expect(cssImageUrl('data:image/png;base64,AAAA')).toBe(
    'url("data:image/png;base64,AAAA")'
  );
  expect(cssImageUrl('blob:https://editor.example/1234')).toBe(
    'url("blob:https://editor.example/1234")'
  );
  // Quotes, brackets and spaces are percent-encoded, so nothing breaks out.
  expect(cssImageUrl('https://cdn.example.com/a b").jpg')).toBe(
    'url("https://cdn.example.com/a%20b%22%29.jpg")'
  );
  expect(cssImageUrl("https://x.example/a');color:red;('")).toBe(
    'url("https://x.example/a%27%29;color:red;%28%27")'
  );
  for (const unsafe of [
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:text/css,body{}',
    '//evil.example/a.jpg',
    '/\\evil.example/a.jpg',
    'https://x.example/a\\"); color: red',
    'https://x.example/a\n.jpg',
    'vbscript:x',
    'ftp://x.example/a.jpg',
    '',
    null,
    undefined,
    { src: '' },
  ]) {
    expect(cssImageUrl(unsafe), String(unsafe)).toBeNull();
  }
});

test('a picture gets a dim layer that’s never too faint', () => {
  expect(
    backgroundProps({
      type: 'image',
      src: 'https://cdn.example.com/a.jpg',
      position: 'top',
    })
  ).toEqual({
    style: {
      '--block-picture': 'url("https://cdn.example.com/a.jpg")',
      '--block-picture-position': 'top',
      '--block-dim': `${DEFAULT_DIM}%`,
    },
    'data-background': 'image',
  });
  const faint = backgroundProps(
    loose({
      type: 'image',
      src: 'https://cdn.example.com/a.jpg',
      dim: 5,
      position: 'top; color: red',
    })
  );
  expect(faint.style['--block-dim']).toBe(`${MIN_DIM}%`);
  expect(faint.style['--block-picture-position']).toBe('center');
  expect(
    backgroundProps({ type: 'image', src: 'javascript:alert(1)' })
  ).toEqual({ style: {} });
  expect(backgroundProps(loose({ type: 'video', src: 'a.mp4' }))).toEqual({
    style: {},
  });
  expect(backgroundProps(loose('linear-gradient(red, blue)'))).toEqual({
    style: {},
  });
});

test('the background is part of the look every block shares', () => {
  const [look, rest] = splitLook({
    tone: 'inset' as const,
    background: { type: 'pattern', pattern: 'rings' } as BlockBackground,
    id: 'a',
  });
  expect(look).toEqual({
    tone: 'inset',
    background: { type: 'pattern', pattern: 'rings' },
  });
  expect(rest).toEqual({ id: 'a' });
  const props = lookProps('booking-card', look, {
    colors: { accent: '#0f766e' },
  });
  expect(props['data-tone']).toBe('inset');
  expect(props['data-background']).toBe('pattern');
  expect(props['data-pattern']).toBe('rings');
  expect(props.style).toMatchObject({
    '--site-accent': '#0f766e',
    '--block-ink': 'color-mix(in oklab, var(--site-accent) 12%, transparent)',
  });
  // A block's own default background, and none at all.
  expect(
    lookProps('x', {}, { background: { type: 'pattern', pattern: 'dots' } })[
      'data-pattern'
    ]
  ).toBe('dots');
  expect(lookProps('x')).not.toHaveProperty('data-background');
  expect(BLOCK_TONES).toContain('inset');
});

test('the defaults keep words readable in the sample theme, light and dark', () => {
  const quiet = ['surface', 'muted', 'inset', 'outline', 'plain'] as const;
  for (const scheme of ['light', 'dark'] as const) {
    for (const tone of quiet) {
      for (const background of [
        { type: 'image', src: 'https://cdn.example.com/a.jpg' },
        { type: 'pattern', pattern: 'grid' },
        { type: 'pattern', pattern: 'lines', color: 'text' },
        { type: 'gradient', stops: ['surface', 'surface2'] },
        { type: 'gradient', stops: ['bg', 'surface'] },
      ] as BlockBackground[]) {
        expect(
          backgroundIssues({ tone, background }, { scheme }),
          `${scheme} ${tone} ${background.type}`
        ).toEqual([]);
      }
    }
    // The strong tones' colours run together, so their words stay readable.
    expect(
      backgroundIssues(
        {
          tone: 'accent',
          background: { type: 'gradient', stops: ['accent', 'surface'] },
        },
        { scheme }
      )
    ).toEqual([]);
  }
});

test('a picture or pattern that hides the words gets the smallest fix', () => {
  const look = {
    tone: 'accent' as const,
    background: {
      type: 'image',
      src: 'https://cdn.example.com/a.jpg',
      dim: 60,
    } as BlockBackground,
  };
  const issues = backgroundIssues(look);
  expect(issues).toHaveLength(1);
  expect(issues[0]).toMatchObject({
    label: 'Text on the picture',
    needed: 4.5,
  });
  expect(issues[0]!.ratio).toBeLessThan(4.5);
  const fixed = fixBackground(look);
  expect(fixed).toMatchObject({ type: 'image' });
  const dim = (fixed as { dim: number }).dim;
  expect(dim).toBeGreaterThan(60);
  expect(backgroundIssues({ ...look, background: fixed })).toEqual([]);
  // One less and it fails: the fix changes only as far as it must.
  expect(
    backgroundIssues({
      ...look,
      background: { ...fixed!, dim: dim - 1 } as BlockBackground,
    })
  ).not.toEqual([]);

  // A strong pattern in the text colour on a dark card: fainter lines pass.
  const pattern = {
    tone: 'surface' as const,
    background: {
      type: 'pattern',
      pattern: 'dots',
      color: 'text',
      opacity: 30,
    } as BlockBackground,
  };
  const dark = { scheme: 'dark' as const };
  expect(backgroundIssues(pattern, dark).length).toBeGreaterThan(0);
  const fainter = fixBackground(pattern, dark) as { opacity: number };
  expect(fainter.opacity).toBeLessThan(30);
  expect(
    backgroundIssues(
      { ...pattern, background: fainter as BlockBackground },
      dark
    )
  ).toEqual([]);
});

test('a gradient behind dark words through the accent is reported, not changed', () => {
  const look = {
    tone: 'surface' as const,
    background: {
      type: 'gradient',
      stops: ['surface', 'accent'],
    } as BlockBackground,
  };
  const issues = backgroundIssues(look);
  expect(issues.map((issue) => issue.label)).toEqual([
    "Text on the gradient's accent colour",
    "Softer text on the gradient's accent colour",
  ]);
  expect(issues.every((issue) => !issue.suggestion)).toBe(true);
  expect(fixBackground(look)).toBe(look.background);
  // The block's own colours are checked, over the theme's.
  expect(
    backgroundIssues({
      ...look,
      colors: { accent: '#fde68a' },
    })
  ).toEqual([]);
});

test('an animated background stops for visitors who ask for less motion', () => {
  const css = readFileSync(
    new URL('../src/tokens.css', import.meta.url),
    'utf8'
  );
  const drift = [...css.matchAll(/animation:\s*levuche-drift/g)];
  expect(drift.length).toBeGreaterThan(0);
  // Every rule that starts the drift sits inside a no-preference block.
  for (const match of drift) {
    const before = css.slice(0, match.index);
    const opened = before.lastIndexOf(
      '@media (prefers-reduced-motion: no-preference)'
    );
    expect(opened).toBeGreaterThan(-1);
    const block = before.slice(opened);
    const depth =
      (block.match(/\{/g)?.length ?? 0) - (block.match(/\}/g)?.length ?? 0);
    expect(depth).toBeGreaterThan(0);
  }
});
