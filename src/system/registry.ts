import type { BlockKind } from './grid';

/*
 * Every block in the package, once. The id is the block's data-block name,
 * so tests, analytics and the page editor can find any block on a page; the
 * editor also reads `kind` for the grid and `group` for its menu. A test
 * checks every id and component name is used only once, and that each block
 * writes its own id.
 */

export const BLOCK_GROUPS = [
  'profile',
  'links',
  'selling',
  'offers',
  'media',
  'trust',
  'forms',
  'page',
] as const;
export type BlockGroup = (typeof BLOCK_GROUPS)[number];

export type BlockInfo = {
  /** Written on the block as data-block. */
  id: string;
  /** The component's name in this package. */
  component: string;
  kind: BlockKind;
  group: BlockGroup;
  /** Needs the browser ('use client'): it has state or effects. */
  client: boolean;
  /** One line on what it's for, for the editor's menu. */
  summary: string;
};

export const BLOCKS = [
  {
    id: 'creator-header',
    component: 'CreatorHeader',
    kind: 'profile',
    group: 'profile',
    client: false,
    summary: 'Profile picture, name and tagline',
  },
  {
    id: 'social-icons',
    component: 'SocialIcons',
    kind: 'link',
    group: 'profile',
    client: false,
    summary: 'Icon links to social accounts',
  },
  {
    id: 'link-list',
    component: 'LinkList',
    kind: 'links',
    group: 'links',
    client: false,
    summary: 'A column of links',
  },
  {
    id: 'featured-link',
    component: 'FeaturedLink',
    kind: 'card',
    group: 'links',
    client: false,
    summary: 'One link shown big, with a picture',
  },
  {
    id: 'pack-row',
    component: 'PackRow',
    kind: 'card',
    group: 'selling',
    client: false,
    summary: 'A product in a list, with its price',
  },
  {
    id: 'featured-pack',
    component: 'FeaturedPack',
    kind: 'card',
    group: 'selling',
    client: false,
    summary: 'The main product, big, with a buy button',
  },
  {
    id: 'pack-grid',
    component: 'PackGrid',
    kind: 'gallery',
    group: 'selling',
    client: false,
    summary: 'Smaller products in a grid',
  },
  {
    id: 'pack-checkout',
    component: 'PackCheckout',
    kind: 'band',
    group: 'selling',
    client: false,
    summary: 'Buy a digital product, with the download consent',
  },
  {
    id: 'booking-card',
    component: 'BookingCard',
    kind: 'card',
    group: 'offers',
    client: false,
    summary: 'A call or session to book',
  },
  {
    id: 'membership-card',
    component: 'MembershipCard',
    kind: 'card',
    group: 'offers',
    client: false,
    summary: 'A membership tier and what members get',
  },
  {
    id: 'lead-magnet',
    component: 'LeadMagnet',
    kind: 'card',
    group: 'offers',
    client: false,
    summary: 'Something free for an email address',
  },
  {
    id: 'tip-jar',
    component: 'TipJar',
    kind: 'card',
    group: 'offers',
    client: true,
    summary: 'Pick an amount and leave a tip',
  },
  {
    id: 'discount-code',
    component: 'DiscountCode',
    kind: 'card',
    group: 'offers',
    client: false,
    summary: 'A code to copy with one tap',
  },
  {
    id: 'countdown',
    component: 'Countdown',
    kind: 'card',
    group: 'offers',
    client: true,
    summary: 'Time left to a launch or the end of a sale',
  },
  {
    id: 'testimonials',
    component: 'Testimonials',
    kind: 'text',
    group: 'trust',
    client: false,
    summary: 'What buyers and fans say',
  },
  {
    id: 'faq-list',
    component: 'FaqList',
    kind: 'text',
    group: 'trust',
    client: false,
    summary: 'Questions that open one at a time',
  },
  {
    id: 'youtube-video',
    component: 'YouTubeVideo',
    kind: 'media',
    group: 'media',
    client: false,
    summary: 'A YouTube video that loads on play',
  },
  {
    id: 'reel-grid',
    component: 'ReelGrid',
    kind: 'gallery',
    group: 'media',
    client: false,
    summary: 'Reel thumbnails in a grid',
  },
  {
    id: 'image-grid',
    component: 'ImageGrid',
    kind: 'gallery',
    group: 'media',
    client: false,
    summary: 'Pictures in a grid',
  },
  {
    id: 'newsletter-band',
    component: 'NewsletterBand',
    kind: 'band',
    group: 'forms',
    client: false,
    summary: 'Newsletter sign-up',
  },
  {
    id: 'creator-footer',
    component: 'CreatorFooter',
    kind: 'band',
    group: 'page',
    client: false,
    summary: 'Policy links and the credit line',
  },
  {
    id: 'site-image',
    component: 'SiteImage',
    kind: 'media',
    group: 'media',
    client: false,
    summary: 'One picture, with a caption and a link',
  },
  {
    id: 'image-carousel',
    component: 'ImageCarousel',
    kind: 'media',
    group: 'media',
    client: true,
    summary: 'Pictures to swipe through, with captions and buttons',
  },
  {
    id: 'before-after',
    component: 'BeforeAfter',
    kind: 'media',
    group: 'media',
    client: true,
    summary: 'Drag to compare two pictures',
  },
  {
    id: 'logo-strip',
    component: 'LogoStrip',
    kind: 'band',
    group: 'trust',
    client: false,
    summary: 'Brand logos in a row, still or scrolling',
  },
  {
    id: 'contact-form',
    component: 'ContactForm',
    kind: 'card',
    group: 'forms',
    client: false,
    summary: 'Name, email and a message',
  },
  {
    id: 'save-contact',
    component: 'SaveContact',
    kind: 'link',
    group: 'profile',
    client: false,
    summary: 'Download a contact card for the phone',
  },
  {
    id: 'stats-row',
    component: 'StatsRow',
    kind: 'band',
    group: 'trust',
    client: false,
    summary: 'Big numbers that count up once',
  },
  {
    id: 'timeline',
    component: 'Timeline',
    kind: 'text',
    group: 'trust',
    client: false,
    summary: 'Dated milestones joined by a line',
  },
  {
    id: 'map-card',
    component: 'MapCard',
    kind: 'card',
    group: 'page',
    client: false,
    summary: 'A place with a map, hours and directions',
  },
  {
    id: 'qr-code',
    component: 'QrCode',
    kind: 'card',
    group: 'page',
    client: false,
    summary: 'A code to scan, with a download button',
  },
] as const satisfies readonly BlockInfo[];

/** The id of a block in this package. */
export type BlockId = (typeof BLOCKS)[number]['id'];

/** A block's entry by id, or undefined. */
export function blockInfo(id: string): BlockInfo | undefined {
  return BLOCKS.find((block) => block.id === id);
}
