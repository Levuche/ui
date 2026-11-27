'use client';

import { useState } from 'react';
import { SiteButton, type ButtonLook } from '../atoms/button';
import { CheckIcon, CopyIcon } from '../atoms/icons';
import { editable, type EditPaths } from '../system/edit';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import { usePreviewMode } from '../system/preview-mode';

export type CopyLabels = {
  copy: string;
  copied: string;
  /** Read out after a copy; {text} is what was copied. */
  copiedStatus: string;
  /** Read out when the copy failed; {text} is what to copy by hand. */
  failedStatus: string;
};

export const COPY_LABELS: CopyLabels = WORDS_EN.copy;

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
  edit = {},
  className,
}: ButtonLook & {
  text: string;
  labels?: Partial<CopyLabels>;
  /** How to copy; defaults to the browser's clipboard. */
  copy?: (text: string) => Promise<void>;
  onCopied?: (text: string) => void;
  action?: string;
  /** Each word's setting path, for edit mode (see edit.ts). */
  edit?: EditPaths<keyof CopyLabels>;
  className?: string;
}) {
  const words = usePageWords('copy', labels);
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
        <span {...editable(state === 'copied' ? edit.copied : edit.copy)}>
          {state === 'copied' ? words.copied : words.copy}
        </span>
      </SiteButton>
      <span
        role="status"
        className="sr-only"
        {...editable(
          state === 'copied'
            ? edit.copiedStatus
            : state === 'failed'
              ? edit.failedStatus
              : undefined
        )}
      >
        {state === 'copied'
          ? words.copiedStatus.replace('{text}', text)
          : state === 'failed'
            ? words.failedStatus.replace('{text}', text)
            : ''}
      </span>
    </>
  );
}
