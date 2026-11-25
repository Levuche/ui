# Levuche UI

The blocks a creator's [levuche.page](https://levuche.page) site is built
from: profile, links and buttons, packs and checkout, video, reels,
newsletter and footer. Every block follows the creator's theme, so each page
can have its own colours, corners, button shape and font.

The creator site app renders pages with these blocks, and the page editor in
the Levuche dashboard uses the same blocks to show creators their page as
they design it. Levuche's own website and app UI (sign-up, dashboard,
settings, marketing pages) is not here; it lives in each app's own code.

Built from the boards in [Levuche/design](https://github.com/Levuche/design)
(`canvas/Organisms` "Creator kit" and the creator-site screens) and the
`--site-*` tokens in `tokens/levuche-tokens.css` (v1.1).

Levuche is a product managed by Jagodana LLC. See [LICENSE](LICENSE): the
code is public to read, not to reuse.

## Use it in a Levuche app

Install a released version straight from GitHub (no npm account or token
needed):

```bash
npm install github:Levuche/ui#v0.1.0
```

The package ships TypeScript source. In a Next.js app:

```ts
// next.config.ts
const nextConfig = { transpilePackages: ['@levuche/ui'] };
```

```css
/* the app's global CSS */
@import 'tailwindcss';
@import '@levuche/ui/tokens.css';
/* Let Tailwind see the classes the blocks use. */
@source '../../node_modules/@levuche/ui/src';
```

```tsx
import {
  CreatorTheme,
  CreatorHeader,
  LinkList,
  SiteLinkButton,
  YouTubeVideo,
  type SiteTheme,
} from '@levuche/ui';

// Saved with the creator's page; every field is optional.
const theme: SiteTheme = {
  scheme: 'dark',
  colors: { accent: '#0f766e', onAccent: '#ffffff' },
  corners: 'square', // square, soft or round
  buttonShape: 'rounded', // square, rounded or pill
  font: "'Sora', sans-serif",
};

<CreatorTheme theme={theme}>
  <CreatorHeader name="Desi Origins" tagline="How everyday things began" />
  <SiteLinkButton href="https://example.com/presets" fullWidth>
    Shop my presets
  </SiteLinkButton>
  <LinkList links={[{ label: 'YouTube', href: 'https://youtube.com/@x' }]} />
  <YouTubeVideo
    video="https://youtu.be/M7lc1UVf-VE"
    title="How tea came to India"
  />
</CreatorTheme>;
```

The app provides `react`, `clsx`, `tailwind-merge` and Tailwind CSS v4
(peer dependencies).

## Theming

Every block reads only `--site-*` CSS variables. `<CreatorTheme>` sets them:

- `scheme`: `light` or `dark`, the sample creator's base colours.
- `colors`: any of `bg`, `surface`, `surface2`, `border`, `text`, `text2`,
  `link`, `accent`, `onAccent`, `band`, `onBand`. Only plain colour values
  (hex, `rgb()`, `hsl()`, `oklch()`) are used; anything else is dropped, since
  creators type these in.
- `corners`: `square`, `soft` or `round` for cards and tiles.
- `buttonShape`: `square`, `rounded` or `pill`.
- `font`: a CSS font-family list (the app loads the font).

Buttons also take `variant` (`solid`, `outline`, `soft`, `text`) and `size`
(`sm`, `md`, `lg`), so creators can pick them per block.

## Size presets

Blocks use named sizes, never fixed pixels, so one change in `tokens.css`
resizes every block and the pages stay compact on a phone, tablet or desktop.

| Preset          | Size                               | Used for              |
| --------------- | ---------------------------------- | --------------------- |
| <<<<<<< HEAD    |
| `min-h-control` | 40 px with a mouse, 44 px on touch | small buttons, inputs |
| =======         |
| `min-h-control` | 40 px with a mouse, 44 px on touch | small buttons, inputs |

> > > > > > > fix/preset-names
> > > > > > > | `min-h-control-md` | 44 px, 48 px on touch | the default button |
> > > > > > > | `min-h-control-lg` | 48 px, 52 px on touch | the buy button |
> > > > > > > | `max-w-site` | 420 px | a creator page's column |
> > > > > > > | `max-w-site-wide` | 640 px | a wider column, for grids |
> > > > > > > | `text-xs` to `text-2xl` | Tailwind's type scale (12–24 px) | all text; body is `text-base` |
> > > > > > > | `p-3`, `gap-2`, `size-13` … | Tailwind's spacing scale (4 px steps) | padding, gaps, thumbnails |

The control presets work like any spacing value (`h-control`,
`size-control-md`), and they grow on touch screens by themselves, so a block
never needs `pointer-coarse:` for its height. Wrap a page in `SitePage` (or
give its column `max-w-site`) so blocks never stretch across a big screen.
Inputs keep 16 px text on touch screens so phones don't zoom in.

An app that imports `@levuche/ui/tokens.css` gets the same presets, so its
<<<<<<< HEAD
own buttons and fields can use `min-h-control` too.
=======

own buttons and fields can use `min-h-control` too, without defining it
again. The widths are named `site` so an app's own `max-w-page` stays its
own.

> > > > > > > fix/preset-names

## What's in it

| Group           | Blocks                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Theme           | `CreatorTheme`, `siteThemeStyle`, `isSafeColor`, `isSafeFont`, `SiteTheme`                                    |
| Buttons, text   | `SiteButton`, `SiteLinkButton`, `siteButtonClasses`, `SiteHeading`, `SiteText`, `SiteSection`, `SiteDivider`  |
| Page            | `SitePage`                                                                                                    |
| Links           | `LinkTile`, `LinkList`, `FeaturedLink`, `SocialIcons`, `ImageGrid`                                            |
| Profile         | `CreatorHeader`, `Avatar`                                                                                     |
| Selling         | `FeaturedPack`, `PackRow`, `PackGrid`, `BuyButton`, `PackCheckout`                                            |
| Offers          | `BookingCard`, `MembershipCard`, `LeadMagnet`, `TipJar`, `DiscountCode`, `Countdown`, `timeLeft`              |
| Reviews, FAQ    | `Testimonials`, `FaqList`                                                                                     |
| Media           | `YouTubeVideo`, `youtubeId`, `ReelGrid`                                                                       |
| Sign-up, footer | `NewsletterBand`, `CreatorFooter`                                                                             |
| Icons           | link, video, camera, globe, app, email, share, QR code, calendar, clock, star, copy, download, heart and more |

`BookingCard` and `MembershipCard` link to the page that takes the booking
or the payment. `LeadMagnet`, `TipJar` and `NewsletterBand` are forms: give
them an `action` to post to, or an `onSubmit`. `TipJar` sends `amount`.
`Countdown` ticks in the visitor's browser (pass `now` to freeze it in a
preview). `DiscountCode` copies with the browser's clipboard and says so to
screen readers.

