import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import type { CaptionStyle } from '../molecules/tile-caption';
import {
  VIDEO_LABELS,
  VideoFrame,
  type VideoLabels,
  type VideoRatio,
  type VideoTrack,
} from '../molecules/video-frame';
import { isSafeMediaSrc } from '../system/href';
import type { ImageSrc } from '../system/image';

export type VideoTileLabels = VideoLabels & {
  /** The link to the video's words. */
  transcript: string;
};

export const VIDEO_TILE_LABELS: VideoTileLabels = {
  ...VIDEO_LABELS,
  transcript: 'Transcript',
};

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
}) {
  if (!isSafeMediaSrc(src, 'video')) return null;
  const words = { ...VIDEO_TILE_LABELS, ...labels };
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
        className={ratio === 'tall' ? 'mx-auto w-full max-w-90' : undefined}
      />
      {transcriptHref ? (
        <SiteLink
          href={transcriptHref}
          action="video_transcript"
          className="min-h-control inline-flex items-center self-start text-sm font-semibold"
        >
          {words.transcript}
        </SiteLink>
      ) : null}
    </Block>
  );
}
