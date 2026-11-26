import {
  AppIcon,
  BookingCard,
  Countdown,
  GoalTracker,
  DiscountCode,
  FaqList,
  FeaturedLink,
  ImageGrid,
  LeadMagnet,
  MembershipCard,
  SocialCard,
  MessageCard,
  SocialIcons,
  Testimonials,
  TipJar,
  CameraIcon,
  CreatorFooter,
  CreatorHeader,
  EmailIcon,
  FeaturedPack,
  GlobeIcon,
  LinkList,
  NewsletterBand,
  PackCheckout,
  PackRow,
  ReelGrid,
  SiteDivider,
  SiteLinkButton,
  SitePage,
  SiteSection,
  SiteText,
  VideoIcon,
  YouTubeVideo,
} from '../src';

/** Sample links, used by the link and page stories. */
export const SAMPLE_LINKS = [
  {
    label: 'YouTube channel',
    href: 'https://www.youtube.com/@example',
    icon: <VideoIcon size={20} />,
    detail: 'New video every Friday',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/example',
    icon: <CameraIcon size={20} />,
  },
  {
    label: 'Get the app',
    href: 'https://example.com/app',
    icon: <AppIcon size={20} />,
  },
  {
    label: 'Blog',
    href: 'https://example.com/blog',
    icon: <GlobeIcon size={20} />,
  },
  {
    label: 'Email me',
    href: 'mailto:hello@example.com',
    icon: <EmailIcon size={20} />,
  },
];

/** Sample social accounts, used by the social icons and page stories. */
export const SAMPLE_SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/example',
    icon: <CameraIcon size={20} />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@example',
    icon: <VideoIcon size={20} />,
  },
  {
    label: 'Website',
    href: 'https://example.com',
    icon: <GlobeIcon size={20} />,
  },
  {
    label: 'Email',
    href: 'mailto:hello@example.com',
    icon: <EmailIcon size={20} />,
  },
];

export const SAMPLE_TESTIMONIALS = [
  {
    quote: 'The prompts saved me a whole week of planning.',
    name: 'Meera K.',
    detail: 'Bought the reel pack',
    rating: 5,
  },
  {
    quote: 'Short, clear and fun. My students love these.',
    name: 'Arjun S.',
    detail: 'Insiders member',
  },
];

export const SAMPLE_FAQ = [
  {
    question: 'What do I get in the reel pack?',
    answer: '100 prompts, a guide and 12 templates, as one download.',
  },
  {
    question: 'Can I use the templates for clients?',
    answer: 'Yes, for any work you make. Just don’t resell the pack itself.',
  },
];

/** A fixed clock for the sample page's countdown, so it never changes. */
const SAMPLE_NOW = Date.UTC(2026, 11, 1, 9, 0, 0);

/** The words on the sample page a creator writes themselves. */
export type SampleWords = {
  name: string;
  tagline: string;
  button: string;
  featured: string;
  featuredDetail: string;
  pack: string;
  packDetail: string;
  price: string;
  links: typeof SAMPLE_LINKS;
};

export const SAMPLE_WORDS: SampleWords = {
  name: 'Desi Origins',
  tagline: 'How everyday things began',
  button: 'Shop my presets',
  featured: 'New: how tea came to India',
  featuredDetail: '12 minutes, out now',
  pack: 'Origins reel pack',
  packDetail: '100 prompts, a guide and 12 templates',
  price: '$12',
  links: SAMPLE_LINKS,
};

/**
 * A whole creator page built from the blocks, as a creator might set it up.
 * Pass `words` to try other names, titles and prices, such as very long ones
 * or another language.
 */
