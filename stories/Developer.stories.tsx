import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  ContributionGraph,
  GitHubProfile,
  PackageStats,
  RepoCard,
  RepoList,
  TechStack,
  type ContributionData,
  type RepoData,
} from '../src';
import { onScreen } from './screens';

/* Fixed sample data: the stories never call GitHub or npm. */

const PROFILE = {
  login: 'asha-builds',
  name: 'Asha Menon',
  bio: 'I build small tools for cooks.',
  followers: 12400,
  publicRepos: 38,
  stars: 5210,
  url: 'https://example.com/asha-builds',
};

/** 53 weeks of made-up counts, the same every time. */
const YEAR: ContributionData = {
  weeks: Array.from({ length: 53 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) =>
      ((w * 7 + d) * 37) % 11 > 5 ? (w + d) % 9 : 0
    )
  ),
  total: 1342,
  currentStreak: 12,
  longestStreak: 47,
};

const REPOS: RepoData[] = [
  {
    owner: 'asha-builds',
    name: 'spice-ratio',
    description: 'Scale a spice blend to any batch size.',
    stars: 2310,
    forks: 140,
    language: 'TypeScript',
    languageColor: '#3178c6',
    url: 'https://example.com/spice-ratio',
  },
  {
    owner: 'asha-builds',
    name: 'tiffin-timer',
    description: 'Timers for a whole meal at once.',
    stars: 880,
    forks: 51,
    language: 'Rust',
    languageColor: '#dea584',
    url: 'https://example.com/tiffin-timer',
  },
];

const meta = {
  title: 'Blocks/Developer',
  component: GitHubProfile,
  tags: ['autodocs'],
  args: { data: PROFILE, locale: 'en' },
} satisfies Meta<typeof GitHubProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A GitHub profile with its figures written short. */
export const Profile: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Asha Menon')).toBeVisible();
    await expect(canvas.getByText('12K')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: /Follow on GitHub/ })
    ).toHaveAttribute('target', '_blank');
  },
};

/** While the app fetches: a skeleton, and screen readers hear "Loading". */
export const Loading: Story = {
  args: { data: null, loading: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('status', { name: 'Loading' })
    ).toHaveAttribute('aria-busy', 'true');
  },
};

/** A refresh failed: the last data stays, with a quiet note. */
export const Stale: Story = {
  args: { error: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Asha Menon')).toBeVisible();
    await expect(canvas.getByText(/Couldn’t refresh/)).toBeVisible();
  },
};

/** No data and an error: the block shows nothing at all. */
export const NothingToShow: Story = {
  args: { data: null, error: true },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-block="github-profile"]')
    ).toBeEmptyDOMElement();
  },
};

/** The year in a grid, with the streaks, on a desktop. */
export const Contributions: StoryObj<typeof ContributionGraph> = {
  globals: onScreen('desktop'),
  render: () => <ContributionGraph title="This year" data={YEAR} locale="en" />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('1,342 contributions in the last year')
    ).toBeVisible();
    await expect(canvas.getByText('47 days')).toBeVisible();
  },
};

/** One repository. */
export const Repo: StoryObj<typeof RepoCard> = {
  render: () => <RepoCard data={REPOS[0]} locale="en" />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'asha-builds/spice-ratio' })
    ).toHaveAttribute('target', '_blank');
    await expect(canvas.getByText('TypeScript')).toBeVisible();
  },
};

/** Pinned repositories, one column on a phone. */
export const Repos: StoryObj<typeof RepoList> = {
  globals: onScreen('phone'),
  render: () => <RepoList title="Pinned" data={REPOS} locale="en" />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};

/** A package's version, weekly downloads and a chart, on a tablet. */
export const Package: StoryObj<typeof PackageStats> = {
  globals: onScreen('tablet'),
  render: () => (
    <PackageStats
      locale="en"
      data={{
        name: 'spice-ratio',
        version: '2.4.1',
        weeklyDownloads: 18300,
        history: [9, 11, 10, 13, 12, 15, 14, 16, 17, 18].map((n) => n * 1000),
        url: 'https://example.com/package',
      }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('18K')).toBeVisible();
    await expect(
      canvas.getByRole('img', {
        name: 'Downloads per week over the last 10 weeks',
      })
    ).toBeVisible();
  },
};

/** Tools as chips, one of them linked. */
export const Stack: StoryObj<typeof TechStack> = {
  render: () => (
    <TechStack
      title="What I use"
      items={[
        { name: 'TypeScript', href: 'https://example.com/ts' },
        { name: 'Rust' },
        { name: 'Postgres' },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(
      canvas.getByRole('link', { name: 'TypeScript' })
    ).toHaveAttribute('target', '_blank');
  },
};
