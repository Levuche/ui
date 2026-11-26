'use client';

import { useEffect, useState, type RefObject } from 'react';

/*
 * The browser side of the block effects (BlockLook.effect). The effects
 * themselves are CSS (see tokens.css), so blocks stay Server Components; one
 * useBlockEffects on the page holds a block's loop while it's off screen and
 * makes `tilt` follow the pointer.
 */

/** How far a tilted block leans, in degrees, at its edges. */
const TILT = 4;

const lessMotion = () =>
  typeof matchMedia === 'function' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Whether the element is on screen. True on the server and until the
 * browser says otherwise, so the first render is the same on both.
 */
export function useOnScreen(ref: RefObject<Element | null>): boolean {
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setOnScreen(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return onScreen;
}

/**
 * Runs the block effects inside `root` (or the whole page): a block with a
 * loop holds still while it's off screen (data-offscreen), and a block with
 * `effect="tilt"` leans a little towards the mouse. Blocks added later, as in
 * the page editor, are picked up too. Use it once, in a client component near
 * the top, or render <BlockEffects /> once.
 */
export function useBlockEffects(root?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node: HTMLElement = root?.current ?? document.body;
    const watched = new WeakSet<Element>();
    const visible =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) {
              entry.target.toggleAttribute(
                'data-offscreen',
                !entry.isIntersecting
              );
            }
          })
        : null;
    const watch = () => {
      if (!visible) return;
      for (const el of node.querySelectorAll('[data-effect]')) {
        if (watched.has(el)) continue;
        watched.add(el);
        visible.observe(el);
      }
    };
    watch();
    const added =
      typeof MutationObserver === 'function'
        ? new MutationObserver(watch)
        : null;
    added?.observe(node, { childList: true, subtree: true });

    const tilted = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLElement>('[data-effect="tilt"]')
        : null;
    const lean = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || lessMotion()) return;
      const el = tilted(event.target);
      if (!el) return;
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      el.style.setProperty('--tilt-x', `${(x * 2 * TILT).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(-y * 2 * TILT).toFixed(2)}deg`);
    };
    const settle = (event: PointerEvent) => {
      const el = tilted(event.target);
      if (!el || el.contains(event.relatedTarget as Node | null)) return;
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
    };
    node.addEventListener('pointermove', lean);
    node.addEventListener('pointerout', settle);
    return () => {
      visible?.disconnect();
      added?.disconnect();
      node.removeEventListener('pointermove', lean);
      node.removeEventListener('pointerout', settle);
    };
  }, [root]);
}

/**
 * useBlockEffects as a component that draws nothing, for a page that is
 * otherwise a Server Component: put <BlockEffects /> once on the page.
 */
export function BlockEffects() {
  useBlockEffects();
  return null;
}
