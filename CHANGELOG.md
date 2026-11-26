# Changelog

What changed in each release of `@levuche/ui`, newest first. Each release
pull request into `dev` adds its section here, with anything an app must
change when it moves to that version.

## Unreleased

### Added

- Preview mode for the page editor: inside `<PreviewMode>`, every block
  looks as it does live, but links and downloads don't open, forms don't
  send, `useBlockActions` reports nothing (so no checkout starts) and
  players from other sites and booking pages show a still placeholder
  (`data-preview-placeholder`) instead of loading. Blocks stay in the tab
  order so the editor can select them from the keyboard. Client blocks read
  it with `usePreviewMode()`; `inPreview` and `previewStop` say what it
  stops. `Editor/Preview mode` in Storybook presses every block in it.
- `GoalTracker`: a goal with a title, a deadline chip with the days left,
  steps the creator ticks off and a bar with the percentage, worked out from
  the steps that are done or from `current` towards a `target`, written as
  money with a `currency` code or as a count ("$370 of $1,000"). Says "Goal
  reached" once it's done. `ProgressList`: bars for skills, ratings or
  languages, each with its number as a percentage, a value out of its most
  ("4 of 5") or none. Both in the trust group of the growth pack.
- `ProgressBar`: a bar in the theme's accent, smooth or in 2 to 20 steps,
  with `role="progressbar"` and its value for screen readers; it never moves
  for visitors who ask for less motion. `DaysLeft`: a deadline as a chip
  with the days left, which waits for the browser so the page hydrates
  cleanly. The sums are plain functions: `progressOf` (held between 0 and
  the target, rounding down so 100% means done), `filledSteps`,
  `formatAmount`, `formatPercent`, `currencyCode`, `deadlineState` and
  `formatDeadline`.
