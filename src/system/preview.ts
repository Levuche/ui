/*
 * Preview mode: blocks shown in the page editor exactly as they look live,
 * where a click selects the block instead of following it. Nothing a block
 * does in preview leaves the page: links don't open, forms don't send,
 * tracking reports nothing and players from other sites show a still
 * placeholder.
 *
 * Most blocks are Server Components, which can't read React context, so the
 * rule lives in the page instead: <PreviewMode> (preview-mode.tsx) marks the
 * part of the page that's a preview with data-preview="on" and stops what
 * leaves it there, whatever element did it. Client blocks also read
 * usePreviewMode() for what only they know, such as loading a player.
 * Nothing is removed or taken out of the tab order, so the editor can still
 * select any block from the keyboard.
 */

/** The attribute that marks a preview: "on", or "off" inside one to opt out. */
export const PREVIEW_ATTR = 'data-preview';

/** Set on a still placeholder drawn in place of another site's player. */
export const PREVIEW_PLACEHOLDER_ATTR = 'data-preview-placeholder';

/** The events <PreviewMode> listens to. */
export const PREVIEW_EVENTS = ['click', 'auxclick', 'submit'] as const;

/**
 * What follows or sends something when it's pressed: links, and the buttons
 * that submit or reset a form (a button with no type submits).
 */
export const PREVIEW_FOLLOWS = [
  'a[href]',
  'area[href]',
  'button:not([type])',
  'button[type="submit" i]',
  'button[type="reset" i]',
  'input[type="submit" i]',
  'input[type="image" i]',
  'input[type="reset" i]',
].join(', ');

/** The part of an element preview mode reads: a DOM element is one. */
type ClosestLike = {
  closest(selectors: string): {
    getAttribute(name: string): string | null;
  } | null;
};

const canClose = (node: unknown): node is ClosestLike =>
  typeof node === 'object' &&
  node !== null &&
  typeof (node as { closest?: unknown }).closest === 'function';

/**
 * True when `node` is inside a preview: the nearest data-preview around it
 * says "on". A data-preview="off" inside a preview opts that part out.
 */
export function inPreview(node: unknown): boolean {
  if (!canClose(node)) return false;
  return node.closest(`[${PREVIEW_ATTR}]`)?.getAttribute(PREVIEW_ATTR) === 'on';
}

/**
 * What preview mode does with an event:
 *
 * - `stop`: a form is being sent. The browser doesn't send it, and the
 *   block's own submit handler and React form actions never hear of it.
 * - `prevent`: a link or a submit button was pressed. The browser doesn't
 *   follow it, but the click still reaches the page, so the editor can
 *   select the block.
 * - `none`: anything else, or anything outside a preview.
 */
export function previewStop(event: {
  type: string;
  target: unknown;
}): 'stop' | 'prevent' | 'none' {
  if (!inPreview(event.target)) return 'none';
  if (event.type === 'submit') return 'stop';
  if (
    (event.type === 'click' || event.type === 'auxclick') &&
    canClose(event.target) &&
    event.target.closest(PREVIEW_FOLLOWS)
  ) {
    return 'prevent';
  }
  return 'none';
}
