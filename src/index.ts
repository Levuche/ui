// @levuche/ui: the blocks a creator's levuche.page site is built from. Every
// block reads only --site-* tokens, so a creator's theme (colours, corners,
// button shape, font) restyles all of them. Import './tokens.css' once.
//
// The package is built in levels, each using only the levels above it here:
// system (plain data and functions), atoms (one element: a button, a link),
// molecules (a few atoms: a link tile, an email form), organisms (the blocks
// a creator adds to a page) and templates (page layouts). See the README.

// System: theme, look, links, state, tracking, grid and the block registry
export { cn } from './system/cn';
export {
  CreatorTheme,
  isSafeColor,
  isSafeFont,
  siteThemeStyle,
  type SiteButtonShape,
  type SiteColors,
  type SiteCorners,
  type SiteTheme,
} from './system/theme';
export {
  BLOCK_ALIGNS,
  BLOCK_MOTIONS,
  BLOCK_RADII,
  BLOCK_SCALES,
  BLOCK_SCREENS,
  BLOCK_SHADOWS,
  BLOCK_TONES,
  lookProps,
  splitLook,
  type BlockAlign,
  type BlockLook,
  type BlockMotion,
  type BlockRadius,
  type BlockScale,
  type BlockScreen,
  type BlockShadow,
  type BlockTone,
  type LookProps,
} from './system/look';
export {
  isExternalHref,
  isSafeHref,
  linkAttrs,
  safeHref,
  type LinkBehavior,
} from './system/href';
export { useControllableState, type FormStatus } from './system/state';
export {
  readBlockAction,
  useBlockActions,
  type BlockAction,
} from './system/actions';
export {
  BLOCKS,
  BLOCK_GROUPS,
  blockInfo,
  type BlockGroup,
  type BlockId,
  type BlockInfo,
} from './system/registry';
export {
  BLOCK_SIZES,
  GRID_BREAKPOINTS,
  GRID_COLUMNS,
  GRID_GAP,
  GRID_ROW,
  GRID_SCREENS,
  GRID_WIDTH,
  columnsFor,
  defaultLayout,
  fitLayout,
  layoutBottom,
  limitsFor,
  pageLayouts,
  rowsFor,
  stackLayout,
  type BlockKind,
  type BlockSize,
  type GridBlockSpec,
  type GridItem,
  type GridLayout,
  type GridLimits,
  type GridScreen,
  type PageLayouts,
} from './system/grid';

// Atoms
export {
  Block,
  withBlockLook,
  type BlockRootProps,
  type BlockTag,
  type DataAttributes,
} from './atoms/block';
export {
  SiteButton,
  SiteLinkButton,
  siteButtonClasses,
  type ButtonLook,
  type SiteButtonSize,
  type SiteButtonVariant,
} from './atoms/button';
export { SiteLink } from './atoms/link';
export {
  Badge,
  Eyebrow,
  SiteDivider,
  SiteHeading,
  SiteText,
} from './atoms/text';
export { SiteInput, SiteTextarea, siteInputClasses } from './atoms/input';
export { Thumb, type ThumbRatio } from './atoms/thumb';
export { Avatar, initials } from './atoms/avatar';
export * from './atoms/icons';

// Molecules
export { SiteSection } from './molecules/section';
export { ItemHead, type HeadingTag } from './molecules/item-head';
export { LinkTile, type LinkTileStyle } from './molecules/link-tile';
export { Price } from './molecules/price';
export { Rating } from './molecules/rating';
export { CheckList } from './molecules/check-list';
export { FormNotice } from './molecules/form-notice';
export {
  EMAIL_FORM_LABELS,
  EmailForm,
  type EmailFormLabels,
} from './molecules/email-form';
export {
  COPY_LABELS,
  CopyButton,
  type CopyLabels,
} from './molecules/copy-button';
export { PlayFrame, type FrameRatio } from './molecules/play-frame';

// Organisms: the blocks
export { CreatorHeader } from './organisms/profile';
export {
  FeaturedLink,
  LinkList,
  SocialIcons,
  type LinkItem,
} from './organisms/links';
export {
  BuyButton,
  FeaturedPack,
  PackCheckout,
  PackGrid,
  PackRow,
  type PackCheckoutLabels,
} from './organisms/selling';
export {
  BookingCard,
  LeadMagnet,
  MembershipCard,
  type LeadMagnetLabels,
} from './organisms/offers';
export { TIP_JAR_LABELS, TipJar, type TipJarLabels } from './organisms/tip-jar';
export { DiscountCode } from './organisms/discount';
export {
  COUNTDOWN_LABELS,
  Countdown,
  timeLeft,
  type CountdownLabels,
} from './organisms/countdown';
export { FaqList, Testimonials } from './organisms/trust';
export { ReelGrid, YouTubeVideo, youtubeId } from './organisms/media';
export { ImageGrid } from './organisms/images';
export { LogoStrip, SiteImage, type Logo } from './organisms/pictures';
export {
  CAROUSEL_LABELS,
  ImageCarousel,
  type CarouselLabels,
  type CarouselSlide,
} from './organisms/carousel';
export {
  BEFORE_AFTER_LABELS,
  BeforeAfter,
  type BeforeAfterLabels,
} from './organisms/before-after';
export { NewsletterBand } from './organisms/newsletter';
export { CreatorFooter } from './organisms/footer';

// Templates
export { SitePage } from './templates/page';
export { SiteGrid, type SiteGridBlock } from './templates/site-grid';
