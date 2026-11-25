import type { HTMLAttributes } from 'react';
import { cn } from '../system/cn';

/**
 * The column a creator's page sits in: centred and full width on a phone. On a
 * tablet or desktop it grows to max-w-site (576 px) and no further, so blocks
 * read comfortably without stretching across a big screen. `wide` (768 px)
 * suits a page of grids. `gap` is the space between blocks.
 */
export function SitePage({
  as: Tag = 'div',
  width = 'page',
  gap = 'md',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'main';
  width?: 'page' | 'wide';
  gap?: 'sm' | 'md' | 'lg';
}) {
  const gaps = { sm: 'gap-4', md: 'gap-6', lg: 'gap-8' };
  return (
    <Tag
      className={cn(
        'mx-auto flex w-full flex-col',
        gaps[gap] ?? gaps.md,
        width === 'wide' ? 'max-w-site-wide' : 'max-w-site',
        className
      )}
      {...props}
    />
  );
}
