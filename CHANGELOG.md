# Changelog

What changed in each release of `@levuche/ui`, newest first. Each release
pull request into `dev` adds its section here, with anything an app must
change when it moves to that version.

## Unreleased

### Added

- `EditMode`, for editing blocks on the page in the page editor: a click on
  a block's words opens a text box in their place, and a click on a link,
  picture or other setting tells the editor which one, so it can open what
  sets it beside the block. Every block marks the parts a creator sets
  with `editable(path, kind)` (`data-edit` and `data-edit-kind`), and
  `ItemHead`, `Price`, `LinkTile`, `Thumb` and `Avatar` take the paths of
  their parts. `e2e/edit.spec.ts` checks every block. Some blocks wrap a
  setting's words in one more `span` than before; nothing else changes on
  a live page. Words drawn in a picture (the profile's turning words) are
  picked, not typed on, so an `EditPick`'s `element` can be an SVG element.

## 0.5.0 (2026-11-27)

Every open item from the block review, and four blocks that had the same
problem, so each rule now holds in every block, with tests that every
block works with every setting and state.

### Changed

- `LogoMarquee` takes `logos` and `copies` (arrays of list items) in place
  of `children`. Like `TextStrip`, it repeats the logos until each half of
  the row is as wide as the strip, so a few small logos leave no gap, and
  it also holds still while a logo has keyboard focus. Apps that render
  `LogoMarquee` themselves must pass the two arrays; `LogoStrip` is
  unchanged.
- Titles are headings everywhere. `LogoStrip`, `ImageCarousel`,
  `TileGallery`, `Countdown` and `NewsletterBand` draw their title as an
  `h3` (set with `headingAs`) where some used a `p` or `strong`. Titles
  inside a block (`Timeline`, `RepoList`, the plan names in
  `PricingTable`, the feeds) use `subHeading`: one level under the block's
  heading, and a `p` below `h5`.
- Nothing loops forever without a pause button (WCAG 2.2.2). The gradient
  background drifts across once, over 4.8 seconds. The live dot pulses
  twice and `ActionCard`'s ping runs four times. `TextStrip` holds still
  while a phrase has keyboard focus, as `LogoStrip` does.
- Status lines are in the page from the start, so screen readers announce
  them: `Countdown`'s "done" line and `LockedLink`'s age answer.
- Privacy notes say what each block loads. `NowPlaying` loads nothing.
  `FeaturedLink`, `LogoTile` and `LinkChip` show a preview the app fetched,
  as `LinkCard` does. `VideoTile` and `TileGallery` list `video-host`.
- `PricingTable` works out the yearly note from the prices (the least
  saving across plans, as "Save 16%"), unless `yearlyNote` is set.
- Accessibility notes in the registry match what each block does
  (`CreatorHeader`, `TextStrip`, `ImageGrid`, `ContactForm`, `MessageCard`,
  `FeaturedPack`, `PackCheckout`, `CreditPack`, `EventList`).

### Added

- `VideoTile` and `TileGallery` take `consent` and `consentLabels`. With
  `consent={false}`, a video on another site downloads nothing until play
  and shows the same notice as the audio blocks (`MediaNotice`).
  `video-host` is a new `OUTSIDE_SERVICES` entry.
- Words in all six languages: `localTimeCities` (LocalTime's city names),
  `props.reel` (a `ReelGrid` reel with no label) and
  `pricingTable.yearlySave`. Apps with their own word lists add these keys.
- `subHeading`, `yearlySaving`, `starFills` and `contributionCells` are
  exported. `Rating` fills part of a star for a part score.
- `AudioBar` takes `href`, so `PodcastEpisodes` links each episode's title.
  `MapCard` shows its picture when there's no map. `QrCode` and `EmbedBody`
  show their detail line when there's no title.
- A `CreatorFooter` story with checks.
- Tests that every block works with every setting, each way. On the server
  (`e2e/every-setting.spec.ts`), each block renders with only what's
  required, with everything set, and with each choice, toggle, number,
  empty list and long line, with no React warnings; every setting and look
  setting has to change the page; and each loading, failed, sending, sent,
  sold-out and unavailable state has to show. In the browser
  (`stories/EverySetting.stories.tsx`), each group of blocks is checked for
  accessibility with everything set and mounted each of those ways with its
  effects running, and the two settings that only act in a browser,
  `YouTubeVideo`'s `start` and `StatsRow`'s `animate`, are checked there.

### Fixed

- `TextStrip` draws its separator at full strength. At 70% it failed AA
  contrast on the band colour when the separator was a word.
- `ContributionGraph` pads a short first week at the start and a short last
  week at the end, so days line up under their weekday.
- `TechStack` logos load at their drawn size.

### An app must change

- An app that renders `LogoMarquee` itself passes `logos` and `copies`
  (arrays of list items) in place of `children`. `LogoStrip` is unchanged.
- An app with its own word lists adds the new keys: `localTimeCities`,
  `props.reel` and `pricingTable.yearlySave`.

## 0.4.0 (2026-11-26)

New calendar and ticket blocks, the creator's name in its own style, a pause
button on the scrolling logo strip, and every block behaving the same way.

### Changed

- `LogoStrip` with `mode="scroll"` has a pause button, as `TextStrip` does
  (WCAG 2.2.2 asks for one on anything that moves for more than five
  seconds), and holds still while it's off screen. Its words are in the
  page's language, or set with `labels` (`LOGO_STRIP_LABELS`). A still row
  is unchanged.

### Added

- `CalendarEmbed`: a creator's public calendar from the link Google
  Calendar or Outlook gives. Google's shows as a list, a month or a week,
  in the page's language and time zone, on the block's background where
  Google's dark text stays readable. `TicketEmbed`: an event's tickets, in
  the page or a pop-up, from Luma's checkout; an Eventbrite event's button
  opens its page on Eventbrite. Both load lazily in a sandbox with a plain
  link under them, wait for consent with `consent={false}`, and show a still
  placeholder in preview mode. The parsers (`calendarEmbed`,
  `googleCalendarEmbed`, `outlookCalendarEmbed`, `ticketsFor`,
  `lumaTickets`, `eventbriteTickets`) check the host exactly and keep only
  the ids. Google Calendar, Outlook and Luma are new `OUTSIDE_SERVICES`.
- The creator's name in its own style: `CreatorHeader` `nameColor` (`text`,
  `accent` or `link`), `nameTint` (a colour of the creator's own, checked
  with `isSafeColor`), `nameCase` (`upper` for capitals) and `nameWeight`
  (`medium`, `semibold`, `bold` or `black`). `SectionHeading` takes the same
  as `titleColor`, `titleTint`, `titleCase` and `titleWeight`. Each is off
  until set, so pages look as before. `nameColorIssue` warns when the colour
  is too faint on its block; `nameLook` gives the classes and style for any
  other heading.
- Words for every line a visitor reads, in all six languages: `consent`
  (the notice and the Load button before a site loads), `rating` (as
  "4.8 out of 5 stars"), `courseCard.oneLesson`, `props.highlights`,
  `props.qrFor` and `packCheckout.sent`. `DISCOUNT_CODE_LABELS` is exported.
  `PlayFrame` takes `site`, the site's name, and words the notice itself.

### Fixed

- Bad settings no longer break a block: a `QrCode` with an unsafe picture,
  an `Avatar` without a name, an `ActionCard` with no covers, a
  `SlotPicker` with an unknown time zone, a `Countdown` to a date that
  isn't one, `SaveContact` with an empty or odd name, and a `TipJar`
  default amount that isn't one of its chips.
- The `Carousel` turns at most every 2 seconds, stops for visitors who ask
  for less motion, and is read out by screen readers only while it's still.
  `LogoStrip` speed has the same floor as other moving blocks.
- `updatedAt` reaches the live-data line on every feed and developer block.
- A sold-out `EventCard` that sells through BuildBase shows the button's own
  sold-out state; packs and cards decide on the same usable `sell`.
- Focus moves to the frame after Load in `CalendarEmbed`, and to the link
  after a `LockedLink` opens. A `FormNotice` stays in the page for screen
  readers while it's empty.
- `MapCard` directions need real coordinates; an empty link falls back.
  `SocialCard` counts and post views use the page's language.
- Every visitor-facing word, such as "Play video", "Highlights", the QR
  name and star ratings, is in the page's language.
- Tracking: `ContactForm` and `LockedLink` sends report as `contact` and
  `lock_unlock`, and a block drawn inside another (a pricing table's plans)
  reports as the outer block.
- Registry: `BookingEmbed` height starts at 24 rem as the block does, a
  `GoalTracker` target and a progress item's full mark start at 1, and a
  `TipJar` amount at 1.

### An app must change

- A `renderBuy` function for `SellButton` gets `disabled` and should pass
  it to its button.
- `LinkEmbed` with an empty `services` list now allows every service, as
  leaving it out does. Pass the services you want to allow.

## 0.3.0 (2026-11-26)

Everything the page editor in the app needs: each block describes its
settings, ready-made looks, block backgrounds, preview mode, privacy and
accessibility notes, and one page language, with 21 new blocks.

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
- `LocalTime`: the creator's local time, so visitors in other countries know
  whether it's a good moment to message or book. A title, the time large and
  the date and city small under it, from a list of cities mapped to time
  zones (`LOCAL_TIME_CITY_IDS`), or the creator's own IANA `timeZone` (one
  Intl doesn't know falls back to the city's). 12-hour, 24-hour or the
  visitor's own way, in the visitor's language once the page runs. Optional
  "4 h 30 min ahead of you", worked out in the visitor's browser, and an
  "Open now" or "Away" chip from the creator's working hours (past midnight
  too). The server writes the time from `now`, or a placeholder without it;
  the browser moves it on once a minute, only while it's on screen and the
  tab is showing, with nothing read out on each change. Sizes 2x1 and 2x2,
  free in `core`. The time-zone maths is exported on its own (`zoneOffset`,
  `offsetFromVisitor`, `describeOffset`, `isOpenAt`, `localTimeZone`...).
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
- `EventCard`: one event with a date badge (MAR 15), a chip saying how far
  away it is in the visitor's language ("In 4 months", "Tomorrow",
  "Happening now"), the date and time with the event's time zone, the place,
  tickets through a link or `sell`, and "Add to calendar". `2x1` and `2x2`
  tiles; a soft accent wash when there's no picture; an "Ended" state once
  it's over. The app can pass what it read from the event's page in
  `details` (with a loading skeleton) to fill the fields left empty. Free,
  in the offers group; presses are tracked as `event_tickets`,
  `calendar_open`, `calendar_google` and `calendar_ics`.
