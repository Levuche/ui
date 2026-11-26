'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { inPreview } from './preview';
import { readSell, type SellRef } from './sell';

/*
 * Clicks and sign-ups on blocks, for analytics (such as Buildbase tracking).
 * Blocks don't take a tracking callback: that would make every block a client
 * component. Instead one listener on the page reads what was clicked, and
 * the nearest data-block names the block. Blocks stay Server Components.
 */

/** Something a visitor did on a block. */
export type BlockAction = {
  /** As "link_click", "form_submit" or a block's own name, like "buy". */
  action: string;
  /** The block's id from the registry, such as "booking-card". */
  block: string | null;
  /** The visible words on what was clicked, cut to 100 characters. */
  label: string;
  /**
   * Where a link goes. For a link with data-href-private, without its query
   * and fragment, so a message the visitor wrote isn't tracked.
   */
  href?: string;
  /**
   * What the press buys, when the block sells through BuildBase: start the
   * checkout with it. Checked, but a visitor can change a page, so the
   * server checks the price again as checkout always does.
   */
  sell?: SellRef;
};

/**
 * Reads a click or submit event into a BlockAction, or null when it wasn't
 * on a link, a button or a form. A link, button or form can name its action
 * with data-action, such as data-action="buy". A form's action is reported
 * only when it's sent, never for a click inside it. Nothing is reported from
 * a block in preview mode (see PreviewMode): the editor isn't a visit.
 */
export function readBlockAction(event: Event): BlockAction | null {
  const target = event.target;
  if (!(target instanceof Element) || inPreview(target)) return null;
  const control =
    event.type === 'submit'
      ? target.closest('form')
      : // A form's data-action names its submit, so a click inside a form
        // (ticking its consent box, say) isn't that action.
        target.closest('a[href], button, [data-action]:not(form)');
  if (!control) return null;
  // A submit button is reported by the form's submit event instead.
  if (
    event.type === 'click' &&
    control instanceof HTMLButtonElement &&
    control.type === 'submit'
  ) {
    return null;
  }
  const named = control.getAttribute('data-action');
  const fallback =
    event.type === 'submit'
      ? 'form_submit'
      : control instanceof HTMLAnchorElement
        ? 'link_click'
        : 'button_click';
  const label = (
    control.getAttribute('aria-label') ??
    control.textContent ??
    ''
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  const sell = readSell(
    control instanceof HTMLFormElement
      ? (control.elements.namedItem('sell') as HTMLInputElement | null)?.value
      : control.getAttribute('data-sell')
  );
  return {
    action: named ?? fallback,
    block: control.closest('[data-block]')?.getAttribute('data-block') ?? null,
    label,
    ...(control instanceof HTMLAnchorElement
      ? {
          // A link marked data-href-private carries what a visitor typed
          // (a message card's text): report it without its query. A file
          // the page made itself (an .ics download) would carry the whole
          // file: report only what kind of file it is.
          href: /^(data|blob):/i.test(control.href)
            ? control.href.slice(0, 5).toLowerCase() === 'blob:'
              ? 'blob:'
              : control.href.split(/[;,]/, 1)[0]
            : control.hasAttribute('data-href-private')
              ? control.href.replace(/[?#].*$/s, '')
              : control.href,
        }
      : {}),
    ...(sell ? { sell } : {}),
  };
}

/**
 * Calls `onAction` for every link, button and form used inside `root` (or
 * the whole page). Use it once, in a client component near the top:
 *
 *   useBlockActions((a) => track(a.action, { block: a.block, label: a.label }));
 */
export function useBlockActions(
  onAction: (action: BlockAction) => void,
  root?: RefObject<HTMLElement | null>
) {
  const handler = useRef(onAction);
  useEffect(() => {
    handler.current = onAction;
  });
  useEffect(() => {
    const node: HTMLElement | Document = root?.current ?? document;
    const listen = (event: Event) => {
      const action = readBlockAction(event);
      if (action) handler.current(action);
    };
    node.addEventListener('click', listen, true);
    node.addEventListener('submit', listen, true);
    return () => {
      node.removeEventListener('click', listen, true);
      node.removeEventListener('submit', listen, true);
    };
  }, [root]);
}
