'use client';

import { useState } from 'react';
import { SiteButton, type ButtonLook } from '../atoms/button';
import { CheckIcon, CopyIcon } from '../atoms/icons';
import { usePreviewMode } from '../system/preview-mode';

export type CopyLabels = {
  copy: string;
  copied: string;
  /** Read out after a copy; {text} is what was copied. */
  copiedStatus: string;
  /** Read out when the copy failed; {text} is what to copy by hand. */
  failedStatus: string;
};

export const COPY_LABELS: CopyLabels = {
  copy: 'Copy',
  copied: 'Copied',
  copiedStatus: 'Copied {text}',
  failedStatus: 'Couldn’t copy. It’s {text}.',
};

// No clipboard on an http page or in an older browser: that's a failed copy,
// so the visitor is told the text, rather than nothing happening.
const clipboard = (text: string) =>
  navigator.clipboard
    ? navigator.clipboard.writeText(text)
    : Promise.reject(new Error('No clipboard here'));

/** A button that copies `text` and says so, to the eye and to screen readers. */
export function CopyButton({
  text,
  labels,
  copy = clipboard,
  onCopied,
  action = 'copy',
  variant,
  size = 'sm',
  className,
}: ButtonLook & {
  text: string;
  labels?: Partial<CopyLabels>;
  /** How to copy; defaults to the browser's clipboard. */
  copy?: (text: string) => Promise<void>;
  onCopied?: (text: string) => void;
  action?: string;
  className?: string;
}) {
  const words = { ...COPY_LABELS, ...labels };
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const preview = usePreviewMode();
  return (
    <>
      <SiteButton
        variant={variant}
        size={size}
        action={action}
        icon={
          state === 'copied' ? <CheckIcon size={18} /> : <CopyIcon size={18} />
        }
        onClick={() => {
          // The page editor selects the block; nothing is copied.
          if (preview) return;
          // A copy function that throws counts as a failed copy too.
          Promise.resolve()
            .then(() => copy(text))
            .then(
              () => {
                setState('copied');
                onCopied?.(text);
              },
              () => setState('failed')
            );
        }}
        className={className}
      >
        {state === 'copied' ? words.copied : words.copy}
      </SiteButton>
      <span role="status" className="sr-only">
        {state === 'copied'
          ? words.copiedStatus.replace('{text}', text)
          : state === 'failed'
            ? words.failedStatus.replace('{text}', text)
            : ''}
      </span>
    </>
  );
}
