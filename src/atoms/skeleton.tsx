import { cn } from '../system/cn';

/**
 * Grey shapes where content is on its way. It pulses unless the visitor asks
 * for less motion, and screen readers skip it: the block says it's loading.
 */
export function Skeleton({
  shape = 'line',
  className,
}: {
  shape?: 'line' | 'box' | 'circle';
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-site-surface-2 block motion-safe:animate-pulse',
        shape === 'line' && 'rounded-site h-3.5 w-full',
        shape === 'box' && 'rounded-block-inner aspect-video w-full',
        shape === 'circle' && 'size-12 rounded-full',
        className
      )}
    />
  );
}
