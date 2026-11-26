import { expect, test } from '@playwright/test';
import { nameColorIssue } from '../src/system/contrast';
import { cn } from '../src/system/cn';
import { nameLook, nameTint } from '../src/system/name-style';
import { BLOCKS } from '../src/system/registry';

/* Plain checks of a name's own colour, capitals and weight. No browser. */

test('a name is in the text colour and bold until told otherwise', () => {
  expect(nameLook()).toEqual({ className: 'text-site-text font-bold' });
  const look = nameLook({ color: 'accent', case: 'upper', weight: 'black' });
  expect(look.className.split(' ').sort()).toEqual(
    ['font-black', 'text-site-accent', 'tracking-wide', 'uppercase'].sort()
  );
  expect(look.style).toBeUndefined();
});

test('values that are not one of the choices fall back', () => {
  const look = nameLook({
    color: 'red' as never,
    weight: 'heavy' as never,
    case: 'lower' as never,
  });
  expect(look.className).toBe('text-site-text font-bold');
});

test('a creator’s own colour is used only when it is a plain colour', () => {
  expect(nameTint('#1d4ed8')).toBe('#1d4ed8');
  expect(nameTint(' oklch(0.5 0.2 260) ')).toBe('oklch(0.5 0.2 260)');
  for (const unsafe of [
    'url(https://x.test/a.png)',
    'red; background: url(x)',
    'expression(alert(1))',
    '',
    42,
  ]) {
    expect(nameTint(unsafe), String(unsafe)).toBeUndefined();
  }
  const look = nameLook({ color: 'accent', tint: '#1d4ed8' });
  // The own colour wins, so no theme colour class is left to fight it.
  expect(look.className).toBe('font-bold');
  expect(look.style).toEqual({ color: '#1d4ed8' });
  expect(nameLook({ tint: 'url(x)' }).style).toBeUndefined();
});

test('the look overrides the heading’s own colour and weight', () => {
  const merged = cn(
    'text-site-text m-0 leading-tight font-bold',
    'text-[calc(var(--block-title)*1.35)]',
    nameLook({ color: 'link', weight: 'medium' }).className
  ).split(' ');
  expect(merged).toContain('text-site-link');
  expect(merged).toContain('font-medium');
  expect(merged).not.toContain('text-site-text');
  expect(merged).not.toContain('font-bold');
  // The size stays: tailwind-merge doesn't take it for a colour.
  expect(merged).toContain('text-[calc(var(--block-title)*1.35)]');
});

test('warns when a name’s colour is too faint on its block', () => {
  // The scheme's own colours pass on a card and on the page.
  expect(nameColorIssue({})).toBeNull();
  expect(nameColorIssue({ color: 'accent' }, { tone: 'plain' })).toBeNull();
  expect(nameColorIssue({ color: 'link' }, {}, { scheme: 'dark' })).toBeNull();
  // The accent colour vanishes on a block in the accent colour.
  const onAccent = nameColorIssue({ color: 'accent' }, { tone: 'accent' });
  expect(onAccent).toEqual({ ratio: 1, needed: 4.5, suggestion: 'text' });
  // Links turn into the tone's own text colour there, so they pass.
  expect(nameColorIssue({ color: 'link' }, { tone: 'accent' })).toBeNull();
  // A pale colour of the creator's own on a white page.
  const pale = nameColorIssue({ tint: '#ffd6a5' }, { tone: 'plain' });
  expect(pale?.ratio).toBeLessThan(2);
  expect(pale?.suggestion).toBe('text');
  // The same colour reads on the dark scheme.
  expect(
    nameColorIssue({ tint: '#ffd6a5' }, { tone: 'plain' }, { scheme: 'dark' })
  ).toBeNull();
  // An own colour wins over the theme colour it replaces.
  expect(
    nameColorIssue({ color: 'accent', tint: '#ffffff' }, { tone: 'accent' })
  ).toBeNull();
  // The creator's own theme colours count.
  expect(
    nameColorIssue(
      { color: 'accent' },
      { tone: 'plain' },
      { colors: { accent: '#fbbf24' } }
    )?.needed
  ).toBe(4.5);
  // An unsafe own colour is ignored, as the block ignores it.
  expect(nameColorIssue({ tint: 'url(x)' })).toBeNull();
});

test('the header and the section heading describe the new settings', () => {
  for (const [id, prefix] of [
    ['creator-header', 'name'],
    ['section-heading', 'title'],
  ] as const) {
    const entry = BLOCKS.find((block) => block.id === id);
    const names = entry?.settings.map((setting) => setting.name);
    for (const suffix of ['Color', 'Tint', 'Case', 'Weight']) {
      expect(names, id).toContain(`${prefix}${suffix}`);
    }
  }
});
