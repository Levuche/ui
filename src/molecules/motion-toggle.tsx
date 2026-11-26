import { PauseIcon, PlayIcon } from '../atoms/icons';
import { cn } from '../system/cn';

/** What the pause button says to screen readers. */
export type MotionToggleLabels = {
  /** Said while it moves. */
  pause: string;
  /** Said while it's paused. */
  play: string;
};

/**
 * The pause button every block that keeps moving shows, as WCAG 2.2.2 asks
 * for anything that moves for more than five seconds. Hidden for visitors
 * who ask for less motion, since nothing moves for them.
 */
export function MotionToggle({
  playing,
  onToggle,
  labels,
  className,
}: {
  playing: boolean;
  onToggle: () => void;
  labels: MotionToggleLabels;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={playing ? labels.pause : labels.play}
      data-action={playing ? 'motion_pause' : 'motion_play'}
      onClick={onToggle}
      className={cn(
        'text-site-text size-control inline-flex flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 motion-reduce:hidden',
        className
      )}
    >
      {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
    </button>
  );
}
