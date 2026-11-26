import type { ReactNode } from 'react';
import {
  ActionCard,
  AppIcon,
  BookingCard,
  Countdown,
  DiscountCode,
  FaqList,
  FeaturedLink,
  ImageGrid,
  MembershipCard,
  SocialIcons,
  Testimonials,
  CameraIcon,
  CreatorFooter,
  CreatorHeader,
  CreatorTheme,
  EmailIcon,
  FeaturedPack,
  GlobeIcon,
  LinkList,
  PackGrid,
  PackRow,
  QuoteBlock,
  ReelGrid,
  SectionHeading,
  ShareIcon,
  SiteButton,
  SiteDivider,
  SiteLinkButton,
  SiteSection,
  SiteText,
  Spacer,
  TextBlock,
  VideoIcon,
  YouTubeVideo,
  type SiteTheme,
} from '../src';
import {
  CheckoutDemo,
  LeadMagnetDemo,
  LockedLinkDemo,
  NewsletterDemo,
  TipJarDemo,
} from './demos';

/** A fixed clock for the countdown, so the gallery never changes. */
const NOW = Date.UTC(2026, 11, 1, 9, 0, 0);

const THEMES: { id: string; title: string; theme: SiteTheme }[] = [
  { id: 'light', title: 'Light', theme: { scheme: 'light' } },
  { id: 'dark', title: 'Dark', theme: { scheme: 'dark' } },
  {
    id: 'custom',
    title: 'A creator’s own theme',
    theme: {
      scheme: 'light',
      colors: {
        surface: '#ecfdf5',
        surface2: '#d1fae5',
        border: '#a7f3d0',
        link: '#0f766e',
        accent: '#0f766e',
        onAccent: '#ffffff',
        band: '#134e4a',
        onBand: '#ffffff',
      },
      corners: 'square',
      buttonShape: 'rounded',
      font: 'Georgia, serif',
    },
  },
];

/**
 * The page-block gallery: every block in the sample creator's light and dark
 * schemes, and in a creator's own theme. The end-to-end tests
 * (e2e/blocks.spec.ts) run against it.
 */
export function Gallery() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col gap-6 p-[clamp(12px,3vw,40px)]"
    >
      <header id="top" className="flex flex-col gap-2">
        <h1 className="m-0 text-[clamp(30px,4vw,44px)] font-bold tracking-[-1px]">
          Levuche page blocks
        </h1>
        <p className="m-0 max-w-[60ch] text-[#3a3b5c]">
          Everything in <code>@levuche/ui</code>: the blocks a creator’s
          levuche.page site is built from. Each panel is one theme.
        </p>
      </header>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-6">
        {THEMES.map((t) => (
          <Panel key={t.id} {...t} />
        ))}
      </div>
    </main>
  );
}

