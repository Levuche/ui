import type { HTMLAttributes, ReactNode } from 'react';
import { SiteHeading } from '../atoms/text';
import { cn } from '../system/cn';

/** A part of the page with an optional heading above what's in it. */
export function SiteSection({
  title,
  action,
  headingAs = 'h2',
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  /** Something at the heading's far end, such as a "See all" link. */
  action?: ReactNode;
  headingAs?: 'h2' | 'h3';
}) {
  return (
    <section className={cn('flex flex-col gap-3', className)} {...props}>
      {title || action ? (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <SiteHeading as={headingAs} size="sm">
              {title}
            </SiteHeading>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
