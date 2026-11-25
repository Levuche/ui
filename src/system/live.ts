import type { ReactNode } from 'react';

/*
 * Blocks that show data from another service (GitHub, npm, YouTube, a feed)
 * never fetch it themselves. The app's server fetches it, caches it and
 * passes it in, so keys stay on the server and every visitor doesn't call
 * the service. Each such block takes these props beside its own.
 */
export type LiveProps<T> = {
  /** The data, typed by the block. `null` or left out: none yet. */
  data?: T | null;
  /** The app is fetching it. With no data yet the block shows a skeleton. */
  loading?: boolean;
  /**
   * The last fetch failed. With data, the block still shows it, with a quiet
   * note; with none, it shows nothing, or this when it's words.
   */
  error?: boolean | ReactNode;
  /** When the data was fetched, for the "updated" line. */
  updatedAt?: Date | string;
};

/** What a live block should show for its props. */
export function liveView<T>({ data, loading, error }: LiveProps<T>) {
  if (data != null) return error ? 'stale' : 'data';
  if (loading) return 'loading';
  if (error) return 'error';
  return 'empty';
}
