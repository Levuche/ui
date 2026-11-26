import { useId, type CSSProperties, type ReactNode } from 'react';
import { SiteButton } from '../atoms/button';
import { cn } from '../system/cn';

/**
 * What a block shows in place of another site's player, map or page until
 * the visitor agrees: a line on what loading will share and a button that
 * loads it. The button's name starts with its words and ends with what it
 * loads, for screen readers; the notice is its description.
 */
export function ConsentCover({
  notice,
  load,
  title,
  action,
  onLoad,
  cover,
  className,
  style,
}: {
  /** What loading shares, as consentNotice gives it. */
  notice: string;
  /** The button's words, as "Load". */
  load: string;
  /** What it loads, as a video's title; read after the button's words. */
  title: string;
  /** What the press is called in `onAction`. */
  action?: string;
  onLoad: () => void;
  /** A picture behind the notice: the creator's own, never the service's. */
  cover?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const noticeId = useId();
  return (
    <div
      data-consent="pending"
      style={style}
      className={cn(
        'bg-site-surface-2 rounded-block-inner p-block relative flex w-full flex-col items-center justify-center',
        className
      )}
    >
      {cover}
      <div className="bg-site-surface text-site-text rounded-block-inner relative flex max-w-sm flex-col items-center gap-3 p-4 text-center">
        <p id={noticeId} className="m-0 text-sm">
          {notice}
        </p>
        <SiteButton
          size="sm"
          action={action}
          aria-label={`${load}: ${title}`}
          aria-describedby={noticeId}
          onClick={onLoad}
        >
          {load}
        </SiteButton>
      </div>
    </div>
  );
}
