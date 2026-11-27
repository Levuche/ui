import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, test } from '@playwright/test';
import {
  EDIT_ATTR,
  EDIT_KIND_ATTR,
  editPath,
  editPaths,
  editTargetOf,
  editable,
  editedText,
  type EditKind,
} from '../src';
import { LOOK_SETTINGS, type SettingField } from '../src/system/settings';
import {
  BLOCKS,
  BLOCK_COMPONENT,
  appProps,
  sampleProps,
} from './setting-samples';

/*
 * Edit mode for the page editor. No browser.
 *
 * The rule every block keeps: whatever a creator set that a visitor sees can
 * be edited on the block itself. Each block is rendered on the server with
 * every setting set, then:
 *
 * - every word a setting put on the page (its own words, a list item's,
 *   a group's, the block's `labels`) sits inside a part marked with that
 *   setting's path, to be typed in place;
 * - every link and picture a setting put on the page has a part marked with
 *   its path, to be picked.
 *
 * What isn't on the page (a screen-reader name, a code) is set in the
 * editor's panel, so it needs no mark. The few that show but can't be
 * marked are in NOT_IN_PLACE, with the reason.
 */

type Props = Record<string, unknown>;

/** Settings shown on the page that are set only in the panel, and why. */
const NOT_IN_PLACE: Record<string, string> = {
  'creator-header.highlight':
    'Words of the tagline: they’re typed with the tagline, and set apart in the panel.',
};

/* A small reader for the HTML React writes, enough to walk its elements. */

type Node = {
  tag: string;
  attrs: Record<string, string>;
  children: (Node | string)[];
  parent: Node | null;
};

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

const decode = (text: string) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

function parse(html: string): Node {
  const root: Node = { tag: '#root', attrs: {}, children: [], parent: null };
  let at = root;
  const tokens = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/(<[^>]+>)/)
    .filter(Boolean);
  for (const token of tokens) {
    if (!token.startsWith('<')) {
      at.children.push(decode(token));
    } else if (token.startsWith('</')) {
      at = at.parent ?? root;
    } else if (!token.startsWith('<!')) {
      const [, tag, rest = ''] = /^<([a-zA-Z0-9-]+)([\s\S]*?)\/?>$/.exec(
        token
      ) ?? ['', 'unknown'];
      const attrs: Record<string, string> = {};
      for (const [, name, value = ''] of rest.matchAll(
        /([^\s=]+)(?:="([^"]*)")?/g
      )) {
        attrs[name] = decode(value);
      }
      const node: Node = { tag, attrs, children: [], parent: at };
      at.children.push(node);
      if (!VOID.has(tag.toLowerCase()) && !token.endsWith('/>')) at = node;
    }
  }
  return root;
}

function* walk(node: Node): Generator<Node> {
  yield node;
  for (const child of node.children) {
    if (typeof child !== 'string') yield* walk(child);
  }
}

/** The words directly in an element, its text pieces joined. */
const ownText = (node: Node) =>
  node.children.filter((child) => typeof child === 'string').join('');

/** The nearest element marked editable, from `node` outwards. */
function markOf(node: Node | null) {
  for (let at = node; at; at = at.parent) {
    if (at.attrs[EDIT_ATTR]) {
      return {
        path: at.attrs[EDIT_ATTR],
        kind: (at.attrs[EDIT_KIND_ATTR] ?? 'text') as EditKind,
      };
    }
  }
  return null;
}

/** What one setting put on the page, for the checks below. */
type Shown = { path: string; type: SettingField['type']; value: string };

/** Each text, link and picture value in `props`, with its path. */
function shownValues(
  fields: readonly SettingField[],
  props: Props,
  base?: string
): Shown[] {
  const found: Shown[] = [];
  for (const field of fields) {
    if (field.forApp) continue;
    const value = props[field.name];
    const path = editPath(base, field.name) ?? field.name;
    if (
      (field.type === 'text' ||
        field.type === 'longText' ||
        field.type === 'link' ||
        field.type === 'picture') &&
      typeof value === 'string' &&
      value
    ) {
      found.push({ path, type: field.type, value });
    } else if (field.type === 'group' && value && typeof value === 'object') {
      found.push(...shownValues(field.fields, value as Props, path));
    } else if (field.type === 'list' && Array.isArray(value)) {
      value.forEach((item, i) => {
        const itemPath = `${path}.${i}`;
        if (typeof item === 'string' && field.of && field.of !== 'number') {
          found.push({ path: itemPath, type: field.of, value: item });
        } else if (item && typeof item === 'object' && field.fields) {
          found.push(...shownValues(field.fields, item as Props, itemPath));
        }
      });
    } else if (field.type === 'words' && value && typeof value === 'object') {
      for (const [key, word] of Object.entries(value as Props)) {
        if (typeof word === 'string' && word) {
          found.push({ path: `${path}.${key}`, type: 'text', value: word });
        }
      }
    }
  }
  return found;
}

