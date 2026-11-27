import type { ReactNode } from 'react';
import { Avatar } from '../atoms/avatar';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLinkButton } from '../atoms/button';
import { CodeIcon, DownloadIcon, ForkIcon, StarIcon } from '../atoms/icons';
import { SiteLink } from '../atoms/link';
import { Skeleton } from '../atoms/skeleton';
import {
  ItemHead,
  subHeading,
  type HeadingTag,
  type SubHeadingTag,
} from '../molecules/item-head';
import { LiveData, SkeletonLines } from '../molecules/live-data';
import { Sparkline } from '../molecules/sparkline';
import { StatList } from '../molecules/stat-list';
import { cn } from '../system/cn';
import { editable, editPath } from '../system/edit';
import { imageAttrs } from '../system/image';
import type { LiveProps } from '../system/live';
import { isSafeColor } from '../system/theme';
import { WORDS_EN } from '../system/words/en';
import { usePageLocale, usePageWords } from '../system/page-words';

const compact = (n: number, locale?: string) =>
  new Intl.NumberFormat(locale, { notation: 'compact' }).format(n);

/* ----------------------------------------------------------- GitHubProfile */

/** What GitHubProfile shows: the app reads it from GitHub's API. */
export type GitHubProfileData = {
  login: string;
  name?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  followers: number;
  publicRepos: number;
  /** Stars across their own public repos, when the app adds them up. */
  stars?: number;
  url: string;
};

export type GitHubLabels = {
  followers: string;
  repos: string;
  stars: string;
  button: string;
};

export const GITHUB_LABELS: GitHubLabels = WORDS_EN.github;

/** A developer's GitHub: picture, name, bio, followers, repos and stars. */
export function GitHubProfile({
  data,
  loading,
  error,
  updatedAt,
  labels,
  locale: localeProp,
  headingAs = 'h3',
  ...root
}: BlockRootProps &
  LiveProps<GitHubProfileData> & {
    labels?: Partial<GitHubLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const locale = usePageLocale(localeProp);
  const words = usePageWords('github', labels);
  const Heading = headingAs;
  return (
    <Block name="github-profile" {...root}>
      <LiveData
        data={data}
        loading={loading}
        error={error}
        updatedAt={updatedAt}
        skeleton={
          <span className="flex items-center gap-3">
            <Skeleton shape="circle" />
            <span className="flex-1">
              <SkeletonLines lines={2} />
            </span>
          </span>
        }
      >
        {(profile) => (
          <>
            <div className="flex items-center gap-3">
              <Avatar
                name={profile.name ?? profile.login}
                src={profile.avatarUrl}
                size={56}
              />
              <div className="min-w-0">
                <Heading className="text-block-title m-0 font-bold">
                  {profile.name ?? profile.login}
                </Heading>
                <p className="text-site-text-2 m-0 text-sm">@{profile.login}</p>
              </div>
            </div>
            {profile.bio ? <p className="m-0">{profile.bio}</p> : null}
            <StatList
              locale={locale}
              items={[
                {
                  label: words.followers,
                  value: profile.followers,
                  edit: 'labels.followers',
                },
                {
                  label: words.repos,
                  value: profile.publicRepos,
                  edit: 'labels.repos',
                },
                ...(profile.stars != null
                  ? [
                      {
                        label: words.stars,
                        value: profile.stars,
                        edit: 'labels.stars',
                      },
                    ]
                  : []),
              ]}
            />
            <SiteLinkButton
              href={profile.url}
              newTab
              variant="outline"
              action="github_profile"
              fullWidth
            >
              <span {...editable('labels.button')}>{words.button}</span>
            </SiteLinkButton>
          </>
        )}
      </LiveData>
    </Block>
  );
}

/* ------------------------------------------------------- ContributionGraph */

/** A year of contributions: 52 or 53 weeks of 7 days, oldest first. */
export type ContributionData = {
  /**
   * Each week's counts, Sunday first. The first week may start later in
   * the week and the last may end early, as GitHub gives them.
   */
  weeks: number[][];
  total: number;
  currentStreak: number;
  longestStreak: number;
};

export type ContributionLabels = {
  /** {n} is filled in. */
  total: string;
  current: string;
  longest: string;
  /** {n} is filled in. */
  days: string;
};

export const CONTRIBUTION_LABELS: ContributionLabels = WORDS_EN.contributions;

/**
 * The graph's weeks as seven cells each, so every day sits in its own row:
 * a short first week gets empty cells (null) before its days, as it starts
 * later in the week, and a short last week gets them after.
 */
export function contributionCells(weeks: number[][]): (number | null)[][] {
  return weeks.map((week, w) => {
    const days = week.slice(0, 7);
    const gap: null[] = Array.from({ length: 7 - days.length }, () => null);
    return w === 0 && weeks.length > 1 ? [...gap, ...days] : [...days, ...gap];
  });
}

const LEVELS = [
  'bg-site-surface-2',
  'bg-site-button/30',
  'bg-site-button/55',
  'bg-site-button/80',
  'bg-site-button',
];

/** The level, 0 to 4, of a day's count against the year's busiest day. */
export function contributionLevel(count: number, max: number) {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4));
}

