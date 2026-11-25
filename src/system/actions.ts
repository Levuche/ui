'use client';

import { useEffect, useRef, type RefObject } from 'react';

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
  /** Where a link goes. */
  href?: string;
};

/**
 * Reads a click or submit event into a BlockAction, or null when it wasn't
 * on a link, a button or a form. A link, button or form can name its action
 * with data-action, such as data-action="buy".
 */
export function readBlockAction(event: Event): BlockAction | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const control =
    event.type === 'submit'
      ? target.closest('form')
      : target.closest('a[href], button, [data-action]');
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
  return {
    action: named ?? fallback,
    block: control.closest('[data-block]')?.getAttribute('data-block') ?? null,
    label,
    ...(control instanceof HTMLAnchorElement ? { href: control.href } : {}),
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
