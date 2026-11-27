import type { CSSProperties, ReactNode } from 'react';
import { Avatar } from '../atoms/avatar';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLinkButton } from '../atoms/button';
import { CheckIcon, PlayIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Skeleton } from '../atoms/skeleton';
import { Thumb, type ThumbRatio } from '../atoms/thumb';
import type { HeadingTag } from '../molecules/item-head';
import { LiveData } from '../molecules/live-data';
import { cn } from '../system/cn';
import { editable } from '../system/edit';
import { isSafeHref } from '../system/href';
import type { ImageSrc } from '../system/image';
import type { LiveProps } from '../system/live';
import {
  shortCount,
  SOCIAL_PLATFORM_INFO,
  socialHandleText,
  socialProfileHref,
  socialTint,
  type SocialAction,
  type SocialCount,
  type SocialPlatform,
} from '../system/social';
import { WORDS_EN } from '../system/words/en';
import { usePageLocale, usePageWords } from '../system/page-words';

/** One of the creator's latest posts, as the app reads it from the platform. */
export type SocialPost = {
  href: string;
  image?: ImageSrc | null;
  /** What the picture shows, for screen readers. */
  alt?: string;
  /** How many times it was seen or played. */
  views?: number | null;
};

/**
 * The card's words. The button words and the counts are keyed by
 * SocialAction and SocialCount; {n}, {name} and {platform} are filled in.
 */
export type SocialCardLabels = Record<SocialAction, string> &
  Record<SocialCount, string> & {
    /** Read out after a post's view count, as "12K views". */
    views: string;
    /** What a screen reader says for the tick. */
    verified: string;
    /** Names the list of latest posts. */
    posts: string;
    /** Names a post that has no description. */
    post: string;
    /** Read out after the button's word, so "Follow" says whom and where. */
    on: string;
  };

export const SOCIAL_CARD_LABELS: SocialCardLabels = WORDS_EN.socialCard;

/** How much of the grid the card takes, in half-row tiles. */
export const SOCIAL_CARD_TILES = ['1x1', '2x1', '2x2'] as const;
export type SocialCardTile = (typeof SOCIAL_CARD_TILES)[number];

/** "{n} followers" with the number set in bold. */
function withCount(template: string, count: string) {
  const at = template.indexOf('{n}');
  if (at < 0) return template;
  return (
    <>
      {template.slice(0, at)}
      <strong
        {...editable('followers', 'setting')}
        className="text-site-text font-bold"
      >
        {count}
      </strong>
      {template.slice(at + 3)}
    </>
  );
}

/** The platform's icon on a tile in the button colour: the brand's, when tinted. */
function PlatformMark({
  icon,
  name,
  size,
  className,
}: {
  icon?: ReactNode;
  name: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size / 2.2) }}
      className={cn(
        'bg-site-button text-site-on-button rounded-block-inner inline-flex flex-none items-center justify-center leading-none font-bold',
        className
      )}
    >
      {icon ?? name.charAt(0)}
    </span>
  );
}

/**
 * One social profile: the platform, the picture, name and handle, the
 * follower count written short ("12K followers") and a button in the
 * platform's own word (Follow, Subscribe, Connect, Join server...), which
 * the creator can change. With `tint` (the default) the button and the
 * platform's mark take the brand's colour, with words in whichever of white
 * and near-black reads better; without it they follow the theme.
 *
 * `tile` is how much of the grid it takes: `1x1` stacks, `2x1` puts the
 * button beside the name from 28rem wide, and `2x2` also shows the latest
 * posts with their views. The app fetches the posts and passes them in
 * `posts`, as for any live block; the card never calls the platform.
 *
 * `href` is the profile's address. Left out, it's made from the handle where
 * a handle is enough (not Discord or Spotify); with neither, there's no
 * button. A press is reported to tracking as "social_follow", and a post as
 * "social_post", with the block's platform in data-platform.
 */
