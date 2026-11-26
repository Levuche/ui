# Changelog

What changed in each release of `@levuche/ui`, newest first. Each release
pull request into `dev` adds its section here, with anything an app must
change when it moves to that version.

## Unreleased

### Added

- Text blocks in a new `text` group, free in `core`: `SectionHeading` (a
  heading a link can jump to, with a line of detail), `TextBlock` (bold,
  italic, links, lists and emoji), `QuoteBlock` (a quote with who said it
  and a small picture) and `Spacer` (a gap of whole grid rows, or a thin
  line). What a creator types is never read as HTML (`parseRichText`,
  `RichText`).
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
