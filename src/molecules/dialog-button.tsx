'use client';

import { useRef, type ReactNode } from 'react';
import { SiteButton, type SiteButtonVariant } from '../atoms/button';
import { SiteDialog } from './dialog';
import { usePreviewMode } from '../system/preview-mode';

/**
 * A button that opens a pop-up holding `children`, with a close button under
 * them. Focus goes back to the button when the pop-up closes. The children
 * can come from a server component, so a block stays server-rendered and only
 * this button runs in the browser. In preview mode (the page editor) the
 * button opens nothing.
 */
export function DialogButton({
  label,
  title,
  closeLabel,
  variant,
  icon,
  action = 'open',
  fullWidth = true,
  size = 'sm',
  onOpen,
  children,
}: {
  /** The words on the button. */
  label: ReactNode;
  /** The pop-up's heading, which also names it for screen readers. */
  title: ReactNode;
  /** The words on the close button. */
  closeLabel: ReactNode;
  variant?: SiteButtonVariant;
  icon?: ReactNode;
  /** What the press is called in `onAction`. */
  action?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'lg';
  onOpen?: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const preview = usePreviewMode();
  return (
    <>
      <SiteButton
        ref={trigger}
        variant={variant}
        icon={icon}
        action={action}
        aria-haspopup="dialog"
        fullWidth={fullWidth}
        onClick={() => {
          if (preview) return;
          dialog.current?.showModal();
          onOpen?.();
        }}
      >
        {label}
      </SiteButton>
      <SiteDialog
        ref={dialog}
        title={title}
        size={size}
        onClose={() => trigger.current?.focus()}
      >
        {children}
        <SiteButton
          variant="outline"
          action={`${action}_close`}
          fullWidth
          onClick={() => dialog.current?.close()}
        >
          {closeLabel}
        </SiteButton>
      </SiteDialog>
    </>
  );
}
