'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from './cn';
import {
  EDITING_ATTR,
  EDIT_ATTR,
  EDIT_MODE_ATTR,
  TYPED_KINDS,
  editTargetOf,
  editedText,
  type EditTarget,
} from './edit';
import { PreviewMode } from './preview-mode';

/*
 * Edit mode for the page editor; see edit.ts for how blocks mark what can
 * be edited. Only in the browser.
 */

/** A setting typed in place, for the editor to save. */
export type EditChange = EditTarget & { value: string };

/**
 * A part picked to be set in the editor, with where it is on screen. `around`
 * lists the editable parts it sits in, nearest first, such as the link a
 * picture fills, so the editor can offer those too.
 */
export type EditPick = EditTarget & {
  element: HTMLElement;
  around: EditTarget[];
};

/** Marks the parts edit mode made focusable, so it can undo that. */
const TAB_ATTR = 'data-edit-tab';

/** Elements a keyboard already reaches. */
const FOCUSABLE =
  'a[href], button, input, select, textarea, summary, [tabindex]';

/**
 * Shows the blocks inside as they look live and lets a creator edit them
 * there. It's a <PreviewMode> too: links don't open and forms don't send.
 *
 * - Words (`text` and `longText` parts) open as a text box in the same place
 *   and look when clicked, or on Enter or F2 from the keyboard. Enter (or
 *   Ctrl+Enter over several lines) or leaving the box keeps what was typed;
 *   Escape puts it back. `onEdit` hears the new value when it changed.
 * - Links, pictures and other settings call `onPick`, with the element, so
 *   the editor can open what sets it beside it, and the parts around it
 *   (`around`), so a picture that fills a link can offer the link too.
 *
 * Every editable part can be reached with Tab. `readValue` gives the text
 * a box starts with, when the page shows it otherwise (formatted, say, or
 * cut short); without it the box starts with the words as shown.
 * `describe` names the box for screen readers, as "Title".
 *
 *   <EditMode onEdit={save} onPick={openPanel}>
 *     <LinkList data-edit-block={block.id} {...block.props} />
 *   </EditMode>
 */
export function EditMode({
  enabled = true,
  onEdit,
  onPick,
  readValue,
  describe,
  className,
  children,
}: {
  enabled?: boolean;
  onEdit?: (change: EditChange) => void;
  onPick?: (pick: EditPick) => void;
  readValue?: (target: EditTarget) => string | undefined;
  describe?: (target: EditTarget) => string | undefined;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // The latest callbacks, so the listeners below needn't be added again.
  const calls = useRef({ onEdit, onPick, readValue, describe });
  useEffect(() => {
    calls.current = { onEdit, onPick, readValue, describe };
  });

  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    let close: ((keep: boolean) => void) | null = null;

    // Every editable part in the tab order, also those a block adds later.
    const reach = () => {
      for (const part of root.querySelectorAll<HTMLElement>(`[${EDIT_ATTR}]`)) {
        if (part.matches(FOCUSABLE)) continue;
        part.tabIndex = 0;
        part.setAttribute(TAB_ATTR, '');
      }
    };
    reach();
    const watch = new MutationObserver(reach);
    watch.observe(root, { childList: true, subtree: true });

    /**
     * Opens a text box in place of `part`. The box is a copy of the part,
     * so it looks the same, and the part itself is hidden until the box
     * closes: React keeps rendering the part, which is never changed here.
     */
    const type = (part: HTMLElement, target: EditTarget) => {
      close?.(true);
      const start = calls.current.readValue?.(target);
      const box = part.cloneNode(true) as HTMLElement;
      box.removeAttribute(EDIT_ATTR);
      box.removeAttribute(TAB_ATTR);
      box.removeAttribute('id');
      box.setAttribute(EDITING_ATTR, target.kind);
      if (start !== undefined) box.textContent = start;
      const before = start ?? part.innerText;
      try {
        box.contentEditable = 'plaintext-only';
      } catch {
        box.contentEditable = 'true';
      }
      box.setAttribute('role', 'textbox');
      box.tabIndex = 0;
      if (target.kind === 'longText') box.setAttribute('aria-multiline', 'true');
      const name = calls.current.describe?.(target);
      if (name) box.setAttribute('aria-label', name);
      part.hidden = true;
      part.after(box);
      box.focus();
      const caret = document.createRange();
      caret.selectNodeContents(box);
      caret.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(caret);

      const done = (keep: boolean) => {
        if (close !== done) return;
        close = null;
        const value = editedText(target.kind, box.innerText);
        const hadFocus = box.contains(document.activeElement);
        box.remove();
        part.hidden = false;
        if (hadFocus) part.focus({ preventScroll: true });
        if (keep && value !== editedText(target.kind, before)) {
          calls.current.onEdit?.({ ...target, value });
        }
      };
      close = done;
      box.addEventListener('blur', () => done(true));
      box.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          done(false);
        } else if (
          event.key === 'Enter' &&
          (target.kind === 'text' || event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          done(true);
        }
      });
      // A click in the box is typing, not a click on the block.
      box.addEventListener('click', (event) => event.stopPropagation());
    };

    const open = (node: EventTarget | null) => {
      const target = editTargetOf(node);
      if (!target || !(node instanceof Element)) return false;
      const part = node.closest<HTMLElement>(`[${EDIT_ATTR}]`);
      if (!part || !root.contains(part)) return false;
      if (TYPED_KINDS.has(target.kind)) type(part, target);
      else {
        const around: EditTarget[] = [];
        let outer = part.parentElement?.closest<HTMLElement>(`[${EDIT_ATTR}]`);
        while (outer && root.contains(outer)) {
          const found = editTargetOf(outer);
          if (found) around.push(found);
          outer = outer.parentElement?.closest<HTMLElement>(`[${EDIT_ATTR}]`);
        }
        calls.current.onPick?.({ ...target, element: part, around });
      }
      return true;
    };

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      open(event.target);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== 'F2') return;
      const part = event.target;
      if (!(part instanceof HTMLElement) || !part.hasAttribute(EDIT_ATTR)) {
        return;
      }
      if (open(part)) event.preventDefault();
    };
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    return () => {
      close?.(false);
      watch.disconnect();
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKey);
      for (const part of root.querySelectorAll<HTMLElement>(`[${TAB_ATTR}]`)) {
        part.removeAttribute('tabindex');
        part.removeAttribute(TAB_ATTR);
      }
    };
  }, [enabled]);

  return (
    <div
      ref={ref}
      {...{ [EDIT_MODE_ATTR]: enabled ? 'on' : 'off' }}
      className={cn('contents', className)}
    >
      <PreviewMode enabled={enabled}>{children}</PreviewMode>
    </div>
  );
}
