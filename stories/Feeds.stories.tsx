import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  EventList,
  LatestPosts,
  LatestVideos,
  LiveStatus,
  NowPlaying,
  ReviewSummary,
  type EventItem,
  type PostItem,
  type VideoItem,
} from '../src';
import { onScreen } from './screens';

/* Fixed sample data: the stories never call a feed or a service. */

const VIDEOS: VideoItem[] = [
  {
    title: 'Ten-minute dal',
    href: 'https://example.com/v/1',
    thumbnail: null,
    detail: '3 days ago',
  },
  {
    title: 'Sharpening a knife',
    href: 'https://example.com/v/2',
    thumbnail: null,
    detail: '1 week ago',
  },
  {
    title: 'Weekly shop',
    href: 'https://example.com/v/3',
    thumbnail: null,
    detail: '2 weeks ago',
  },
  {
    title: 'Chai, three ways',
    href: 'https://example.com/v/4',
    thumbnail: null,
    detail: '3 weeks ago',
  },
  { title: 'Not shown', href: 'https://example.com/v/5', thumbnail: null },
];

const POSTS: PostItem[] = [
  {
    title: 'Why I stopped buying ground spices',
    href: 'https://example.com/p/1',
    date: '12 Nov 2026',
    dateTime: '2026-11-12',
    excerpt:
      'Whole spices keep their flavour for a year; ground ones fade in weeks.',
  },
  {
    title: 'A tiffin for every day of the week',
    href: 'https://example.com/p/2',
    date: '2 Nov 2026',
    dateTime: '2026-11-02',
  },
];

const EVENTS: EventItem[] = [
  {
    date: 'Sat 6 Dec',
    dateTime: '2026-12-06',
    title: 'Live cooking night',
    venue: 'The Hall',
    city: 'Pune',
    href: 'https://example.com/t/1',
  },
  {
    date: 'Sun 14 Dec',
    dateTime: '2026-12-14',
    title: 'Spice market walk',
    city: 'Mumbai',
    soldOut: true,
  },
];

const meta = {
  title: 'Blocks/Feeds',
  component: LatestVideos,
  tags: ['autodocs'],
  args: {
    title: 'Latest videos',
    data: VIDEOS,
    channelHref: 'https://example.com/channel',
  },
} satisfies Meta<typeof LatestVideos>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The newest four videos, two to a row on a tablet. */
export const Videos: Story = {
  globals: onScreen('tablet'),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await expect(
      canvas.getByRole('link', { name: 'Ten-minute dal' })
    ).toHaveAttribute('data-action', 'video_click');
    await expect(
      canvas.getByRole('link', { name: /See the channel/ })
    ).toHaveAttribute('target', '_blank');
  },
};

/** While the app fetches the channel. */
export const VideosLoading: Story = {
  args: { data: null, loading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible();
  },
};

/** Blog posts with dates and a short excerpt, on a phone. */
export const Posts: StoryObj<typeof LatestPosts> = {
  globals: onScreen('phone'),
  render: () => <LatestPosts title="From the blog" data={POSTS} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByText('12 Nov 2026')).toHaveAttribute(
      'datetime',
      '2026-11-12'
    );
  },
};

/** Live now: the title, the viewers and a player that loads on a tap. */
export const Live: StoryObj<typeof LiveStatus> = {
  render: () => (
    <LiveStatus
      locale="en"
      parents={['storybook.levuche.com', 'localhost']}
      data={{
        live: true,
        channel: 'ashacooks',
        url: 'https://example.com/live',
        title: 'Sunday batch cooking',
        viewers: 1840,
      }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Live now')).toBeVisible();
    await expect(canvas.getByText('1.8K watching')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Watch ashacooks live' })
    ).toBeVisible();
  },
};

/** Offline: the schedule and a link to the channel, no player. */
export const Offline: StoryObj<typeof LiveStatus> = {
  render: () => (
    <LiveStatus
      data={{
        live: false,
        channel: 'ashacooks',
        url: 'https://example.com/live',
        schedule: 'Live Sundays at 6 pm',
      }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Offline')).toBeVisible();
    await expect(canvas.getByText('Live Sundays at 6 pm')).toBeVisible();
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

/** Tour dates: tickets on one, sold out on the other. */
export const Events: StoryObj<typeof EventList> = {
  globals: onScreen('desktop'),
  render: () => <EventList title="Coming up" data={EVENTS} />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', {
        name: 'Tickets: Live cooking night, Sat 6 Dec',
      })
    ).toHaveAttribute('data-action', 'event_tickets');
    await expect(canvas.getByText('Sold out')).toBeVisible();
  },
};

/** A star rating and recent reviews, with the line the review site asks for. */
export const Reviews: StoryObj<typeof ReviewSummary> = {
  render: () => (
    <ReviewSummary
      title="What people say"
      attribution="Reviews from Google"
      locale="en"
      data={{
        rating: 4.8,
        count: 1260,
        url: 'https://example.com/reviews',
        reviews: [
          {
            author: 'Ravi',
            rating: 5,
            text: 'The best cooking class in town.',
            date: '2 weeks ago',
          },
          {
            author: 'Meera',
            rating: 4,
            text: 'Lovely evening, a bit crowded.',
          },
        ],
      }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('4.8 from 1,260 reviews')).toBeVisible();
    await expect(canvas.getByText('Reviews from Google')).toBeVisible();
  },
};

/** What the creator is listening to, linked. */
export const Listening: StoryObj<typeof NowPlaying> = {
  render: () => (
    <NowPlaying
      kind="listening"
      title="Monsoon Ragas"
      by="Anoushka Rao"
      image={null}
      href="https://example.com/album"
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Listening to')).toBeVisible();
    await expect(canvas.getByRole('link')).toHaveAttribute(
      'data-action',
      'now_playing'
    );
  },
};