/**
 * The year as a grid of days, darker for busier ones, with the current and
 * longest streaks. Screen readers hear the total and the streaks; the grid
 * itself is a picture of them.
 */
export function ContributionGraph({
  data,
  loading,
  error,
  updatedAt,
  title,
  labels,
  locale: localeProp,
  headingAs = 'h3',
  ...root
}: BlockRootProps &
  LiveProps<ContributionData> & {
    title?: ReactNode;
    labels?: Partial<ContributionLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const locale = usePageLocale(localeProp);
  const words = usePageWords('contributions', labels);
  const days = (n: number) => words.days.replace('{n}', compact(n, locale));
  return (
    <Block name="contribution-graph" {...root}>
      {title ? (
        <ItemHead
          title={title}
          headingAs={headingAs}
          edit={{ title: 'title' }}
        />
      ) : null}
      <LiveData
        data={data}
        loading={loading}
        error={error}
        updatedAt={updatedAt}
        skeleton={<Skeleton shape="box" className="aspect-[53/7]" />}
      >
        {(year) => {
          const max = Math.max(0, ...year.weeks.flat());
          return (
            <>
              <p className="m-0 text-sm font-semibold">
                {words.total.replace(
                  '{n}',
                  new Intl.NumberFormat(locale).format(year.total)
                )}
              </p>
              <div className="overflow-x-auto" aria-hidden>
                <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
                  {contributionCells(year.weeks).flatMap((week, w) =>
                    week.map((count, d) => (
                      <span
                        key={`${w}-${d}`}
                        className={cn(
                          'size-2.5 rounded-[2px]',
                          count !== null &&
                            LEVELS[contributionLevel(count, max)]
                        )}
                      />
                    ))
                  )}
                </div>
              </div>
              <StatList
                locale={locale}
                items={[
                  {
                    label: words.current,
                    value: days(year.currentStreak),
                    edit: 'labels.current',
                  },
                  {
                    label: words.longest,
                    value: days(year.longestStreak),
                    edit: 'labels.longest',
                  },
                ]}
              />
            </>
          );
        }}
      </LiveData>
    </Block>
  );
}

/* ---------------------------------------------------------------- RepoCard */

/** A repository, as RepoCard and RepoList show it. */
export type RepoData = {
  name: string;
  owner?: string;
  description?: string | null;
  stars: number;
  forks: number;
  language?: string | null;
  /** The language's colour, as GitHub gives it. */
  languageColor?: string | null;
  url: string;
};

export type RepoLabels = { stars: string; forks: string };

export const REPO_LABELS: RepoLabels = WORDS_EN.repo;

function RepoBody({
  repo,
  locale,
  words,
  Heading,
}: {
  repo: RepoData;
  locale?: string;
  words: RepoLabels;
  Heading: HeadingTag | SubHeadingTag;
}) {
  const dot =
    repo.languageColor && isSafeColor(repo.languageColor)
      ? repo.languageColor
      : undefined;
  return (
    <>
      <Heading className="m-0 text-base font-bold">
        <SiteLink href={repo.url} newTab action="repo_click">
          {repo.owner ? (
            <span className="font-normal">{repo.owner}/</span>
          ) : null}
          {repo.name}
        </SiteLink>
      </Heading>
      {repo.description ? (
        <p className="text-site-text-2 m-0 text-sm">{repo.description}</p>
      ) : null}
      <p className="text-site-text-2 m-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {repo.language ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="bg-site-text-2 size-2.5 rounded-full"
              style={dot ? { background: dot } : undefined}
            />
            {repo.language}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <StarIcon size={14} />
          {compact(repo.stars, locale)}
          <span className="sr-only"> {words.stars}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <ForkIcon size={14} />
          {compact(repo.forks, locale)}
          <span className="sr-only"> {words.forks}</span>
        </span>
      </p>
    </>
  );
}

/** One repository: name, description, language, stars and forks. */
export function RepoCard({
  data,
  loading,
  error,
  updatedAt,
  labels,
  locale: localeProp,
  headingAs = 'h3',
  ...root
}: BlockRootProps &
  LiveProps<RepoData> & {
    labels?: Partial<RepoLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const locale = usePageLocale(localeProp);
  const words = usePageWords('repo', labels);
  return (
    <Block as="article" name="repo-card" {...root}>
      <LiveData
        data={data}
        loading={loading}
        error={error}
        updatedAt={updatedAt}
      >
        {(repo) => (
          <RepoBody
            repo={repo}
            locale={locale}
            words={words}
            Heading={headingAs}
          />
        )}
      </LiveData>
    </Block>
  );
}

/** Pinned or top repositories, as cards in a grid. */
export function RepoList({
  data,
  loading,
  error,
  updatedAt,
  title,
  columns = 2,
  labels,
  locale: localeProp,
  headingAs = 'h2',
  ...root
}: BlockRootProps &
  LiveProps<RepoData[]> & {
    title?: ReactNode;
    columns?: 1 | 2;
    labels?: Partial<RepoLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const locale = usePageLocale(localeProp);
  const words = usePageWords('repo', labels);
  const itemHeading = subHeading(headingAs);
  return (
    <Block name="repo-list" {...root}>
      {title ? (
        <ItemHead
          title={title}
          headingAs={headingAs}
          edit={{ title: 'title' }}
        />
      ) : null}
      <LiveData
        data={data}
        loading={loading}
        error={error}
        updatedAt={updatedAt}
      >
        {(repos) => (
          <ul
            className={cn(
              '@container m-0 grid list-none gap-3 p-0',
              columns === 2 && '@lg:grid-cols-2'
            )}
          >
            {repos.map((repo) => (
              <li
                key={`${repo.owner}/${repo.name}`}
                className="border-site-border rounded-block-inner flex flex-col gap-2 border p-3"
              >
                <RepoBody
                  repo={repo}
                  locale={locale}
                  words={words}
                  Heading={itemHeading}
                />
              </li>
            ))}
          </ul>
        )}
      </LiveData>
    </Block>
  );
}

/* ------------------------------------------------------------ PackageStats */

/** A package on a registry such as npm. */
export type PackageData = {
  name: string;
  version: string;
  weeklyDownloads: number;
  /** Downloads per week, oldest first, for the chart. */
  history?: number[];
  url: string;
};

export type PackageLabels = {
  version: string;
  weekly: string;
  /** {n} is filled in. */
  chart: string;
};

export const PACKAGE_LABELS: PackageLabels = WORDS_EN.package;

/** A package's version, weekly downloads and a small chart of them. */
export function PackageStats({
  data,
  loading,
  error,
  updatedAt,
  labels,
  locale: localeProp,
  headingAs = 'h3',
  ...root
}: BlockRootProps &
  LiveProps<PackageData> & {
    labels?: Partial<PackageLabels>;
    locale?: string;
    headingAs?: HeadingTag;
  }) {
  const locale = usePageLocale(localeProp);
  const words = usePageWords('package', labels);
  const Heading = headingAs;
  return (
    <Block name="package-stats" {...root}>
      <LiveData
        data={data}
        loading={loading}
        error={error}
        updatedAt={updatedAt}
      >
        {(pkg) => (
          <>
            <Heading className="m-0 inline-flex items-center gap-2 font-mono text-base font-bold">
              <CodeIcon size={18} />
              <SiteLink href={pkg.url} newTab action="package_click">
                {pkg.name}
              </SiteLink>
            </Heading>
            <StatList
              locale={locale}
              items={[
                {
                  label: words.version,
                  value: pkg.version,
                  edit: 'labels.version',
                },
                {
                  label: words.weekly,
                  value: pkg.weeklyDownloads,
                  icon: <DownloadIcon size={12} />,
                  edit: 'labels.weekly',
                },
              ]}
            />
            {pkg.history && pkg.history.length > 1 ? (
              <Sparkline
                values={pkg.history}
                label={words.chart.replace('{n}', String(pkg.history.length))}
              />
            ) : null}
          </>
        )}
      </LiveData>
    </Block>
  );
}

/* --------------------------------------------------------------- TechStack */

/** A tool or language in a TechStack. */
export type TechItem = {
  name: string;
  /** A logo picture, or your own icon. */
  logo?: string | ReactNode;
  href?: string;
};

/** The tools and languages someone works with, as logo chips. */
export function TechStack({
  items,
  title,
  headingAs = 'h3',
  ...root
}: BlockRootProps & {
  items: TechItem[];
  title?: ReactNode;
  headingAs?: HeadingTag;
}) {
  return (
    <Block name="tech-stack" {...root}>
      {title ? (
        <ItemHead
          title={title}
          headingAs={headingAs}
          edit={{ title: 'title' }}
        />
      ) : null}
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {items.map((item, n) => {
          const chip = (
            <>
              {typeof item.logo === 'string' ? (
                item.logo.trim() ? (
                  <img
                    {...editable(editPath('items', n, 'logo'), 'picture')}
                    {...imageAttrs({ src: item.logo.trim() }, '20px')}
                    alt=""
                    className="size-5 object-contain"
                  />
                ) : null
              ) : (
                item.logo
              )}
              <span {...editable(editPath('items', n, 'name'))}>
                {item.name}
              </span>
            </>
          );
          const chipClass =
            'bg-site-surface-2 text-site-text rounded-site-button min-h-control inline-flex items-center gap-2 px-3 text-sm font-semibold no-underline';
          return (
            <li key={item.name}>
              {item.href ? (
                <SiteLink
                  {...editable(editPath('items', n, 'href'), 'link')}
                  href={item.href}
                  newTab
                  action="tech_click"
                  className={chipClass}
                >
                  {chip}
                </SiteLink>
              ) : (
                <span className={chipClass}>{chip}</span>
              )}
            </li>
          );
        })}
      </ul>
    </Block>
  );
}
