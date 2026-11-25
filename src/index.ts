// @levuche/ui: the blocks a creator's levuche.page site is built from. Every
// block reads only --site-* tokens, so a creator's theme (colours, corners,
// button shape, font) restyles all of them. Import './tokens.css' once.

export { cn } from './cn';

// Theme
export {
  CreatorTheme,
  isSafeColor,
  isSafeFont,
  siteThemeStyle,
  type SiteButtonShape,
  type SiteColors,
  type SiteCorners,
  type SiteTheme,
} from './theme';

// Buttons, links and text
export {
  SiteButton,
  SiteDivider,
  SiteHeading,
  SiteLinkButton,
  SitePage,
  SiteSection,
  SiteText,
  siteButtonClasses,
  type SiteButtonSize,
  type SiteButtonVariant,
} from './basics';
export { FeaturedLink, LinkList, LinkTile, SocialIcons } from './links';
export { ImageGrid } from './images';

// Profile
export { Avatar, CreatorHeader, initials } from './profile';

// Selling
export {
  BuyButton,
  FeaturedPack,
  PackCheckout,
  PackGrid,
  PackRow,
} from './selling';

// Offers, tips and codes
export { BookingCard, LeadMagnet, MembershipCard } from './offers';
export { TipJar } from './tip-jar';
export { DiscountCode } from './discount';
export { Countdown, timeLeft } from './countdown';

// Reviews and questions
export { FaqList, Testimonials } from './trust';

// Media
export { ReelGrid, YouTubeVideo, youtubeId } from './media';

// Sign-up and footer
export { NewsletterBand } from './newsletter';
export { CreatorFooter } from './footer';

// Icons
export * from './icons';