export function SocialCard({
  platform,
  handle,
  name,
  avatar,
  followers,
  verified = false,
  href,
  icon,
  tint = true,
  color,
  tile = '1x1',
  buttonAction,
  buttonLabel,
  countLabel,
  posts,
  postLimit = 3,
  postRatio = 'square',
  labels,
  locale,
  headingAs: Heading = 'h3',
  ...root
}: BlockRootProps & {
  platform: SocialPlatform;
  /** The username, with or without its "@". */
  handle?: string;
  /** The name on the profile. Left out, the handle is the card's title. */
  name?: string;
  /** undefined: the platform's mark; null: their initials. */
  avatar?: ImageSrc | null;
  followers?: number | null;
  /** A tick beside the name, for a profile the platform has verified. */
  verified?: boolean;
  /** The profile's address; made from the handle when left out. */
  href?: string;
  /** The platform's logo, from the app's own icons. Left out: its initial. */
  icon?: ReactNode;
  /** Colour the button and the mark in the brand's colour. */
  tint?: boolean;
  /** The tint's colour, over the platform's own. */
  color?: string;
  tile?: SocialCardTile;
  /** The button's word, over the platform's own (see SocialAction). */
  buttonAction?: SocialAction;
  /** The button's own words, over `buttonAction`. */
  buttonLabel?: string;
  /** What the count is called, with {n}, as "{n} monthly listeners". */
  countLabel?: string;
  /** The latest posts, shown on a 2x2 card. */
  posts?: LiveProps<SocialPost[]>;
  /** How many posts to show. */
  postLimit?: 3 | 4;
  postRatio?: ThumbRatio;
  labels?: Partial<SocialCardLabels>;
  /** For the counts. Left out, the page's language. */
  locale?: string;
  headingAs?: HeadingTag;
}) {
  const info = SOCIAL_PLATFORM_INFO[platform] ?? SOCIAL_PLATFORM_INFO.x;
  const words = usePageWords('socialCard', labels);
  // The page's language when the block names none; both sides know it.
  const shownLocale = usePageLocale(locale);
  const at = socialHandleText(platform, handle);
  const title = name?.trim() || at || info.name;
  const link = href?.trim() || socialProfileHref(platform, handle);
  const count = shortCount(followers, shownLocale);
  const wide = tile === '2x1' || tile === '2x2';
  const brand = tint ? socialTint(platform, color) : null;
  const tintStyle = brand
    ? ({
        '--site-button': brand.color,
        '--site-on-button': brand.on,
      } as CSSProperties)
    : undefined;
  const word = buttonLabel?.trim() || words[buttonAction ?? info.action];
  // Where each shown word comes from, for edit mode.
  const titlePath = name?.trim() ? 'name' : at ? 'handle' : undefined;
  const wordPath = buttonLabel?.trim()
    ? 'buttonLabel'
    : `labels.${buttonAction ?? info.action}`;
  const countPath =
    countLabel === undefined ? `labels.${info.count}` : 'countLabel';
  // The name in it is marked as the title is, so it's edited as the title.
  const on = words.on.replace('{platform}', info.name);
  const nameAt = on.indexOf('{name}');
  const context =
    nameAt < 0 ? (
      on
    ) : (
      <>
        {on.slice(0, nameAt)}
        <span {...editable(titlePath)}>{title}</span>
        {on.slice(nameAt + '{name}'.length)}
      </>
    );
  const limit = postLimit === 4 ? 4 : 3;

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      {avatar !== undefined ? (
        <span className="relative flex-none">
          <Avatar
            name={title}
            src={avatar}
            size={52}
            marks={editable('avatar', 'picture')}
          />
          <PlatformMark
            icon={icon}
            name={info.name}
            size={22}
            className="outline-site-surface absolute -end-1 -bottom-1 outline-2"
          />
        </span>
      ) : (
        <PlatformMark icon={icon} name={info.name} size={44} />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Heading className="text-block-title m-0 inline-flex min-w-0 items-center gap-1.5 leading-tight font-bold">
          <span
            {...editable(titlePath)}
            className="min-w-0 [overflow-wrap:anywhere]"
          >
            {title}
          </span>
          {verified ? (
            <span
              role="img"
              aria-label={words.verified}
              className="bg-site-button text-site-on-button inline-flex size-5 flex-none items-center justify-center rounded-full"
            >
              <CheckIcon size={13} strokeWidth={3} />
            </span>
          ) : null}
        </Heading>
        <p className="text-site-text-2 m-0 text-sm [overflow-wrap:anywhere]">
          {at && at !== title ? (
            <>
              <span {...editable('handle')} dir="ltr">
                {at}
              </span>
              <span aria-hidden> · </span>
              <span className="sr-only">, </span>
            </>
          ) : null}
          <span {...editable('platform', 'setting')}>{info.name}</span>
        </p>
      </div>
    </div>
  );

  const countLine = count ? (
    <p {...editable(countPath)} className="text-site-text-2 m-0 text-sm">
      {withCount(countLabel ?? words[info.count], count)}
    </p>
  ) : null;

  const button =
    link && isSafeHref(link) ? (
      <SiteLinkButton
        href={link}
        newTab
        action="social_follow"
        {...editable('href', 'link')}
        fullWidth={!wide}
        className={wide ? 'w-full @md:w-auto' : undefined}
      >
        <span {...editable(wordPath)}>{word}</span>
        <span className="sr-only"> {context}</span>
      </SiteLinkButton>
    ) : null;

  return (
    <Block
      as="article"
      name="social-card"
      data-platform={platform}
      data-tile={tile}
      {...root}
      className={cn('@container', root.className)}
      style={{ ...tintStyle, ...root.style }}
    >
      {wide ? (
        <div className="gap-block-gap grid grid-cols-1 @md:grid-cols-[minmax(0,1fr)_auto] @md:items-center">
          <div className="flex min-w-0 flex-col gap-2">
            {identity}
            {countLine}
          </div>
          {button}
        </div>
      ) : (
        <>
          {identity}
          {countLine}
          {button}
        </>
      )}
      {tile === '2x2' && posts ? (
        <LiveData
          data={posts.data}
          loading={posts.loading}
          error={posts.error}
          skeleton={
            <span className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, n) => (
                <Skeleton key={n} shape="box" className="aspect-square" />
              ))}
            </span>
          }
        >
          {(items) =>
            items.length ? (
              <ul
                aria-label={words.posts}
                className={cn(
                  'm-0 grid list-none gap-2 p-0',
                  limit === 4 ? 'grid-cols-2 @sm:grid-cols-4' : 'grid-cols-3'
                )}
              >
                {items.slice(0, limit).map((post, i) => {
                  const views = shortCount(post.views, shownLocale);
                  return (
                    <li key={`${i}-${post.href}`} className="m-0">
                      <SiteLink
                        href={post.href}
                        newTab
                        action="social_post"
                        data-lift=""
                        className="rounded-block-inner relative block overflow-hidden no-underline"
                      >
                        <Thumb
                          src={post.image}
                          alt={post.alt ?? ''}
                          ratio={postRatio}
                          sizes="(min-width: 768px) 144px, 30vw"
                          className="w-full"
                        />
                        {post.alt ? null : (
                          <span className="sr-only">
                            {words.post.replace('{n}', String(i + 1))}
                          </span>
                        )}
                        {views ? (
                          <span className="bg-site-surface text-site-text absolute start-1.5 bottom-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                            <PlayIcon size={11} />
                            <span aria-hidden>{views}</span>
                            <span className="sr-only">
                              {words.views.replace('{n}', views)}
                            </span>
                          </span>
                        ) : null}
                      </SiteLink>
                    </li>
                  );
                })}
              </ul>
            ) : null
          }
        </LiveData>
      ) : null}
    </Block>
  );
}
