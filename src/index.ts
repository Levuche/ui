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
  SITE_CARD_STYLES,
  SITE_HOVERS,
  siteThemeAttributes,
  siteThemeStyle,
  type SiteButtonShape,
  type SiteCardStyle,
  type SiteColors,
  type SiteCorners,
  type SiteHover,
  type SiteTheme,
} from './system/theme';
export {
  CONTROL_CONTRAST,
  SCHEME_COLORS,
  TEXT_CONTRAST,
  backgroundIssues,
  colorHex,
  contrastIssues,
  contrastRatio,
  fixBackground,
  fixContrast,
  type BackgroundIssue,
  type ContrastIssue,
} from './system/contrast';
export {
  SITE_LOOKS,
  SITE_LOOK_NAMES,
  siteLook,
  type SiteLook,
  type SiteLookName,
} from './system/looks';
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
  BACKGROUND_FILLS,
  BACKGROUND_INKS,
  BACKGROUND_PATTERNS,
  BACKGROUND_POSITIONS,
  BACKGROUND_TYPES,
  DEFAULT_ANGLE,
  DEFAULT_DIM,
  DEFAULT_PATTERN_OPACITY,
  MAX_PATTERN_OPACITY,
  MIN_DIM,
  backgroundProps,
  cleanBackground,
  type BackgroundFill,
  type BackgroundInk,
  type BackgroundPattern,
  type BackgroundPosition,
  type BackgroundProps,
  type BackgroundType,
  type BlockBackground,
  type CleanBackground,
  type GradientBackground,
  type ImageBackground,
  type PatternBackground,
} from './system/background';
export {
  isExternalHref,
  isSafeHref,
  isSafeMediaSrc,
  linkAttrs,
  safeHref,
  type LinkBehavior,
} from './system/href';
export { useControllableState, type FormStatus } from './system/state';
export { SERVER_LOCALE, useHydrated, useVisitorLocale } from './system/locale';
export {
  readBlockAction,
  useBlockActions,
  type BlockAction,
} from './system/actions';
export {
  BLOCKS,
  BLOCK_GROUPS,
  BLOCK_PACKS,
  blockInfo,
  blocksInPack,
  isPaidPack,
  type BlockGroup,
  type BlockPack,
  type BlockId,
  type BlockInfo,
  mainLinkSetting,
  settingsPanel,
} from './system/registry';
export {
  BUTTON_VARIANT_LABELS,
  BUTTON_VARIANT_OPTIONS,
  COLOUR_SETTINGS,
  FORM_APP_ONLY,
  LINK_BEHAVIOR_SETTINGS,
  LIST_VALUE_TYPES,
  LIVE_APP_ONLY,
  LOOK_SETTINGS,
  RATIO_LABELS,
  RATIO_OPTIONS,
  SAVE_LABEL_SETTING,
  SELL_APP_ONLY,
  SELL_SETTINGS,
  SETTING_ICONS,
  SETTING_TYPES,
  fitsSetting,
  settingDefaults,
  settingIcon,
  type ChoiceSetting,
  type ChoiceValue,
  type ColourSetting,
  type DateTimeSetting,
  type GroupSetting,
  type LinkSetting,
  type ListSetting,
  type ListValueType,
  type NumberSetting,
  type PictureSetting,
  type ProductSetting,
  type SettingField,
  type SettingIcon,
  type SettingType,
  type TextSetting,
  type ToggleSetting,
  type WordsSetting,
} from './system/settings';
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
  fitHeights,
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
  Ribbon,
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
export { Price, priceSaving } from './molecules/price';
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
export { Field } from './molecules/field';
export {
  LIVE_DATA_LABELS,
  LiveData,
  SkeletonLines,
  type LiveDataLabels,
} from './molecules/live-data';
export { StatList, type StatItem } from './molecules/stat-list';
export { Sparkline } from './molecules/sparkline';
export {
  AUDIO_BAR_LABELS,
  AudioBar,
  clock,
  type AudioBarLabels,
} from './molecules/audio-bar';
export { SiteDialog } from './molecules/dialog';
export { Segmented, type SegmentOption } from './molecules/segmented';
export { CountUp, type NumberStyle } from './molecules/count-up';
export { RichText } from './molecules/rich-text';
export { HiddenText, MessageComposer } from './molecules/message-composer';

