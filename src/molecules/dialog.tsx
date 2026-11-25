import { useId, type ReactNode, type Ref } from 'react';
import { cn } from '../system/cn';

const DIALOG_SIZES = {
  sm: 'w-[min(100%-2rem,24rem)]',
  lg: 'w-[min(100%-2rem,48rem)]',
} as const;

/**
 * A pop-up in the page's colours, on the browser's own dialog: open it with
 * `ref.current.showModal()`. The browser keeps focus inside, closes it on
 * Escape and dims the page; `onClose` is where focus goes back to the button
 * that opened it.
 */
export function SiteDialog({
  ref,
  title,
  size = 'sm',
  onClose,
  className,
  children,
}: {
  ref: Ref<HTMLDialogElement>;
  /** Names the dialog for screen readers, and shows as its heading. */
  title: ReactNode;
  size?: keyof typeof DIALOG_SIZES;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className={cn(
        'bg-site-surface text-site-text rounded-block p-block border-site-border backdrop:bg-site-surface/85 m-auto max-h-[calc(100dvh-2rem)] border shadow-xl backdrop:backdrop-blur-sm',
        DIALOG_SIZES[size],
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <p id={titleId} className="m-0 text-lg font-bold">
          {title}
        </p>
        {children}
      </div>
    </dialog>
  );
}