- `AddToCalendar`: a Google Calendar link and an .ics download, made from
  the event's fields with no new dependency and no JavaScript, so it is
  hydration-safe. The time helpers are exported from `calendar.ts`
  (`eventSpan`, `googleCalendarHref`, `icsText`, `icsHref`, `howFar`,
  `eventWhen`, `zonedToUtc` and more): time zones, all-day and floating
  times, ICS escaping and line folding.
- `EventList` rows with a `dateTime` get "Add to calendar" too (`calendar`
  turns it off); rows take an `end` and a `timeZone`, and
  `EVENT_LIST_LABELS` has the calendar words.
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
- `ActionCard`: a bold card in the accent colour, or any tone, with a
  title, a line of detail and a bar across the bottom that says what happens
  next. Beside the title it shows a picture, up to three covers fanned out
  for a bundle, or the creator's photo with a dot while they're live. The
  whole card is one press, a link or, with `sell`, a checkout through
  BuildBase. `ribbon` puts a small tilted label ("Most popular") over the
  corner of `ActionCard`, `FeaturedPack`, `MembershipCard` and a
  `PricingTable` plan (`Ribbon` atom).
- Card styles for the whole page: `SiteTheme.cards` is `flat` (as before),
  `outlined`, `raised` (a soft shadow tinted by the accent) or `glass`, and
  `SiteTheme.hover` lifts links and linked pictures a little under the
  pointer. Both stay still for visitors who ask for less motion. Storybook's
  toolbar has a Cards menu.