`YouTubeVideo` shows a play button first and loads YouTube (privacy-enhanced
mode) only when the visitor presses it. `youtubeId` reads the id from any
YouTube address a creator pastes, including Shorts.

## Work on it

```bash
npm ci
npm run dev          # the gallery at http://localhost:5173
npm run check        # ESLint, Prettier, TypeScript
npm run build        # builds the gallery
npx playwright install chromium
npm run test:e2e     # end-to-end tests against the built gallery
npm run storybook    # Storybook at http://localhost:6006
npm run test:stories # every story's interaction and accessibility test
```

The gallery (`gallery/`) shows every block in three themes: the sample
creator's light and dark, and a creator's own colours, corners, button shape
and font. The end-to-end tests (`e2e/`) open it in Chromium, at desktop and
phone sizes, and check that each theme reaches every block, tap targets
(40 px with a mouse, 44 px on touch), links to other sites opening in a new
tab, the video loading only on play, the checkout's consent box, newsletter validation, no sideways
scrolling, and accessibility with axe (WCAG 2.2 AA, no serious or critical
problems). `e2e/theme.spec.ts` checks the YouTube address reader and that a
theme only lets plain colours and fonts into CSS.

### Storybook

Storybook (`stories/`, set up in `.storybook/`) has a story for each block
and state, with its props as controls and docs built from them. The toolbar's
Theme menu shows any story in the sample creator's light or dark scheme or in
a creator's own theme, and `Pages/Creator page` shows a whole page in each.

Each story is also a test. `npm run test:stories` opens every story in
Chromium (Vitest with the Storybook plugin), runs its play function, which
clicks and types like a visitor (the checkout's consent box, the newsletter's
address check, the video loading only on play, new tabs for other sites,
tap targets), and fails on any axe problem (WCAG 2.2 AA). The
Accessibility tab shows the same checks while you work. CI runs them as
"Storybook tests" and builds Storybook.

It is published at https://storybook.levuche.com from the dev branch, and
every pull request into dev gets its own Storybook preview link, posted as a
comment (`.github/workflows/storybook.yml`, `wrangler.jsonc`). The workflow
needs the `CLOUDFLARE_API_TOKEN` secret and the `CLOUDFLARE_ACCOUNT_ID`
variable, the same pair the website uses.

### Adding a block

1. Build it from its design board with `--site-*` tokens only (no raw
   colours), `rounded-site` or `rounded-site-button` for corners, and the
   size presets above (no fixed pixel sizes; `min-h-control` or more for
   anything tapped).
2. Export it from `src/index.ts`.
3. Show it in `gallery/gallery.tsx`, inside a `Group`.
4. Add `stories/<Block>.stories.tsx`, with a play function that does what a
   visitor would, and add it to the sample page in `stories/sample-page.tsx`.
5. Test what it does in `e2e/blocks.spec.ts`.

## Branches and releases

The same flow as Levuche/website:

1. Branch from `dev` as `type/short-name` (`feature/`, `fix/`, `chore/`,
   `docs/`, `ci/`, `hotfix/`).
2. Open a pull request into `dev`. CI runs the checks and the end-to-end
   tests. Someone other than the author approves; squash and merge.
3. Release: bump `version` in `package.json` in a pull request into `dev`,
   then open a pull request from `dev` into `main` and merge it with a merge
   commit. Tag that commit on `main` (`git tag v0.2.0 && git push origin
v0.2.0`).
4. Each app moves to the new version in its own pull request
   (`npm install github:Levuche/ui#v0.2.0`), where its own tests run.

Tags are never moved or deleted once an app uses them.
