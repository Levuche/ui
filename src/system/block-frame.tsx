'use client';
import {
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from './cn';

/*
 * The page editor's frame around each block: the block's name, and buttons to
 * move, copy, delete and set it, and to add a block under it. It's one
 * wrapper for every block, so no block has buttons of its own; the editor
 * puts it around each block it shows, inside <EditMode>:
 *
 *   <EditMode onEdit={save} onPick={openPanel}>
 *     <SitePage>
 *       {blocks.map((block, i) => (
 *         <BlockFrame key={block.id} id={block.id} label="Links"
 *           first={i === 0} last={i === blocks.length - 1}
 *           selected={block.id === selected} onSelect={setSelected}
 *           onMove={(by) => move(block.id, by)} onDelete={...} ...>
 *           <LinkList {...block.props} />
 *         </BlockFrame>
 *       ))}
 *     </SitePage>
 *   </EditMode>
 *
 * The frame also names the block for edit mode (`data-edit-block`), so the
 * block itself needs nothing added. A button shows only when its callback
 * is given. The buttons show under a pointer, while the frame or anything in
 * it has the keyboard, and while the block is selected, so a tap selects a
 * block on a touch screen and shows them. The frame only reports what was
 * pressed: the editor changes its list of blocks and saves it.
 */

/** Where a block dragged onto another goes. */
export type BlockDropPlace = 'before' | 'after';

/** What the frame's buttons say, for screen readers and as their tooltips. */
export interface BlockFrameLabels {
  drag: string;
  up: string;
  down: string;
  duplicate: string;
  settings: string;
  delete: string;
  add: string;
}

export const BLOCK_FRAME_LABELS: BlockFrameLabels = {
  drag: 'Drag to move',
  up: 'Move up',
  down: 'Move down',
  duplicate: 'Duplicate',
  settings: 'Settings',
  delete: 'Delete',
  add: 'Add a block below',
};

/** The type a dragged block carries, so a drop takes only blocks. */
const DRAG_TYPE = 'application/x-levuche-block';

export function BlockFrame({
  id,
  label,
  selected = false,
  first = false,
  last = false,
  onSelect,
  onMove,
  onDrop,
  onDuplicate,
  onSettings,
  onDelete,
  onAdd,
  labels,
  className,
  children,
}: {
  /** The block's id in the editor, given back to it and to edit mode. */
  id: string;
  /** The block's name, as "Links", on the frame and for screen readers. */
  label: string;
  selected?: boolean;
  /** No Move up on the first block, no Move down on the last. */
  first?: boolean;
  last?: boolean;
  /** A click or tap anywhere in the block, or the keyboard coming into it. */
  onSelect?: (id: string) => void;
  /** Move up (-1) or down (1): the buttons, or Alt+Up and Alt+Down. */
  onMove?: (by: -1 | 1) => void;
  /** Another block (`from`) dropped before or after this one. */
  onDrop?: (from: string, place: BlockDropPlace) => void;
  /** The Duplicate button, or Ctrl+D (⌘D). */
  onDuplicate?: () => void;
  /** The Settings button: the editor opens the block's panel. */
  onSettings?: () => void;
  /** The Delete button, or Delete or Backspace on the frame itself. */
  onDelete?: () => void;
  /** The button under the block: the editor offers the blocks to add. */
  onAdd?: () => void;
  labels?: Partial<BlockFrameLabels>;
  className?: string;
  children: ReactNode;
}) {
  const text = { ...BLOCK_FRAME_LABELS, ...labels };
  const [drop, setDrop] = useState<BlockDropPlace | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  // Moving a block can move its element in the page, which takes the
  // keyboard off it: give it back, to the same button or to the frame.
  const move = (by: -1 | 1) => {
    const had = document.activeElement;
    onMove?.(by);
    requestAnimationFrame(() => {
      const block = frame.current;
      if (!block || !had || !block.contains(had)) return;
      if (document.activeElement === had) return;
      const button = had as HTMLButtonElement;
      if (had !== block && !button.disabled) button.focus();
      else block.focus();
    });
  };

  // Only on the frame itself: in a text box these keys are typing.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const key = event.key;
    if ((key === 'Delete' || key === 'Backspace') && onDelete) onDelete();
    else if (event.altKey && key === 'ArrowUp' && !first && onMove) move(-1);
    else if (event.altKey && key === 'ArrowDown' && !last && onMove) move(1);
    else if (
      (event.ctrlKey || event.metaKey) &&
      key.toLowerCase() === 'd' &&
      onDuplicate
    ) {
      onDuplicate();
    } else return;
    event.preventDefault();
  };

  const dragged = (event: DragEvent) =>
    event.dataTransfer.types.includes(DRAG_TYPE);
  const placeOf = (event: DragEvent<HTMLDivElement>): BlockDropPlace => {
    const box = event.currentTarget.getBoundingClientRect();
    return event.clientY < box.top + box.height / 2 ? 'before' : 'after';
  };

  // The frame takes the keyboard so a block can be selected, moved, copied
  // and deleted without a pointer; its buttons do the same for both.
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={frame}
      data-block-frame=""
      data-edit-block={id}
      data-selected={selected ? '' : undefined}
      data-drop={drop ?? undefined}
      role="group"
      aria-label={label}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={cn('relative flex min-w-0 flex-col', className)}
      onClickCapture={() => onSelect?.(id)}
      onFocus={(event) => {
        if (event.target === event.currentTarget) onSelect?.(id);
      }}
      onKeyDown={onKeyDown}
      onDragOver={(event) => {
        if (!onDrop || !dragged(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDrop(placeOf(event));
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDrop(null);
        }
      }}
      onDrop={(event) => {
        setDrop(null);
        if (!onDrop || !dragged(event)) return;
        event.preventDefault();
        const from = event.dataTransfer.getData(DRAG_TYPE);
        if (from && from !== id) onDrop(from, placeOf(event));
      }}
    >
      <div data-block-frame-bar="" role="toolbar" aria-label={label}>
        <span data-block-frame-name="">{label}</span>
        <span data-block-frame-buttons="">
          {onDrop ? (
            <span
              data-block-frame-grip=""
              draggable
              title={text.drag}
              aria-hidden="true"
              onDragStart={(event) => {
                event.dataTransfer.setData(DRAG_TYPE, id);
                event.dataTransfer.effectAllowed = 'move';
                const block = event.currentTarget.closest('[data-block-frame]');
                if (block) event.dataTransfer.setDragImage(block, 24, 24);
              }}
            >
              <Icon d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
            </span>
          ) : null}
          {onMove ? (
            <>
              <Button label={text.up} disabled={first} onClick={() => move(-1)}>
                <Icon d="M12 19V5M5 12l7-7 7 7" />
              </Button>
              <Button label={text.down} disabled={last} onClick={() => move(1)}>
                <Icon d="M12 5v14M19 12l-7 7-7-7" />
              </Button>
            </>
          ) : null}
          {onDuplicate ? (
            <Button label={text.duplicate} onClick={onDuplicate}>
              <Icon d="M8 8h12v12H8zM16 8V4H4v12h4" />
            </Button>
          ) : null}
          {onSettings ? (
            <Button label={text.settings} onClick={onSettings}>
              <Icon d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button label={text.delete} danger onClick={onDelete}>
              <Icon d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </Button>
          ) : null}
        </span>
      </div>
      {children}
      {onAdd ? (
        <button
          type="button"
          data-block-frame-add=""
          aria-label={text.add}
          title={text.add}
          onClick={onAdd}
        >
          <Icon d="M12 5v14M5 12h14" />
        </button>
      ) : null}
    </div>
  );
}

function Button({
  label,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      data-danger={danger ? '' : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
