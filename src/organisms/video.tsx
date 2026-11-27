import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import {
  VideoFrame,
  type VideoLabels,
  type VideoTrack,
} from '../molecules/video-frame';
import type { CaptionStyle, VideoRatio } from '../system/gallery';
import { editable } from '../system/edit';
import { isSafeMediaSrc } from '../system/href';
import type { ImageSrc } from '../system/image';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';
import { MediaNotice } from '../molecules/media-notice';
import type { ConsentLabels } from '../system/privacy';

export type VideoTileLabels = VideoLabels & {
  /** The link to the video's words. */
  transcript: string;
};

export const VIDEO_TILE_LABELS: VideoTileLabels = WORDS_EN.videoTile;

/**
 * A video the creator uploaded (mp4, mov or webm), with its first frame or a
 * cover picture. It plays with sound only when pressed. With `loop` it plays
 * without sound, round and round, and a button plays it with sound; never
 * for visitors who ask their device for less motion. Captions come from
 * `tracks`, and `transcriptHref` links to the words.
 */
export function VideoTile({
  src,
  title,
  poster,
  ratio = 'video',
  loop = false,
  tracks,
  caption,
  captionStyle = 'below',
  transcriptHref,
  labels,
  consent,
  consentLabels,
  ...root
}: BlockRootProps & {
  /** The video file's address. */
  src: string;
  /** What the video is, for screen readers, such as "Pouring chai". */
  title: string;
  /** The cover picture; left empty, the video's first frame. */
  poster?: ImageSrc | null;
  /** The shape: wide (16:9), tall (9:16) for a phone video, square or 4:5. */
  ratio?: VideoRatio;
  /** Play without sound, round and round, while on the screen. */
  loop?: boolean;
  /** Captions or subtitles, as WebVTT files. */
  tracks?: VideoTrack[];
  caption?: ReactNode;
  /** Where the caption sits: under the video, or over it. */
  captionStyle?: CaptionStyle;
  /** A page with the video's words, for visitors who can't watch or hear it. */
  transcriptHref?: string;
  labels?: Partial<VideoTileLabels>;
  /**
   * Whether the visitor agreed to the site the video is on, from the page's
   * cookie notice. False shows a line on what pressing play shares, and
   * nothing downloads or loops before it; leave it out on pages that don't
   * ask. A video on the page's own site needs none.
   */
  consent?: boolean;
  /** `load` isn't used: the play button loads the video. */
  consentLabels?: Partial<ConsentLabels>;
}) {
  const words = usePageWords('videoTile', labels);
  if (!isSafeMediaSrc(src, 'video')) return null;
  return (
    <Block name="video-tile" defaults={{ tone: 'plain' }} {...root}>
      <VideoFrame
        src={src}
        title={title}
        poster={poster}
        ratio={ratio}
        loop={loop}
        tracks={tracks}
        caption={caption}
        captionStyle={captionStyle}
        labels={words}
        consent={consent}
        edit={{
          src: 'src',
          poster: 'poster',
          caption: 'caption',
          tracks: 'tracks',
        }}
        className={ratio === 'tall' ? 'mx-auto w-full max-w-90' : undefined}
      />
      {transcriptHref ? (
        <SiteLink
          href={transcriptHref}
          action="video_transcript"
          className="min-h-control inline-flex items-center self-start text-sm font-semibold"
          {...editable('transcriptHref', 'link')}
        >
          <span {...editable('labels.transcript')}>{words.transcript}</span>
        </SiteLink>
      ) : null}
      <MediaNotice
        sources={[src]}
        consent={consent}
        consentLabels={consentLabels}
      />
    </Block>
  );
}
