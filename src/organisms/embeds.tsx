import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { LinkIcon, PlayIcon } from '../atoms/icons';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { LinkTile } from '../molecules/link-tile';
import { PlayFrame } from '../molecules/play-frame';
import {
  embedFor,
  instagramEmbed,
  spotifyEmbed,
  tiktokEmbed,
  type Embed,
  type EmbedService,
} from '../system/embeds';
import { youtubeId } from './media';
import type { ImageSrc } from '../system/image';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import {
  consentNotice,
  OUTSIDE_SERVICES,
  type ConsentLabels,
} from '../system/privacy';

/** What every player from another site may do inside its frame. */
const SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation';

export type EmbedLabels = {
  /** The play button's name. {title} is filled in. */
  play: string;
};

export const EMBED_LABELS: EmbedLabels = WORDS_EN.embed;

type EmbedProps = BlockRootProps & {
  /** The link the creator pasted. */
  url: string;
  /** What's playing, for screen readers and the heading. */
  title: string;
  /** Shows the title above the player. */
  showTitle?: boolean;
  detail?: ReactNode;
  /** A picture shown until the visitor presses play. */
  poster?: ImageSrc | null;
  labels?: Partial<EmbedLabels>;
  /**
   * Whether the visitor agreed to the service, from the page's cookie
   * notice. False shows a notice and a Load button first; leave it out on
   * pages that don't ask.
   */
  consent?: boolean;
  consentLabels?: Partial<ConsentLabels>;
  headingAs?: HeadingTag;
};

/**
 * The player for an embed, or the link as a plain tile when the link isn't
 * one the block can play. Loads the other site only after a press.
 */
function EmbedBody({
  name,
  embed,
  url,
  title,
  showTitle = false,
  detail,
  poster,
  labels,
  consent,
  consentLabels,
  headingAs = 'h3',
  ...root
}: EmbedProps & { name: string; embed: Embed | null }) {
  const words = usePageWords('embed', labels);
  return (
    <Block name={name} data-service={embed?.service} {...root}>
      {showTitle ? (
        <ItemHead title={title} detail={detail} headingAs={headingAs} />
      ) : null}
      {embed ? (
        <PlayFrame
          src={embed.src}
          title={title}
          poster={poster}
          ratio={embed.shape}
          playLabel={words.play.replace('{title}', title)}
          playIcon={<PlayIcon size={28} />}
          sandbox={SANDBOX}
          action={`play_${embed.service}`}
          consent={consent}
          notice={consentNotice(
            OUTSIDE_SERVICES[embed.service].name,
            consentLabels
          )}
          consentLabels={consentLabels}
        />
      ) : (
        <LinkTile
          href={url}
          icon={<LinkIcon size={20} />}
          detail={detail}
          tileStyle="soft"
        >
          {title}
        </LinkTile>
      )}
    </Block>
  );
}

/** A Spotify track, album, playlist, podcast show or episode. */
export function SpotifyEmbed(props: EmbedProps) {
  return (
    <EmbedBody
      name="spotify-embed"
      embed={spotifyEmbed(props.url)}
      {...props}
    />
  );
}

/** One TikTok video, played in place. */
export function TikTokVideo(props: EmbedProps) {
  return (
    <EmbedBody name="tiktok-video" embed={tiktokEmbed(props.url)} {...props} />
  );
}

/** One Instagram post or reel. */
export function InstagramPost(props: EmbedProps) {
  return (
    <EmbedBody
      name="instagram-post"
      embed={instagramEmbed(props.url)}
      {...props}
    />
  );
}

/**
 * Any link from a service on the list (YouTube, Spotify, TikTok, Instagram,
 * Vimeo, SoundCloud and Loom) plays in place. Anything else is shown as a
 * link. `services` narrows the list.
 */
export function LinkEmbed({
  services,
  ...props
}: EmbedProps & { services?: readonly EmbedService[] }) {
  return (
    <EmbedBody
      name="link-embed"
      embed={embedFor(props.url, { services, youtubeId })}
      {...props}
    />
  );
}
