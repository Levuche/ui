import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  SOCIAL_CARD_LABELS,
  SOCIAL_PLATFORM_INFO,
  SOCIAL_PLATFORMS,
  SocialCard,
  type SocialPost,
} from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/*
 * One social profile with its follower count and a button in the platform's
 * own word. Fixed sample data: the stories never call any platform.
 */

const POSTS: SocialPost[] = [
  {
    href: 'https://example.com/p/1',
    image: null,
    alt: 'A cup of masala chai on a brass tray',
    views: 12400,
  },
  { href: 'https://example.com/p/2', image: null, views: 860000 },
  {
    href: 'https://example.com/p/3',
    image: null,
    alt: 'Spices laid out in a row',
    views: 2100000,
  },
  { href: 'https://example.com/p/4', image: null, views: 950 },
];

const meta = {
  title: 'Blocks/Social card',
  component: SocialCard,
  tags: ['autodocs'],
  args: {
    platform: 'instagram',
    handle: 'desiorigins',
    name: 'Desi Origins',
    followers: 128400,
    avatar: null,
  },
} satisfies Meta<typeof SocialCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const themedPage = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-testid="story-theme"]')!;

/** Half a row (1x1): the button under the name, full width. */
export const OneByOne: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Desi Origins' })
    ).toBeVisible();
    await expect(canvas.getByText('@desiorigins')).toBeVisible();
    await expect(canvas.getByText('128K')).toBeVisible();
    const button = canvas.getByRole('link', {
      name: 'Follow Desi Origins on Instagram',
    });
    await expect(button).toHaveAttribute(
      'href',
      'https://www.instagram.com/desiorigins/'
    );
    await expect(button).toHaveAttribute('target', '_blank');
    await expect(button).toHaveAttribute('data-action', 'social_follow');
    await expectTapSize(button, 'Follow');
    // Tinted: the brand's colour, with white words.
    await expect(getComputedStyle(button).backgroundColor).toBe(
      'rgb(193, 53, 132)'
    );
    await expect(getComputedStyle(button).color).toBe('rgb(255, 255, 255)');
  },
};

/** A full row (2x1) on a desktop: the button beside the name. */
export const TwoByOne: Story = {
  args: { tile: '2x1', platform: 'youtube', followers: 86400 },
  globals: onScreen('desktop'),
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole('link', { name: /^Subscribe/ });
    const card = canvasElement.querySelector('[data-block="social-card"]')!;
    await expect(card).toHaveAttribute('data-tile', '2x1');
    const heading = canvas.getByRole('heading').getBoundingClientRect();
    const box = button.getBoundingClientRect();
    await expect(box.left).toBeGreaterThan(heading.right);
    await expect(box.width).toBeLessThan(
      card.getBoundingClientRect().width / 2
    );
    await expect(canvas.getByText(/subscribers/)).toBeVisible();
  },
};

/** The same 2x1 card on a phone stacks, with the button full width. */
export const TwoByOneOnAPhone: Story = {
  ...TwoByOne,
  globals: onScreen('phone'),
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole('link', { name: /^Subscribe/ });
    const heading = canvas.getByRole('heading').getBoundingClientRect();
    await expect(button.getBoundingClientRect().top).toBeGreaterThan(
      heading.bottom
    );
    await expect(
      canvasElement.querySelector('[data-block="social-card"]')
    ).toHaveAttribute('data-tile', '2x1');
  },
};

/** Two rows (2x2): the latest posts with their views. */
export const TwoByTwo: Story = {
  args: {
    tile: '2x2',
    platform: 'tiktok',
    verified: true,
    posts: { data: POSTS },
    postLimit: 4,
    postRatio: 'portrait',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Verified' })).toBeVisible();
    const list = canvas.getByRole('list', { name: 'Latest posts' });
    const posts = within(list).getAllByRole('link');
    await expect(posts).toHaveLength(4);
    await expect(posts[0]).toHaveAccessibleName(
      'A cup of masala chai on a brass tray 12K views'
    );
    // A post with no description is named by its place.
    await expect(posts[1]).toHaveAccessibleName('Post 2 860K views');
    await expect(posts[1]).toHaveAttribute('data-action', 'social_post');
    await expect(posts[2]).toHaveTextContent('2.1M');
    for (const post of posts) await expectTapSize(post, 'post');
  },
};

/** Three posts by default. */
export const ThreePosts: Story = {
  args: { tile: '2x2', posts: { data: POSTS } },
  play: async ({ canvas }) => {
    await expect(
      within(canvas.getByRole('list', { name: 'Latest posts' })).getAllByRole(
        'listitem'
      )
    ).toHaveLength(3);
  },
};

