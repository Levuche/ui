# Changelog

What changed in each release of `@levuche/ui`, newest first. Each release
pull request into `dev` adds its section here, with anything an app must
change when it moves to that version.

## Unreleased

### Added

- `BentoGallery`: pictures and uploaded videos in square cells, each tile
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