- Colour checks for a creator's theme: `contrastIssues(theme)` lists each
  pair the blocks draw that fails WCAG 2.2 AA, with the ratio, the colour to
  change and a nearby colour that passes; `fixContrast(theme)` applies every
  suggestion; `contrastRatio(a, b)` measures any two colours.
- Pictures in the right size: every picture block takes a plain address or
  an `ImageSource` with `srcSet`, `width`, `height` and `priority`, tells
  the browser how wide it shows so a phone gets a small copy, and keeps its
  space while it loads (`toImageSource`, `columnSizes`, `imageAttrs`).
- Right-to-left scripts: `dir="rtl"` on the page or around the blocks
  mirrors every block and grid page, and long words wrap inside their block.
  Storybook's toolbar has a Direction menu.
- `fitHeights(layout, measured, blocks)`: gives each block in a page
  editor's grid the rows its measured height needs, so the editor matches
  the live page.
- `CreatorHeader` `verified` (a tick, with `verifiedLabel`), `nameSize`
  (`lg` or `xl`) and `highlight` (some words of the tagline in italics and
  the theme's new `displayFont`); `LinkTile` `image` and `trailing="arrow"`;
  `SocialIcons` `iconStyle="chip"`; and with `was`, a price says what the
  visitor saves ("Save $8"), changed with `saveLabel` (`priceSaving`).

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
- Tracking reports a link to a file the page made itself (a `data:` or
  `blob:` address) by its kind only, as `data:text/calendar`, not the whole
  file.

### Fixed

- `CreatorHeader` centres its picture, name and tagline, as it was meant
  to; `align="start"` and `"end"` still line them up on that side.
- In right-to-left scripts, the carousel's arrows, arrow keys and swipes go
  the right way, the before-and-after picture starts on the right side,
  scrolling logos leave no gap, and the contact form's hidden field no
  longer widens the page.
- The photo ring in `CreatorHeader` leaves a see-through gap on any
  background, not one filled with the card colour.

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
