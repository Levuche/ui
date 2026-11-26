import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { cn } from '../system/cn';
import {
  COPY_LABELS,
  CopyButton,
  type CopyLabels,
} from '../molecules/copy-button';
import { usePageWords } from '../system/page-words';
import { WORDS_EN } from '../system/words/en';

/** The words a discount code shows, which name the code rather than text. */
export const DISCOUNT_CODE_LABELS: CopyLabels = {
  ...COPY_LABELS,
  copy: WORDS_EN.props.copyCode,
  failedStatus: WORDS_EN.props.copyCodeFailed,
};

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
  const own = usePageWords('props');
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
          copy: own.copyCode,
          failedStatus: own.copyCodeFailed,
          ...labels,
        }}
      />
    </Block>
  );
}
