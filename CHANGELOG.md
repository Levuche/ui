# Changelog

What changed in each release of `@levuche/ui`, newest first. Each release
pull request into `dev` adds its section here, with anything an app must
change when it moves to that version.

## Unreleased

### Added

- `SocialCard`: one social profile with the platform's mark, the picture,
  name, handle and verified tick, the follower count written short by
  locale (`shortCount`: 1.1K, 860K) and a button in the platform's own word
  (Follow, Subscribe, Connect, Join server...), which the creator can
  change. Tinted in the brand's colour or the theme's; 1x1, 2x1 and 2x2
  tiles, where 2x2 shows the latest posts with their views, passed in as
  `LiveProps`. 16 platforms in `SOCIAL_PLATFORMS`; the profile link is made
  from the handle where it can be (`socialProfileHref`). Free, in the
  profile group; presses are tracked as `social_follow` and `social_post`.
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