- More hovers: `SiteTheme.hover` takes `tint` (the fill deepens), `zoom`
  (the picture grows a little, clipped to the card) and `glow` (a line and
  soft glow in the button colour), beside `lift` and `none`, and a block can
  pick its own with the `hover` look prop (in `LOOK_SETTINGS` as "Under
  the pointer"). Each has a matching press on tap
  and shows when a keyboard reaches the link, with a focus ring; nothing moves
  for visitors who ask for less motion. The featured link card and social
  icons now take the hover too, and `data-hover-preview` shows it without the
  pointer. Storybook's toolbar has a Hover menu, and `Pages/Hover` shows each.
- Text blocks in a new `text` group, free in `core`: `SectionHeading` (a
  heading a link can jump to, with a line of detail), `TextBlock` (bold,
  italic, links, lists and emoji), `QuoteBlock` (a quote with who said it
  and a small picture) and `Spacer` (a gap of whole grid rows, or a thin
  line). What a creator types is never read as HTML (`parseRichText`,
  `RichText`).
- Motion inside blocks. `effect` on every block's look (`BLOCK_EFFECTS`):
  `float`, `pulse` and `shimmer` play for under five seconds, and `tilt`
  leans towards the mouse. `<BlockEffects />` or `useBlockEffects()` once on
  the page holds loops while a block is off screen and runs the tilt.
  `TextStrip`, a band of words that scrolls across with a speed, direction,
  separator and pause button (growth pack, page group). `CreatorHeader`
  takes `wordRing`, words that turn in a ring around the picture, with a
  pause button. Nothing moves for visitors who ask for less motion, moving
  words are read to screen readers once, and both hold still off screen.
  Also `WordRing`, `MotionToggle`, `useOnScreen` and the plain helpers
  `motionSeconds`, `stripRepeats` and `wordRingShape`. `effect` is in
  `LOOK_SETTINGS`, and `TextStrip` and the word ring have their settings.
- Link tiles in new shapes. `LinkTile` takes `variant` (`row`, `icon`: a
  square tile with a big logo or picture and an arrow badge, `chip`: a small
  tile tinted in the link's brand colour, `tint`) and `look` (`preview`,
  `favicon` or `text`: the site's preview picture, only its icon, or only
  words, from `image` and the new `favicon`; the app reads both from the
  link). `LinkList` takes the same `variant` and `look` (chips four to a
  row, square tiles two). New blocks: `LinkCard` (one link with its site's
  preview), `LogoTile`, `LinkChip` and `AppBadges` (App Store and Google
  Play badges, words in `APP_BADGE_LABELS`). New grid kinds `tile` and
  `chip` in `BLOCK_SIZES`. Picture addresses are checked as `cssImageUrl`
  does and brand colours with `isSafeColor`.
- The page's language: `SiteTheme.language` and `<CreatorTheme words>`, so
  every block's own words, numbers and dates follow the page with no `labels`
  on any block. Ready word sets in English, Hindi, Spanish, German, French and
  Portuguese, each loaded on its own with `loadPageWords`; a block's own
  `labels` and word props still win. Storybook's toolbar has a Language menu.
- `TileGallery`: pictures and uploaded videos in square cells, each tile
  one cell, two wide, two tall or a big square of four (`span`), two
  columns on a phone. In the media pack.
- `VideoTile`: a video file the creator uploaded (mp4, mov or webm), wide,
  tall (9:16), square or 4:5, with its first frame or a cover picture. It
  plays with sound only when pressed; `loop` plays it without sound while
  on the screen, with pause and sound buttons, and never for visitors who
  ask for less motion. Captions from `tracks` (WebVTT), a `transcriptHref`
  link, and its words in `labels` (`VIDEO_TILE_LABELS`). In the media pack.
- Captions over pictures: `captionStyle` on `SiteImage` (and on the new
  blocks) puts the caption `below` the picture as before, on a frosted
  `bar` over its bottom, or on a small `chip` in its corner.
- `ImageCarousel` takes `counter`, a small "1/4" on the picture.
- `safeImageSource`: a picture, only when its address is one a page may
  load, for a picture that isn't an `<img>`, such as a video's cover.
- Privacy and accessibility notes for each block: every `BLOCKS` entry has
  `privacy` (the other sites it can load, from `OUTSIDE_SERVICES`, the most
  cookies that may come with it, from `COOKIE_KINDS`, and a reason a visitor
  can read) and `accessibility` (keyboard use and what a screen reader
  hears), both listed on **Docs/Every block**. `pagePrivacy` adds up a
  page's services and cookie kinds for its cookie notice and privacy page.
- `consent` on every block that loads another site (`YouTubeVideo`,
  `SpotifyEmbed`, `TikTokVideo`, `InstagramPost`, `LinkEmbed`, `MapCard`,
  `BookingEmbed`, `LiveStatus`, `AudioPlayer`, `PodcastEpisodes`): with
  `false` the block says what loading will share and loads only after a
  Load press (YouTube's own picture waits too), then moves focus into what
  loaded. Words in `consentLabels` (`CONSENT_LABELS`); `ConsentCover` for a
  block of your own. Storybook: `Blocks/Privacy`.
- Music players for SoundCloud, Apple Music and Deezer, beside Spotify:
  `SoundCloudEmbed` (a track or playlist, compact or with big artwork, in
  the page's button colour), `AppleMusicEmbed` (a song, album or playlist)
  and `DeezerEmbed` (a track, album or playlist), all in the media pack.
  Like `SpotifyEmbed`, each loads the other site only when play is pressed
  and shows the link as a plain tile when it can't play it. `LinkEmbed`
  plays Apple Music and Deezer links too (`applemusic` and `deezer` in
  `EMBED_SERVICES`), and its SoundCloud player is a little taller, so it
  isn't cut off, and takes the page's colour. New: `appleMusicEmbed`,
  `deezerEmbed`, `tintedSrc`, `colorHex`, the `track` player shape and
  `PlayFrame`'s `tint`.
- `SocialCard`: one social profile with the platform's mark, the picture,
  name, handle and verified tick, the follower count written short by
  locale (`shortCount`: 1.1K, 860K) and a button in the platform's own word
  (Follow, Subscribe, Connect, Join server...), which the creator can
  change. Tinted in the brand's colour or the theme's; 1x1, 2x1 and 2x2
  tiles, where 2x2 shows the latest posts with their views, passed in as
  `LiveProps`. 16 platforms in `SOCIAL_PLATFORMS`; the profile link is made
  from the handle where it can be (`socialProfileHref`). Free, in the
  profile group; presses are tracked as `social_follow` and `social_post`.
- Each block describes its settings, so the page editor can build its panel:
  every `BLOCKS` entry has `settings` (field name, label, help, type,
  default, required, `slow` for fields that load over the network, `main`
  for the link a paste goes to, `forApp` for what the app reads, an icon
  hint) and `appOnly` (props the app fills in). `LOOK_SETTINGS` describes
  the shared look once. New: `SettingField` and its types, `SETTING_TYPES`,
  `SETTING_ICONS`, `settingsPanel`, `mainLinkSetting`, `settingIcon`,
  `fitsSetting`, `settingDefaults`, and `PACK_CHECKOUT_LABELS` and
  `LEAD_MAGNET_LABELS` (the defaults those blocks already used). The type
  check fails when a block's settings and props disagree. Storybook:
  `Editor/Settings panel`.
- Block backgrounds: every block takes `background`, a gradient through two
  or three theme colours, a faint pattern (lines, rings, dots, grid, waves)
  or a picture under a dim layer of the block's own colour. Colours are
  theme names, never typed CSS; picture addresses are checked
  (`cssImageUrl`); a moving gradient stands still for visitors who ask for
  less motion. `backgroundIssues` and `fixBackground` check and fix the
  words' contrast on a background, as `contrastIssues` does for a theme.
- The `inset` tone: a block pressed into the page.
- `MessageCard`: a card that opens a chat on WhatsApp, Telegram, a text,
  email or Messenger with a message ready to send, shown in a chat bubble.
  The visitor can change the message first (`editable`), the number or
  address stays out of the page's HTML, and a press is tracked as
  `contact`. Links come from `messageHref`, which checks numbers, usernames
  and addresses strictly and encodes the message. Free, in the forms group.
- Tracking: a link marked `data-href-private` is reported without its query,
  so a message a visitor wrote isn't tracked.
- `Field` takes `value` and `onChange`; `ChatIcon` and `SendIcon`.
- Ready-made looks (`SITE_LOOKS`: clean, soft, bold, night, paper and
  terminal), each a whole `SiteTheme` that passes the contrast checks, and
  `siteLook` to lay a creator's own changes over one. Storybook's toolbar has
  a Look menu to see any story in each.
- Storybook docs: **Docs/Getting started** (install, tokens, theme, layout)
  and **Docs/Every block**, a list of every block with what it's for, its grid
  kind and whether it's free, read from the registry.
- README and stories: tracking clicks and sign-ups, and sending forms, with
  BuildBase.

### Changed

- `PlayFrame` (and every player and map built on it) moves focus into the
  player once a visitor presses play, so keyboard users land in what loaded.
- New options on blocks already in use, each off until set, so pages look
  as before: `CreatorHeader` `initialsFont="display"` sets the initials in
  the theme's display font (and `Avatar` `initialsFont`); `MapCard`
  `mapStyle` (`light`, `dark`, `satellite`) and `mapCaption`, a line over
  the map's corner (`mapFrameUrl`; the satellite map loads from Google Maps,
  `googlemaps` in `OUTSIDE_SERVICES`, and `mapService` names the site for
  each style); `NewsletterBand` `display="tile"`, a
  small tile whose one button opens the form in a pop-up (`tileLabels`,
  `NEWSLETTER_TILE_LABELS`, and `DialogButton` for any such button);
  `BookingEmbed` `duration` and `nextFree` (with `timeZone`, `locale` and
  `formatNextFree`) on the card before it's opened; `FeaturedPack` `href`, a
  checkout on another site for a product not sold through BuildBase, and
  `duration` on `FeaturedPack` and `PackRow` for a service.

### An app must change

Nothing.

## 0.2.0 (2026-11-25)

### Added

- 56 blocks across profile, links, selling, offers, media, trust, forms,
  feeds, developer and page groups, built on one shared look system (`Block`,
  `withBlockLook`) in atoms, molecules and organisms.
- Look props on every block: tone, size, corners, alignment, shadow, motion,
  its own colours and font, and hiding on a screen.
- Grid pages (`SiteGrid`) with a layout per screen, and the layout helpers a
  page editor needs.
- Size presets (`min-h-control`, `max-w-site`, `max-w-site-wide`) and
  `SitePage`, the page column.
- The block registry (`BLOCKS`), with each block's grid kind, group and free
  or paid pack.
- Selling through BuildBase, and a `data-action` name on every button and
  link, for click tracking.
- Real, scannable QR codes.
- Storybook at storybook.levuche.com, with a story test and accessibility
  check for every block on phone, tablet and desktop.
- A licence: free to use, with no reselling.

### Fixed

- 11 bugs in the blocks, and the minimatch security alert.

### An app must change

- Imports from `@levuche/ui` are unchanged. Imports of files inside `src/`
  need their new paths, as the files moved into `atoms/`, `molecules/`,
  `organisms/`, `templates/` and `system/`.

## 0.1.1 and 0.1.0 (2026-11-25)

The first blocks: theme, buttons, links, profile, selling, media,
newsletter and footer. Both tags are the same commit.
