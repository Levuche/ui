import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { AudioBar, type AudioBarLabels } from '../molecules/audio-bar';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { LiveData } from '../molecules/live-data';
import type { LiveProps } from '../system/live';
import type { ImageSrc } from '../system/image';

/** One track: play, pause, a bar to move through it, and the time. */
export function AudioPlayer({
  src,
  title,
  detail,
  image,
  transcriptHref,
  heading,
  labels,
  headingAs = 'h3',
  ...root
}: BlockRootProps & {
  src: string;
  title: string;
  /** Such as the artist. */
  detail?: ReactNode;
  image?: ImageSrc | null;
  /** A page with the words, for visitors who can't listen. */
  transcriptHref?: string;
  /** A heading above the player, such as "My new single". */
  heading?: ReactNode;
  labels?: Partial<AudioBarLabels>;
  headingAs?: HeadingTag;
}) {
  return (
    <Block name="audio-player" {...root}>
      {heading ? <ItemHead title={heading} headingAs={headingAs} /> : null}
      <AudioBar
        src={src}
        title={title}
        detail={detail}
        image={image}
        transcriptHref={transcriptHref}
        labels={labels}
      />
    </Block>
  );
}

/** One podcast episode, as the app reads it from the show's feed. */
export type PodcastEpisode = {
  title: string;
  audioUrl: string;
  /** As the visitor reads it, such as "12 Nov 2026 · 42 min". */
  detail?: string;
  /** The episode's own page. */
  href?: string;
  image?: ImageSrc | null;
  /** A page with the episode's words. */
  transcriptUrl?: string;
};

/**
 * The newest episodes of a podcast, each with its own player. The app reads
 * the show's feed on its server and passes the episodes in.
 */
export function PodcastEpisodes({
  data,
  loading,
  error,
  title,
  limit = 5,
  allHref,
  allLabel = 'All episodes',
  labels,
  headingAs = 'h2',
  ...root
}: BlockRootProps &
  LiveProps<PodcastEpisode[]> & {
    title?: ReactNode;
    limit?: number;
    /** The show's page, for a link under the list. */
    allHref?: string;
    allLabel?: ReactNode;
    labels?: Partial<AudioBarLabels>;
    headingAs?: HeadingTag;
  }) {
  return (
    <Block name="podcast-episodes" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <LiveData data={data} loading={loading} error={error}>
        {(episodes) => (
          <>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {episodes.slice(0, limit).map((episode) => (
                <li key={episode.audioUrl}>
                  <AudioBar
                    src={episode.audioUrl}
                    title={episode.title}
                    detail={episode.detail}
                    image={episode.image}
                    transcriptHref={episode.transcriptUrl}
                    labels={labels}
                  />
                </li>
              ))}
            </ul>
            {allHref ? (
              <SiteLink
                href={allHref}
                newTab
                action="podcast_all"
                className="self-start text-sm font-semibold"
              >
                {allLabel}
              </SiteLink>
            ) : null}
          </>
        )}
      </LiveData>
    </Block>
  );
}
