import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { Thumb } from '../atoms/thumb';
import { cn } from '../system/cn';
import { editable, editPath } from '../system/edit';
import { PlayFrame } from '../molecules/play-frame';
import { columnSizes, type ImageSrc } from '../system/image';
import { OUTSIDE_SERVICES, type ConsentLabels } from '../system/privacy';
import { usePageWords } from '../system/page-words';

/** Reel thumbnails in a grid of three (9:14), each one a link if given. */
export function ReelGrid({
  reels,
  columns = 3,
  ...root
}: BlockRootProps & {
  reels: { image?: ImageSrc | null; label?: string; href?: string }[];
  columns?: 2 | 3 | 4;
}) {
  const own = usePageWords('props');
  return (
    <Block name="reel-grid" defaults={{ tone: 'plain' }} {...root}>
      <ul
        className={cn(
          'm-0 grid list-none gap-2 p-0',
          columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
          columns === 4 && 'md:grid-cols-4'
        )}
      >
        {reels.map((reel, i) => {
          const tile = (
            <Thumb
              src={reel.image}
              ratio="reel"
              sizes={columnSizes(1 / columns, 1 / Math.min(columns, 3))}
              className="w-full"
              marks={editable(editPath('reels', i, 'image'), 'picture')}
            />
          );
          return (
            <li key={i} className="m-0">
              {reel.href ? (
                <SiteLink
                  href={reel.href}
                  newTab
                  action="open_reel"
                  {...editable(editPath('reels', i, 'href'), 'link')}
                  aria-label={
                    reel.label?.trim() || own.reel.replace('{n}', String(i + 1))
                  }
                  className="block"
                >
                  {tile}
                </SiteLink>
              ) : (
                tile
              )}
            </li>
          );
        })}
      </ul>
    </Block>
  );
}

/**
 * The 11-character video id from a YouTube address the creator pastes:
 * youtube.com/watch?v=, youtu.be/, /shorts/, /embed/ or /live/. Null when it
 * isn't a YouTube video.
 */
export function youtubeId(input: string): string | null {
  const ID = /^[\w-]{11}$/;
  const value = input.trim();
  if (ID.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const [, kind, rest] = url.pathname.split('/');
    id =
      kind === 'watch'
        ? url.searchParams.get('v')
        : ['shorts', 'embed', 'live'].includes(kind ?? '')
          ? (rest ?? null)
          : null;
  }
  return id && ID.test(id) ? id : null;
} /**
 * A YouTube video on the creator's page. It shows the video's picture and a
 * play button first, and loads YouTube (in its privacy-enhanced mode) only
 * when the visitor presses play, so the page stays fast and sets no YouTube
 * cookies until then. With `consent={false}` it also skips YouTube's picture
 * and says what loading will share before the visitor presses Load.
 */
export function YouTubeVideo({
  video,
  title,
  poster,
  vertical = false,
  start,
  playLabel,
  consent,
  consentLabels,
  ...root
}: BlockRootProps & {
  /** The video's address or id. */
  video: string;
  /** What the video is, for screen readers, such as "How tea came to India". */
  title: string;
  /** A picture to show before play; defaults to YouTube's own. */
  poster?: ImageSrc | null;
  /** True for a Short (9:16). */
  vertical?: boolean;
  /** Start this many seconds in. */
  start?: number;
  /** The play button's name; defaults to "Play: {title}" in the page’s language. */
  playLabel?: string;
  /**
   * Whether the visitor agreed to YouTube, from the page's cookie notice.
   * False shows a notice and a Load button first; leave it out on pages
   * that don't ask.
   */
  consent?: boolean;
  consentLabels?: Partial<ConsentLabels>;
}) {
  const id = youtubeId(video);
  if (!id) return null;
  const from = start && start > 0 ? `&start=${Math.floor(start)}` : '';
  return (
    <Block name="youtube-video" defaults={{ tone: 'plain' }} {...root}>
      {/* The cover picture, or YouTube's own when it's left empty. */}
      <div {...editable('poster', 'picture')}>
        <PlayFrame
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${from}`}
          title={title}
          playLabel={playLabel}
          poster={
            poster === undefined && consent !== false
              ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
              : poster
          }
          ratio={vertical ? 'vertical' : 'video'}
          consent={consent}
          site={OUTSIDE_SERVICES.youtube.name}
          consentLabels={consentLabels}
        />
      </div>
    </Block>
  );
}