export function SamplePage({ words = SAMPLE_WORDS }: { words?: SampleWords }) {
  return (
    <SitePage as="main" id="top">
      <CreatorHeader name={words.name} tagline={words.tagline} />
      <SocialIcons links={SAMPLE_SOCIALS} />
      <SiteLinkButton href="https://example.com/presets" fullWidth>
        {words.button}
      </SiteLinkButton>
      <FeaturedLink
        href="https://www.youtube.com/watch?v=M7lc1UVf-VE"
        title={words.featured}
        detail={words.featuredDetail}
      />
      <LinkList label={`${words.name} links`} links={words.links} />
      <SocialCard
        platform="instagram"
        handle="desiorigins"
        name={words.name}
        followers={128000}
        tile="2x1"
      />
      <SiteSection title="Latest video">
        <YouTubeVideo
          video="https://www.youtube.com/watch?v=M7lc1UVf-VE"
          title="How tea came to India"
          poster={null}
        />
      </SiteSection>
      <SiteSection title="Packs">
        <FeaturedPack
          title={words.pack}
          detail={words.packDetail}
          price={words.price}
          headingAs="h3"
        />
        <PackRow title="Prompt starter kit" detail="50 prompts" price="$7" />
        <PackCheckout
          price={words.price}
          onSubmit={(event) => event.preventDefault()}
        />
      </SiteSection>
      <SiteSection title="Coming soon">
        <Countdown
          title="The caption playbook drops in"
          to={new Date(SAMPLE_NOW + 3 * 86_400_000 + 5 * 3_600_000)}
          now={SAMPLE_NOW}
        />
        <DiscountCode
          code="ORIGINS10"
          detail="10% off the reel pack"
          copy={() => Promise.resolve()}
        />
        <GoalTracker
          title="Film the spice series"
          deadline={new Date(SAMPLE_NOW + 30 * 86_400_000).toISOString()}
          now={SAMPLE_NOW}
          bar="steps"
          items={[
            { label: 'Write the scripts', done: true },
            { label: 'Film five episodes', done: true },
            { label: 'Edit and post' },
          ]}
        />
      </SiteSection>
      <SiteSection title="Work with me">
        <BookingCard
          title="Origin story review"
          detail="I read your script and tell you what to cut."
          duration="30 min"
          price="$40"
          href="https://example.com/book"
        />
        <MembershipCard
          title="Insiders"
          price="$5"
          perks={['A bonus story every week', 'Early access to new packs']}
          href="https://example.com/join"
          featured
        />
        <MessageCard
          channel="whatsapp"
          name={words.name}
          picture={null}
          detail="Usually replies within an hour"
          to="+91 98765 43210"
          message="Hi! I’d like a quote for a custom print."
        />
      </SiteSection>
      <SiteSection title="Free">
        <LeadMagnet
          title="The origin story checklist"
          detail="One page to plan your next video."
          onSubmit={(event) => event.preventDefault()}
        />
      </SiteSection>
      <SiteSection title="Reels">
        <ReelGrid reels={[{}, {}, {}]} />
      </SiteSection>
      <SiteSection title="Photos">
        <ImageGrid
          images={[
            { alt: 'Chai on a clay stove' },
            { alt: 'A spice market in Kochi' },
            { alt: 'Tea leaves drying in Assam' },
          ]}
        />
      </SiteSection>
      <SiteSection title="What people say">
        <Testimonials items={SAMPLE_TESTIMONIALS} />
      </SiteSection>
      <SiteSection title="Questions">
        <FaqList items={SAMPLE_FAQ} />
      </SiteSection>
      <TipJar
        title="Buy me a chai"
        onSubmit={(event) => event.preventDefault()}
      />
      <NewsletterBand
        title="One origin story every Friday"
        onSubmit={(event) => event.preventDefault()}
      />
      <SiteSection title="About">
        <SiteText>
          Short stories about where everyday things come from.
        </SiteText>
        <SiteText muted>Based in Pune.</SiteText>
      </SiteSection>
      <SiteDivider />
      <CreatorFooter
        links={[
          { label: 'Privacy', href: '#top' },
          { label: 'Refunds', href: '#top' },
        ]}
      />
    </SitePage>
  );
}