// Organisms: the blocks
export { CreatorHeader } from './organisms/profile';
export { ActionCard, type ActionCardMedia } from './organisms/action-card';
export {
  FeaturedLink,
  LinkList,
  SocialIcons,
  type LinkItem,
} from './organisms/links';
export {
  BuyButton,
  CREDIT_PACK_LABELS,
  CreditPack,
  FeaturedPack,
  PackCheckout,
  PackGrid,
  PACK_CHECKOUT_LABELS,
  PackRow,
  type CreditPackLabels,
  type PackCheckoutLabels,
} from './organisms/selling';
export {
  SLOT_PICKER_LABELS,
  SlotPicker,
  type SlotPickerLabels,
} from './organisms/slot-picker';
export {
  cleanSellRef,
  readSell,
  referralHref,
  SELL_LABELS,
  sellJson,
  sellKind,
  type CreditSell,
  type ItemSell,
  type PlanSell,
  type SellKind,
  type SellLabels,
  type SellRef,
  type SellState,
} from './system/sell';
export {
  SellButton,
  SellField,
  type BuyRender,
  type SellProps,
} from './molecules/sell-button';
export { ChoiceChips, type ChipOption } from './molecules/choice-chips';
export {
  BookingCard,
  LEAD_MAGNET_LABELS,
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
export {
  QuoteBlock,
  SPACER_MAX_ROWS,
  SectionHeading,
  Spacer,
  TextBlock,
  spacerHeight,
} from './organisms/text-blocks';
export {
  RICH_TEXT_MAX_LENGTH,
  anchorId,
  parseInline,
  parseRichText,
  richTextWords,
  type RichBlock,
  type RichInline,
  type RichLine,
} from './system/rich-text';
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
export {
  CONTACT_FORM_LABELS,
  ContactForm,
  MESSAGE_CARD_LABELS,
  MessageCard,
  SaveContact,
  toVCard,
  type ContactCard,
  type ContactFormLabels,
  type MessageCardLabels,
} from './organisms/contact';
export {
  MESSAGE_CHANNELS,
  MESSAGE_MAX_LENGTH,
  SUBJECT_MAX_LENGTH,
  cleanEmail,
  cleanMessageTarget,
  cleanMessageText,
  cleanMessenger,
  cleanPhone,
  cleanTelegram,
  hideText,
  isMessageChannel,
  messageHref,
  messageTargetText,
  revealText,
  type MessageChannel,
  type MessageLinkInput,
} from './system/message';
export {
  MAP_CARD_LABELS,
  MapCard,
  StatsRow,
  Timeline,
  directionsUrl,
  mapEmbedUrl,
  type MapCardLabels,
  type OpeningHours,
  type Stat,
  type TimelineItem,
} from './organisms/info';
export {
  QrCode,
  qrEncode,
  qrSvg,
  type QrEncoder,
  type QrLevel,
} from './organisms/qr-code';
export {
  LOCKED_LINK_LABELS,
  LockedLink,
  type LockMode,
  type LockedLinkLabels,
  type UnlockLink,
} from './organisms/locked-link';
export {
  COURSE_CARD_LABELS,
  CourseCard,
  TOP_PICKS_LABELS,
  TopPicks,
  type CourseCardLabels,
  type TopPick,
  type TopPicksLabels,
} from './organisms/store';
export {
  PRICING_TABLE_LABELS,
  PricingTable,
  type BillingPeriod,
  type Plan,
  type PricingTableLabels,
} from './organisms/pricing';
export {
  BOOKING_EMBED_LABELS,
  BookingEmbed,
  type BookingEmbedLabels,
} from './organisms/booking-embed';
export { liveView, type LiveProps } from './system/live';
export { Skeleton } from './atoms/skeleton';
export {
  CONTRIBUTION_LABELS,
  ContributionGraph,
  GITHUB_LABELS,
  GitHubProfile,
  PACKAGE_LABELS,
  PackageStats,
  REPO_LABELS,
  RepoCard,
  RepoList,
  TechStack,
  contributionLevel,
  type ContributionData,
  type ContributionLabels,
  type GitHubLabels,
  type GitHubProfileData,
  type PackageData,
  type PackageLabels,
  type RepoData,
  type RepoLabels,
  type TechItem,
} from './organisms/developer';
export {
  EMBED_SERVICES,
  appleMusicEmbed,
  deezerEmbed,
  embedFor,
  instagramEmbed,
  loomEmbed,
  soundcloudEmbed,
  spotifyEmbed,
  tiktokEmbed,
  tintedSrc,
  vimeoEmbed,
  type Embed,
  type EmbedService,
  type EmbedShape,
} from './system/embeds';
export {
  AppleMusicEmbed,
  DeezerEmbed,
  EMBED_LABELS,
  InstagramPost,
  LinkEmbed,
  SoundCloudEmbed,
  SpotifyEmbed,
  TikTokVideo,
  type EmbedLabels,
  type SoundCloudPlayer,
} from './organisms/embeds';
export {
  AudioPlayer,
  PodcastEpisodes,
  type PodcastEpisode,
} from './organisms/audio';
export {
  EVENT_LIST_LABELS,
  EventList,
  LatestPosts,
  LatestVideos,
  LIVE_STATUS_LABELS,
  LiveStatus,
  NOW_PLAYING_LABELS,
  NowPlaying,
  REVIEW_SUMMARY_LABELS,
  ReviewSummary,
  type EventItem,
  type EventListLabels,
  type LiveStatusData,
  type LiveStatusLabels,
  type NowPlayingKind,
  type PostItem,
  type ReviewSummaryData,
  type ReviewSummaryLabels,
  type VideoItem,
} from './organisms/feeds';
export {
  columnSizes,
  cssImageUrl,
  imageAttrs,
  toImageSource,
  type ImageSource,
  type ImageSrc,
} from './system/image';
export {
  SOCIAL_CARD_LABELS,
  SOCIAL_CARD_TILES,
  SocialCard,
  type SocialCardLabels,
  type SocialCardTile,
  type SocialPost,
} from './organisms/social';
export {
  SOCIAL_ACTIONS,
  SOCIAL_COUNTS,
  SOCIAL_PLATFORM_INFO,
  SOCIAL_PLATFORMS,
  cleanHandle,
  isSocialPlatform,
  shortCount,
  socialHandleText,
  socialProfileHref,
  socialTint,
  type SocialAction,
  type SocialCount,
  type SocialPlatform,
  type SocialPlatformInfo,
} from './system/social';
