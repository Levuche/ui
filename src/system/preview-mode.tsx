'use client';

import {
  createContext,
  use,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { cn } from './cn';
import { PREVIEW_ATTR, PREVIEW_EVENTS, previewStop } from './preview';

/*
 * Preview mode for the page editor; see preview.ts for how it works.
 * Only in the browser and in server rendering of client components.
 */

/** True inside a <PreviewMode>. Client blocks read it with usePreviewMode(). */
export const PreviewContext = createContext(false);

/**
 * Whether the block is shown in the page editor. A client block uses it to
 * skip what would leave the page: load a player, open a pop-up, copy, play.
 */
export function usePreviewMode(): boolean {
  return use(PreviewContext);
}

/**
 * Shows the blocks inside as a preview, for the page editor: they look
 * exactly as they do live, but links don't open, forms don't send, tracking
 * (useBlockActions) reports nothing and players from other sites show a still
 * placeholder. Every block stays in the tab order, and clicks still reach the
 * page, so the editor can select a block by pointer or keyboard.
 *
 *   <PreviewMode>
 *     <SitePage>...</SitePage>
 *   </PreviewMode>
 *
 * It wraps its children in one element with `display: contents`, so it
 * doesn't change the layout. `enabled={false}` turns it off, also for a part
 * inside another preview.
 */
export function PreviewMode({
  enabled = true,
  className,
  children,
}: {
  enabled?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Before the browser paints, so no click lands before the guard is there.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    // In the capture phase, before the browser or any block acts on it.
    const guard = (event: Event) => {
      const stop = previewStop(event);
      if (stop === 'none') return;
      event.preventDefault();
      if (stop === 'stop') event.stopPropagation();
    };
    for (const type of PREVIEW_EVENTS) {
      node.addEventListener(type, guard, true);
    }
    return () => {
      for (const type of PREVIEW_EVENTS) {
        node.removeEventListener(type, guard, true);
      }
    };
  }, [enabled]);
  return (
    <PreviewContext value={enabled}>
      <div
        ref={ref}
        {...{ [PREVIEW_ATTR]: enabled ? 'on' : 'off' }}
        className={cn('contents', className)}
      >
        {children}
      </div>
    </PreviewContext>
  );
}