test('editable marks a part with its path and kind', () => {
  expect(editable('title')).toEqual({
    'data-edit': 'title',
    'data-edit-kind': 'text',
  });
  expect(editable('items.0.url', 'link')).toEqual({
    'data-edit': 'items.0.url',
    'data-edit-kind': 'link',
  });
  expect(editable(undefined)).toEqual({});
  expect(editable('')).toEqual({});
});

test('paths join their parts and leave out missing ones', () => {
  expect(editPath('items', 2, 'label')).toBe('items.2.label');
  expect(editPath(undefined, 'title')).toBe('title');
  expect(editPath(null, 'title')).toBeUndefined();
  expect(editPaths('items.0', ['title', 'image'] as const)).toEqual({
    title: 'items.0.title',
    image: 'items.0.image',
  });
  expect(editPaths(undefined, ['title'] as const)).toEqual({});
});

test('typed text becomes the setting’s value', () => {
  expect(editedText('text', '  Two\nlines \n')).toBe('Two lines');
  expect(editedText('text', 'No break')).toBe('No break');
  expect(editedText('longText', 'One\r\nTwo\n\n')).toBe('One\nTwo');
});

/** A stand-in for an element inside marks, nearest first. */
const element = (marks: Record<string, string>[]) => ({
  closest(selectors: string) {
    const name = /^\[([^\]]+)\]$/.exec(selectors)?.[1];
    const index = marks.findIndex((mark) => name && name in mark);
    if (index < 0) return null;
    const rest = element(marks.slice(index));
    return {
      getAttribute: (attr: string) => marks[index][attr] ?? null,
      closest: (inner: string) => rest.closest(inner),
    };
  },
});

test('a click finds the nearest editable part, only in edit mode', () => {
  const inLink = element([
    { 'data-edit': 'items.0.label' },
    { 'data-edit': 'items.0.url', 'data-edit-kind': 'link' },
    { 'data-edit-block': 'b1' },
    { 'data-edit-mode': 'on' },
  ]);
  expect(editTargetOf(inLink)).toEqual({
    block: 'b1',
    path: 'items.0.label',
    kind: 'text',
  });
  const onLink = element([
    { 'data-edit': 'items.0.url', 'data-edit-kind': 'link' },
    { 'data-edit-mode': 'on' },
  ]);
  expect(editTargetOf(onLink)).toEqual({
    block: null,
    path: 'items.0.url',
    kind: 'link',
  });
  const off = element([{ 'data-edit': 'title' }, { 'data-edit-mode': 'off' }]);
  expect(editTargetOf(off)).toBeNull();
  const live = element([{ 'data-edit': 'title' }]);
  expect(editTargetOf(live)).toBeNull();
  expect(editTargetOf(null)).toBeNull();
});

for (const block of BLOCKS) {
  test(`${block.id}: what a visitor sees can be edited in place`, () => {
    const Component = BLOCK_COMPONENT(block);
    const takes = new Set([
      ...block.settings.map((field) => field.name),
      ...block.appOnly,
      ...LOOK_SETTINGS.map((field) => field.name as string),
    ]);
    const props = sampleProps(block.settings, block.id);
    const own = Object.fromEntries(
      Object.entries(props).filter(([key]) => takes.has(key))
    );
    const html = renderToString(
      createElement(Component, { ...appProps(block), ...own })
    );
    const page = [...walk(parse(html))];
    const marks = new Map(
      page
        .filter((node) => node.attrs[EDIT_ATTR])
        .map((node) => [node.attrs[EDIT_ATTR], node] as const)
    );
    const missing: string[] = [];

    for (const shown of shownValues(block.settings, own)) {
      const root = editPath(shown.path.split('.')[0]) ?? shown.path;
      if (NOT_IN_PLACE[`${block.id}.${root}`]) continue;
      if (shown.type === 'link' || shown.type === 'picture') {
        const onPage = page.some((node) =>
          Object.values(node.attrs).some((attr) => attr.includes(shown.value))
        );
        if (!onPage) continue;
        const mark = marks.get(shown.path);
        if (!mark || mark.attrs[EDIT_KIND_ATTR] !== shown.type) {
          missing.push(`${shown.path} (${shown.type})`);
        }
        continue;
      }
      // Words: every element that shows them is inside their part.
      const showing = page.filter((node) => ownText(node).includes(shown.value));
      for (const node of showing) {
        const mark = markOf(node);
        if (
          !mark ||
          mark.path !== shown.path ||
          (mark.kind !== 'text' && mark.kind !== 'longText')
        ) {
          missing.push(
            `${shown.path} ("${shown.value.slice(0, 30)}" in <${node.tag}>${
              mark ? `, marked ${mark.path} (${mark.kind})` : ''
            })`
          );
        }
      }
    }
    expect(missing, `${block.id} parts not editable in place`).toEqual([]);
  });
}
