'use client';

import { useState, type ReactNode } from 'react';
import { siteButtonClasses } from './basics';
import { cn } from './cn';
import { CheckIcon, CopyIcon } from './icons';

const clipboard = (text: string) => navigator.clipboard.writeText(text);

/** A discount code the visitor copies with one tap. */
export function DiscountCode({
  code,
  detail,
  copy = clipboard,
  className,
}: {
  code: string;
  /** As "10% off the reel pack". */
  detail?: ReactNode;
  /** How to copy; defaults to the browser's clipboard. */
  copy?: (text: string) => Promise<void>;
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <div
      className={cn(
        'bg-site-notice text-site-on-notice rounded-site flex items-center gap-3 p-3.5',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {detail ? <p className="m-0 text-sm">{detail}</p> : null}
        <code className="font-[inherit] text-lg font-bold tracking-wider break-all">
          {code}
        </code>
      </div>
      <button
        type="button"
        onClick={() => {
          copy(code).then(
            () => setState('copied'),
            () => setState('failed')
          );
        }}
        className={siteButtonClasses({ size: 'sm', className: 'flex-none' })}
      >
        {state === 'copied' ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
        {state === 'copied' ? 'Copied' : 'Copy code'}
      </button>
      <span role="status" className="sr-only">
        {state === 'copied'
          ? `Copied ${code}`
          : state === 'failed'
            ? `Couldn’t copy. The code is ${code}.`
            : ''}
      </span>
    </div>
  );
}
