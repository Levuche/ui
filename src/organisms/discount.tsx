import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { cn } from '../system/cn';
import { CopyButton, type CopyLabels } from '../molecules/copy-button';

/**
 * A discount code the visitor copies with one tap. On the notice colour by
 * default.
 */
export function DiscountCode({
  code,
  detail,
  copy,
  labels,
  ...root
}: BlockRootProps & {
  code: string;
  /** As "10% off the reel pack". */
  detail?: ReactNode;
  /** How to copy; defaults to the browser's clipboard. */
  copy?: (text: string) => Promise<void>;
  labels?: Partial<CopyLabels>;
}) {
  return (
    <Block
      name="discount-code"
      defaults={{ tone: 'notice' }}
      {...root}
      className={cn('flex-row items-center gap-3', root.className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {detail ? <p className="m-0 text-sm">{detail}</p> : null}
        <code className="font-[inherit] text-lg font-bold tracking-wider break-all">
          {code}
        </code>
      </div>
      <CopyButton
        text={code}
        copy={copy}
        action="copy_code"
        className="flex-none"
        labels={{
          copy: 'Copy code',
          failedStatus: 'Couldn’t copy. The code is {text}.',
          ...labels,
        }}
      />
    </Block>
  );
}
