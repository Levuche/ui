import {
  BookingCard,
  CreatorFooter,
  CreatorHeader,
  FeaturedLink,
  FeaturedPack,
  ImageGrid,
  LeadMagnet,
  LinkList,
  MembershipCard,
  NewsletterBand,
  SiteGrid,
  SiteLinkButton,
  SiteSection,
  SocialIcons,
  Testimonials,
  YouTubeVideo,
  type PageLayouts,
  type SiteGridBlock,
} from '../src';
import {
  SAMPLE_LINKS,
  SAMPLE_SOCIALS,
  SAMPLE_TESTIMONIALS,
} from './sample-page';

const submit = (event: { preventDefault: () => void }) =>
  event.preventDefault();

/** The sample creator's blocks, in reading order. */
export const SAMPLE_GRID_BLOCKS: SiteGridBlock[] = [
  {
    id: 'profile',
    kind: 'profile',
    sticky: true,
    children: (
      <div className="flex flex-col gap-4">
        <CreatorHeader
          name="Desi Origins"
          tagline="How everyday things began"
        />
        <SocialIcons links={SAMPLE_SOCIALS} />
      </div>
    ),
  },
  {
    id: 'presets',
    kind: 'link',
    children: (
      <SiteLinkButton href="https://example.com/presets" fullWidth>
        Shop my presets
      </SiteLinkButton>
    ),
  },
  {
    id: 'app',
    kind: 'link',
    children: (
      <SiteLinkButton
        href="https://example.com/app"
        variant="outline"
        fullWidth
      >
        Get the app
      </SiteLinkButton>
    ),
  },
  {
    id: 'featured',
    kind: 'card',
    children: (
      <FeaturedLink
        href="https://www.youtube.com/watch?v=M7lc1UVf-VE"
        title="New: how tea came to India"
        detail="12 minutes, out now"
      />
    ),
  },
  {
    id: 'pack',
    kind: 'card',
    children: (
      <FeaturedPack
        title="Origins reel pack"
        detail="100 prompts, a guide and 12 templates"
        price="$12"
      />
    ),
  },
  {
    id: 'video',
    kind: 'media',
    children: (
      <SiteSection title="Latest video">
        <YouTubeVideo
          video="https://www.youtube.com/watch?v=M7lc1UVf-VE"
          title="How tea came to India"
          poster={null}
        />
      </SiteSection>
    ),
  },
  {
    id: 'booking',
    kind: 'card',
    children: (
      <BookingCard
        title="Origin story review"
        detail="I read your script and tell you what to cut."
        duration="30 min"
        price="$40"
        href="https://example.com/book"
        headingAs="h2"
      />
    ),
  },
  {
    id: 'membership',
    kind: 'card',
    children: (
      <MembershipCard
        title="Insiders"
        price="$5"
        perks={['A bonus story every week', 'Early access to new packs']}
        href="https://example.com/join"
        headingAs="h2"
        featured
      />
    ),
  },
  {
    id: 'links',
    kind: 'links',
    children: <LinkList label="Desi Origins links" links={SAMPLE_LINKS} />,
  },
  {
    id: 'lead',
    kind: 'card',
    children: (
      <LeadMagnet
        title="The origin story checklist"
        detail="One page to plan your next video."
        headingAs="h2"
        onSubmit={submit}
      />
    ),
  },
  {
    id: 'photos',
    kind: 'gallery',
    children: (
      <SiteSection title="Photos">
        <ImageGrid
          images={[
            { alt: 'Chai on a clay stove' },
            { alt: 'A spice market in Kochi' },
            { alt: 'Tea leaves drying in Assam' },
          ]}
        />
      </SiteSection>
    ),
  },
  {
    id: 'reviews',
    kind: 'text',
    children: (
      <SiteSection title="What people say">
        <Testimonials items={SAMPLE_TESTIMONIALS} />
      </SiteSection>
    ),
  },
  {
    id: 'newsletter',
    kind: 'band',
    children: (
      <NewsletterBand title="One origin story every Friday" onSubmit={submit} />
    ),
  },
  {
    id: 'footer',
    kind: 'band',
    children: (
      <CreatorFooter
        links={[
          { label: 'Privacy', href: '#top' },
          { label: 'Refunds', href: '#top' },
        ]}
      />
    ),
  },
];

/** The sample creator's page on the grid, with the layouts given. */
export function SampleGridPage({ layouts }: { layouts?: PageLayouts }) {
  return (
    <SiteGrid
      as="main"
      id="top"
      blocks={SAMPLE_GRID_BLOCKS}
      layouts={layouts}
    />
  );
}