function Panel({
  id,
  title,
  theme,
}: {
  id: string;
  title: string;
  theme: SiteTheme;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex min-w-0 flex-col gap-3"
    >
      <h2 id={`${id}-title`} className="m-0 text-xl font-bold">
        {title}
      </h2>
      <CreatorTheme
        theme={theme}
        data-testid={`panel-${id}`}
        className="border-site-border rounded-site flex flex-col gap-6 border p-5"
      >
        <CreatorHeader
          name="Desi Origins"
          tagline="How everyday things began"
          headingAs="p"
        />

        <Group id={id} name="buttons" title="Buttons">
          <div className="flex flex-wrap items-center gap-2">
            <SiteButton>Solid</SiteButton>
            <SiteButton variant="outline">Outline</SiteButton>
            <SiteButton variant="soft" icon={<ShareIcon size={18} />}>
              Share
            </SiteButton>
            <SiteButton variant="text">Text</SiteButton>
            <SiteButton disabled>Sold out</SiteButton>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SiteButton size="sm">Small</SiteButton>
            <SiteButton size="md">Medium</SiteButton>
            <SiteButton size="lg">Large</SiteButton>
          </div>
          <SiteLinkButton href="https://example.com/presets" fullWidth>
            Shop my presets
          </SiteLinkButton>
        </Group>

        <Group id={id} name="social" title="Social and featured link">
          <SocialIcons
            links={[
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
                label: 'Email',
                href: 'mailto:hello@example.com',
                icon: <EmailIcon size={20} />,
              },
            ]}
          />
          <FeaturedLink
            href="https://www.youtube.com/watch?v=M7lc1UVf-VE"
            title="New: how tea came to India"
            detail="12 minutes, out now"
          />
          <ActionCard
            href="https://example.com/presets"
            title="Story presets"
            detail="Twelve looks for your reels, ready to drop in"
            buttonLabel="Shop the presets"
            ribbon="New"
            media={{
              type: 'covers',
              covers: [{ src: null }, { src: null }, { src: null }],
            }}
          />
        </Group>

        <Group id={id} name="links" title="Links">
          <LinkList
            label="Desi Origins links"
            links={[
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
            ]}
          />
        </Group>

        <Group id={id} name="video" title="Video">
          <YouTubeVideo
            video="https://www.youtube.com/watch?v=M7lc1UVf-VE"
            title="How tea came to India"
            poster={null}
          />
        </Group>

        <Group id={id} name="selling" title="Packs">
          <FeaturedPack
            title="Origins reel pack"
            detail="100 prompts, a guide and 12 templates"
            price="$12"
            headingAs="p"
          />
          <PackRow title="Prompt starter kit" detail="50 prompts" price="$7" />
          <PackGrid
            packs={[
              { title: 'Starter kit', price: '$7' },
              { title: 'Caption playbook', price: '$5' },
            ]}
          />
          <CheckoutDemo />
        </Group>

        <Group id={id} name="offers" title="Calls, memberships, freebies">
          <BookingCard
            title="Origin story review"
            detail="I read your script and tell you what to cut."
            duration="30 min"
            price="$40"
            href="https://example.com/book"
            headingAs="p"
          />
          <MembershipCard
            title="Insiders"
            price="$5"
            perks={['A bonus story every week', 'Early access to new packs']}
            href="https://example.com/join"
            featured
            headingAs="p"
          />
          <LeadMagnetDemo />
        </Group>

        <Group id={id} name="tips" title="Tips">
          <TipJarDemo />
        </Group>

        <Group id={id} name="locked" title="Locked link">
          <LockedLinkDemo />
        </Group>

        <Group id={id} name="promo" title="Countdown and code">
          <Countdown
            title="The caption playbook drops in"
            to={new Date(NOW + 3 * 86_400_000 + 5 * 3_600_000)}
            now={NOW}
          />
          <DiscountCode code="ORIGINS10" detail="10% off the reel pack" />
        </Group>

        <Group id={id} name="photos" title="Photos">
          <ImageGrid
            images={[
              { alt: 'Chai on a clay stove', href: 'https://example.com/chai' },
              { alt: 'A spice market in Kochi' },
              { alt: 'Tea leaves drying in Assam' },
            ]}
          />
        </Group>

        <Group id={id} name="reviews" title="Reviews and questions">
          <Testimonials
            items={[
              {
                quote: 'The prompts saved me a whole week of planning.',
                name: 'Meera K.',
                detail: 'Bought the reel pack',
                rating: 5,
              },
            ]}
          />
          <FaqList
            items={[
              {
                question: 'What do I get in the reel pack?',
                answer: '100 prompts, a guide and 12 templates.',
              },
            ]}
          />
        </Group>

        <Group id={id} name="text" title="Headings, text and quotes">
          <SectionHeading
            id={`${id}-works`}
            title="My works"
            detail="Every story, newest first"
            headingAs="p"
          />
          <TextBlock
            text={
              'Stories about **everyday things**, in *under a minute* 🍵\n- New every Friday\n- [Watch on YouTube](https://www.youtube.com/@example)'
            }
          />
          <Spacer line />
          <QuoteBlock
            quote="The best minute of my day."
            name="Meera K."
            avatar={null}
          />
        </Group>

        <Group id={id} name="reels" title="Reels">
          <ReelGrid reels={[{}, {}, {}]} />
        </Group>

        <Group id={id} name="newsletter" title="Newsletter">
          <NewsletterDemo />
        </Group>

        <SiteSection title="About" headingAs="h3">
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
      </CreatorTheme>
    </section>
  );
}

function Group({
  id,
  name,
  title,
  children,
}: {
  id: string;
  name: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-${name}`}
      data-testid={name}
      className="flex flex-col gap-3"
    >
      <h3
        id={`${id}-${name}`}
        className="text-site-text-2 m-0 text-xs font-bold tracking-wide uppercase"
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
