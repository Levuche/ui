import {
  AppIcon,
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

/** A whole creator page built from the blocks, as a creator might set it up. */
export function SamplePage() {
  return (
    <SitePage as="main" id="top">
      <CreatorHeader name="Desi Origins" tagline="How everyday things began" />
      <SiteLinkButton href="https://example.com/presets" fullWidth>
        Shop my presets
      </SiteLinkButton>
      <LinkList label="Desi Origins links" links={SAMPLE_LINKS} />
      <SiteSection title="Latest video">
        <YouTubeVideo
          video="https://www.youtube.com/watch?v=M7lc1UVf-VE"
          title="How tea came to India"
          poster={null}
        />
      </SiteSection>
      <SiteSection title="Packs">
        <FeaturedPack
          title="Origins reel pack"
          detail="100 prompts, a guide and 12 templates"
          price="$12"
          headingAs="h3"
        />
        <PackRow title="Prompt starter kit" detail="50 prompts" price="$7" />
        <PackCheckout
          price="$12"
          onSubmit={(event) => event.preventDefault()}
        />
      </SiteSection>
      <SiteSection title="Reels">
        <ReelGrid reels={[{}, {}, {}]} />
      </SiteSection>
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