/** While the app fetches the posts: a skeleton, read out as "Loading". */
export const PostsLoading: Story = {
  args: { tile: '2x2', posts: { data: null, loading: true } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('status', { name: 'Loading' })
    ).toHaveAttribute('aria-busy', 'true');
    // The profile shows while the posts load.
    await expect(canvas.getByText('128K')).toBeVisible();
  },
};

/** Posts are only for a 2x2 card; a 1x1 card leaves them out. */
export const PostsOnlyOnTwoByTwo: Story = {
  args: { tile: '1x1', posts: { data: POSTS } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('list')).toBeNull();
  },
};

/** Tint off: the button and the mark follow the theme's colours. */
export const ThemeColours: Story = {
  args: { tint: false },
  play: async ({ canvas, canvasElement }) => {
    // The theme's accent, as the browser writes a colour.
    const probe = document.createElement('span');
    probe.style.color = 'var(--site-accent)';
    themedPage(canvasElement).append(probe);
    const expected = getComputedStyle(probe).color;
    probe.remove();
    const button = canvas.getByRole('link', { name: /^Follow/ });
    await expect(getComputedStyle(button).backgroundColor).toBe(expected);
  },
};

/** A creator's own tint colour, with dark words when they read better. */
export const OwnColour: Story = {
  args: { color: '#facc15', platform: 'x', handle: 'desi_origins' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: /^Follow/ });
    await expect(getComputedStyle(button).backgroundColor).toBe(
      'rgb(250, 204, 21)'
    );
    await expect(getComputedStyle(button).color).toBe('rgb(17, 17, 17)');
    await expect(button).toHaveAttribute('href', 'https://x.com/desi_origins');
  },
};

/** The creator's own words: another button word and what the count is called. */
export const OwnWords: Story = {
  args: {
    platform: 'spotify',
    handle: undefined,
    name: 'Desi Origins Radio',
    href: 'https://open.spotify.com/show/example',
    followers: 4300,
    buttonLabel: 'Listen',
    countLabel: '{n} monthly listeners',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Listen Desi Origins Radio on Spotify' })
    ).toBeVisible();
    await expect(canvas.getByText(/monthly listeners/)).toHaveTextContent(
      '4.3K monthly listeners'
    );
  },
};

/** A Discord server: Join server and members, linked by its invite. */
export const DiscordServer: Story = {
  args: {
    platform: 'discord',
    handle: 'Desi Origins Club',
    name: undefined,
    avatar: undefined,
    followers: 2300,
    href: 'https://discord.gg/example',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Desi Origins Club' })
    ).toBeVisible();
    await expect(canvas.getByText(/members/)).toHaveTextContent('2.3K members');
    await expect(
      canvas.getByRole('link', { name: /^Join server/ })
    ).toHaveAttribute('href', 'https://discord.gg/example');
  },
};

/** No address and none that the handle can make: no button at all. */
export const NoLink: Story = {
  args: { platform: 'discord', handle: 'Desi Origins Club' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
  },
};

/** An address a creator typed that isn't safe gets no button. */
export const UnsafeLink: Story = {
  args: { href: 'javascript:alert(1)' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByText('128K')).toBeVisible();
  },
};

/** In another language, through `labels` and `locale`. */
export const OtherLanguage: Story = {
  args: {
    locale: 'fr',
    followers: 1100,
    labels: {
      follow: 'Suivre',
      followers: '{n} abonnés',
      on: '{name} sur {platform}',
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Suivre Desi Origins sur Instagram' })
    ).toBeVisible();
    await expect(canvas.getByText(/abonnés/)).toHaveTextContent(
      /^1,1\sk abonnés$/
    );
  },
};

/** Every platform, with its own word and colour, in both schemes. */
export const EveryPlatform: Story = {
  args: { avatar: undefined },
  render: (args) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {SOCIAL_PLATFORMS.map((platform) => (
        <SocialCard
          key={platform}
          {...args}
          platform={platform}
          href={`https://example.com/${platform}`}
          name={`Desi Origins ${SOCIAL_PLATFORM_INFO[platform].name}`}
          headingAs="p"
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[data-block="social-card"]');
    await expect(cards).toHaveLength(SOCIAL_PLATFORMS.length);
    for (const card of cards) {
      const platform = card.getAttribute(
        'data-platform'
      ) as (typeof SOCIAL_PLATFORMS)[number];
      const info = SOCIAL_PLATFORM_INFO[platform];
      const button = within(card as HTMLElement).getByRole('link');
      await expect(button).toHaveTextContent(
        new RegExp(`^${SOCIAL_CARD_LABELS[info.action]}`)
      );
    }
  },
};

export const EveryPlatformDark: Story = {
  ...EveryPlatform,
  globals: { theme: 'dark' },
};
