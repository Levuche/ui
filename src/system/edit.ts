/*
 * Edit mode: the page editor edits a block on the block itself. A creator
 * clicks a block's words and types them in place, or clicks a link or a
 * picture and the editor opens what sets it, next to it.
 *
 * Most blocks are Server Components, which can't read React context, so a
 * block only marks what can be edited, with plain data attributes:
 *
 *   <h2 {...editable('title')}>{title}</h2>
 *   <a {...editable('items.0.url', 'link')}>...</a>
 *
 * The path is the setting's name in the block's props, as the registry's
 * `settings` list has it: `title`, `items.0.label` for a list item's field,
 * `address.city` for a group's, `labels.subscribe` for one of the block's
 * words. <EditMode> (edit-mode.tsx) does the rest in the browser: it turns
 * a clicked text into a text box in the same place and look, and tells the
 * editor what changed. On a live page the marks do nothing.
 */

/** The attribute that marks an editable part: the setting's path. */
export const EDIT_ATTR = 'data-edit';

/** What kind of setting the part is (see EDIT_KINDS). */
export const EDIT_KIND_ATTR = 'data-edit-kind';

/**
 * Set by the app on each block's outermost element (every block passes
 * data-* props through), so an edit says which block it's for:
 *
 *   <LinkList data-edit-block={block.id} ... />
 */
export const EDIT_BLOCK_ATTR = 'data-edit-block';

/** Set on the part of the page that's in edit mode. */
export const EDIT_MODE_ATTR = 'data-edit-mode';

/** Set on the text box that's open in place of a part. */
export const EDITING_ATTR = 'data-editing';

/**
 * The kinds of editable part:
 *
 * - text: words on one line, typed in place
 * - longText: words over several lines, typed in place (Enter adds a line)
 * - link: a web address; the editor asks for it next to the part
 * - picture: a picture; the editor offers to change it
 * - setting: anything else set in the editor's panel, such as a date, a
 *   number or a product
 */
export const EDIT_KINDS = [
  'text',
  'longText',
  'link',
  'picture',
  'setting',
] as const;
export type EditKind = (typeof EDIT_KINDS)[number];

/** The kinds typed in place. The others are picked, for the editor to open. */
export const TYPED_KINDS: ReadonlySet<EditKind> = new Set(['text', 'longText']);

export type EditMarks = {
  'data-edit'?: string;
  'data-edit-kind'?: EditKind;
};

/**
 * The attributes that mark a part as editable, to spread on its element.
 * With no path (a part the creator can't set) it marks nothing.
 */
export function editable(
  path: string | undefined | null,
  kind: EditKind = 'text'
): EditMarks {
  if (!path) return {};
  return { [EDIT_ATTR]: path, [EDIT_KIND_ATTR]: kind };
}

/**
 * A setting's path from its parts: editPath('items', 2, 'label') is
 * "items.2.label". Empty parts are left out, so a molecule can take a base
 * path that may be missing: editPath(undefined, 'title') is "title".
 * With no base given where one is needed, pass `null` to mark nothing:
 * editPath(null, 'title') is undefined.
 */
export function editPath(
  ...parts: (string | number | undefined | null)[]
): string | undefined {
  if (parts.some((part) => part === null)) return undefined;
  const kept = parts.filter(
    (part): part is string | number => part !== undefined && part !== ''
  );
  return kept.length ? kept.join('.') : undefined;
}

/**
 * The paths a shared piece (a card's head, a tile, a price...) marks, one
 * per part it shows, as { title: 'items.0.title', image: 'items.0.image' }.
 * A part with no path isn't editable there.
 */
export type EditPaths<Part extends string> = Partial<Record<Part, string>>;

/** Each part's path under `base`: editPaths('items.0', ['title']). */
export function editPaths<Part extends string>(
  base: string | undefined | null,
  parts: readonly Part[]
): EditPaths<Part> {
  if (base === null || base === undefined) return {};
  return Object.fromEntries(
    parts.map((part) => [part, editPath(base, part)])
  ) as EditPaths<Part>;
}

/** What edit mode found under a click or a key press. */
export type EditTarget = {
  /** The block's data-edit-block, or null when the app set none. */
  block: string | null;
  /** The setting's path, as "items.0.label". */
  path: string;
  kind: EditKind;
};

/** The part of an element edit mode reads: a DOM element is one. */
type ElementLike = {
  closest(selectors: string): {
    getAttribute(name: string): string | null;
    closest(
      selectors: string
    ): { getAttribute(name: string): string | null } | null;
  } | null;
};

const canClose = (node: unknown): node is ElementLike =>
  typeof node === 'object' &&
  node !== null &&
  typeof (node as { closest?: unknown }).closest === 'function';

const isKind = (value: string | null): value is EditKind =>
  (EDIT_KINDS as readonly (string | null)[]).includes(value);

/**
 * The editable part around `node`, the nearest one, so a link's words are
 * typed in place while a click beside them picks the link. Null outside
 * edit mode, inside a part opted out with data-edit-mode="off", or where
 * nothing is editable.
 */
export function editTargetOf(node: unknown): EditTarget | null {
  if (!canClose(node)) return null;
  const mode = node.closest(`[${EDIT_MODE_ATTR}]`);
  if (mode?.getAttribute(EDIT_MODE_ATTR) !== 'on') return null;
  const part = node.closest(`[${EDIT_ATTR}]`);
  const path = part?.getAttribute(EDIT_ATTR);
  if (!part || !path) return null;
  const kind = part.getAttribute(EDIT_KIND_ATTR);
  return {
    block:
      part.closest(`[${EDIT_BLOCK_ATTR}]`)?.getAttribute(EDIT_BLOCK_ATTR) ??
      null,
    path,
    kind: isKind(kind) ? kind : 'text',
  };
}

/**
 * What was typed, as the setting's value: one line for `text`, with the
 * lines a creator broke it into joined by spaces; for `longText`, the lines
 * as typed, without the empty ones a text box leaves at the end.
 */
export function editedText(kind: EditKind, typed: string): string {
  const lines = typed.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ');
  if (kind === 'longText') return lines.replace(/\n+$/, '').trim();
  return lines.replace(/\s*\n\s*/g, ' ').trim();
}
