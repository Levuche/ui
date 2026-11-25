import type { ReactNode } from 'react';
import { Skeleton } from '../atoms/skeleton';
import { liveView, type LiveProps } from '../system/live';

export type LiveDataLabels = {
  loading: string;
  stale: ReactNode;
};

export const LIVE_DATA_LABELS: LiveDataLabels = {
  loading: 'Loading',
  stale: 'Couldn’t refresh just now; showing the last update.',
};

/** A few skeleton lines, the usual stand-in while data loads. */
export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  return (
    <span className="flex flex-col gap-2">
      {Array.from({ length: lines }, (_, n) => (
        <Skeleton key={n} className={n === lines - 1 ? 'w-2/3' : undefined} />
      ))}
    </span>
  );
}

/**
 * Shows a live block's data, or the right thing when there isn't any: a
 * skeleton while it loads, the last good data with a quiet note when a
 * refresh failed, and nothing when there's no data at all. `children` draws
 * the data.
 */
export function LiveData<T>({
  data,
  loading,
  error,
  skeleton,
  empty = null,
  labels,
  children,
}: LiveProps<T> & {
  /** Shown while loading with no data yet. Three lines by default. */
  skeleton?: ReactNode;
  /** Shown when there's no data and nothing loading. Nothing by default. */
  empty?: ReactNode;
  labels?: Partial<LiveDataLabels>;
  children: (data: T) => ReactNode;
}) {
  const words = { ...LIVE_DATA_LABELS, ...labels };
  const view = liveView({ data, loading, error });
  if (view === 'loading') {
    return (
      <div role="status" aria-busy="true" aria-label={words.loading}>
        {skeleton ?? <SkeletonLines />}
      </div>
    );
  }
  if (view === 'error') {
    return typeof error === 'boolean' ? empty : <p className="m-0">{error}</p>;
  }
  if (view === 'empty' || data == null) return empty;
  return (
    <>
      {children(data)}
      {view === 'stale' ? (
        <p className="text-site-text-2 m-0 text-xs">{words.stale}</p>
      ) : null}
    </>
  );
}
