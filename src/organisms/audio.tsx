import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { AudioBar, type AudioBarLabels } from '../molecules/audio-bar';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { LiveData } from '../molecules/live-data';
import type { LiveProps } from '../system/live';
import type { ImageSrc } from '../system/image';
import { consentNotice, siteName, type ConsentLabels } from '../system/privacy';

type AudioConsent = {
  /**
   * Whether the visitor agreed to the sites the audio is on, from the page's
   * cookie notice. False shows a line on what pressing play shares; leave it
   * out on pages that don't ask. Audio on the page's own site needs none.
   */
  consent?: boolean;
  /** `load` isn't used: the play button loads the audio. */
  consentLabels?: Partial<ConsentLabels>;
};

/**
 * The line under a player, when the visitor hasn't agreed to the sites its
 * audio is on. Nothing downloads before play, so play is the agreement.
 */
function AudioNotice({
  sources,
  consent,
  consentLabels,
}: AudioConsent & { sources: string[] }) {
  if (consent !== false) return null;
  const sites = [
    ...new Set(sources.map(siteName).filter((s): s is string => !!s)),
  ];
  if (!sites.length) return null;
  return (
    <p data-consent="pending" className="text-site-text-2 m-0 text-sm">
      {consentNotice(sites.join(', '), consentLabels)}
    </p>
  );
}

/** One track: play, pause, a bar to move through it, and the time. */
export function AudioPlayer({
  src,
  title,
  detail,
  image,
  transcriptHref,
  heading,
  labels,
  consent,
  consentLabels,
  headingAs = 'h3',
  ...root
}: BlockRootProps &
  AudioConsent & {
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
      <AudioNotice
        sources={[src]}
        consent={consent}
        consentLabels={consentLabels}
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
  consent,
  consentLabels,
  headingAs = 'h2',
  ...root
}: BlockRootProps &
  AudioConsent &
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
            <AudioNotice
              sources={episodes.slice(0, limit).map((e) => e.audioUrl)}
              consent={consent}
              consentLabels={consentLabels}
            />
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
