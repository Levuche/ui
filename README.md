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

### One block's own look

Every block also takes the same look props, on top of the page theme, so a
creator can change one block without touching the others:

| Prop     | Values                                                              |
| -------- | ------------------------------------------------------------------- |
| `tone`   | `surface`, `muted`, `accent`, `band`, `notice`, `outline`, `plain`  |
| `size`   | `sm`, `md`, `lg`: padding, gaps and type together                   |
| `radius` | `theme` (the page's corners), `none`, `sm`, `md`, `lg`, `full`      |
| `align`  | `start`, `center`, `end`                                            |
| `shadow` | `none`, `sm`, `md`, `lg`                                            |
| `motion` | `none`, `fade`, `rise`, `scale` (off for visitors who ask for less) |
| `colors` | this block's own colours, the same keys as the theme                |
| `font`   | this block's own font                                               |
| `hideOn` | screens to hide it on: `phone`, `tablet`, `desktop`                 |

A tone swaps the colours inside the block, so text, links and buttons stay
readable: in an `accent` block, solid buttons turn inside out. Text boxes keep
the page's colours in any tone. Blocks also take an `id`, `className`,
`style`, `ref` and `data-*` attributes.

Behaviour is set the same way. Links take `newTab` (`auto` opens other
sites in a new tab), `sponsored` and `nofollow`, and an unsafe address
(`javascript:` and the like) shows its words without a link. Words a block
shows take a `labels` prop, so a page can be in any language. Forms take
`status` (`idle`, `sending`, `sent`, `error`) from the app: the button spins
while sending and the result is read out to screen readers.

### How the blocks are built

The package follows atomic design, and each level uses only the levels
below it (a lint rule checks this):

| Level            | What's in it                                                                          |
| ---------------- | ------------------------------------------------------------------------------------- |
| `src/system/`    | Plain data and functions: theme, look, safe links, state, tracking, grid, registry    |
| `src/atoms/`     | One element: `Block`, `SiteButton`, `SiteLink`, `SiteInput`, `Thumb`, `Avatar`, icons |
| `src/molecules/` | A few atoms together: `LinkTile`, `EmailForm`, `Price`, `Rating`, `PlayFrame`         |
| `src/organisms/` | The blocks a creator adds to a page: `BookingCard`, `TipJar`, `LinkList`              |
| `src/templates/` | Page layouts: `SitePage`, `SiteGrid`                                                  |

The React ideas it uses, and why:

- **A prop getter, `lookProps()`**, turns a block's look props into the
  classes, style and `data-*` attributes for its outermost element. Every
  block spreads it, which is why one setting restyles any block the same way.
- **CSS variables, not React context**, carry the theme and the look down to
  everything inside a block. Context only works in client components; CSS
  variables work in React Server Components too, so blocks render on the
  server in Next.js and only blocks with state (`TipJar`, `Countdown`,
  `CopyButton`, `PlayFrame`) are `'use client'`.
- **A primitive, `<Block>`**, is the box every block is built on. An app's own
  blocks can use it too, or wrap an existing component with the
  **higher-order component `withBlockLook()`**.
- **Controlled or uncontrolled state**: `useControllableState` lets the app
  own a value (`value` and `onChange`) or leave it to the block
  (`defaultValue`).
- **Event delegation for tracking**: blocks mark presses with `data-action`
  and their element with `data-block`. `useBlockActions(onAction)` on the
  page reports every link, button and form as `{ action, block, label }`,
  with no tracking prop on each block.
- **A registry**: `BLOCKS` lists every block once, with its `data-block` id,
  its grid kind and its group, for the editor and for analytics. A test
  checks each id is used only once.

### Data from other services

Blocks that show another service's data (GitHub, npm, a channel's latest
videos, reviews) never fetch it. The app's server fetches it, caches it and
passes it in, so keys stay on the server, visitors don't each call the
service, and rate limits last. Each such block exports the type of its data
and takes `LiveProps`:

| Prop      | What the block shows                                                      |
| --------- | ------------------------------------------------------------------------- |
| `data`    | The data, typed by the block (`GitHubProfileData`, `RepoData`, …)         |
| `loading` | A skeleton while there's no data yet; screen readers hear "Loading"       |
| `error`   | With data: the data and a quiet "couldn't refresh" note. Without: nothing |

```tsx
// app/page.tsx, a server component: fetch and cache on the server.
const res = await fetch(`https://api.github.com/users/${login}`, {
  headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
  next: { revalidate: 3600 },
});
const user = res.ok ? await res.json() : null;

<GitHubProfile
  data={
    user && {
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      followers: user.followers,
      publicRepos: user.public_repos,
      url: user.html_url,
    }
  }
  error={!res.ok}
/>;
```

`LiveData` does the same for a block of your own: give it the props and a
function that draws the data. Stories use fixed sample data, so tests never
reach a service.

## Size presets

Blocks use named sizes, never fixed pixels, so one change in `tokens.css`
resizes every block and the pages stay compact on a phone, tablet or desktop.

| Preset                      | Size                                  | Used for                      |
| --------------------------- | ------------------------------------- | ----------------------------- |
| `min-h-control`             | 40 px with a mouse, 44 px on touch    | small buttons, inputs         |
| `min-h-control-md`          | 44 px, 48 px on touch                 | the default button            |
| `min-h-control-lg`          | 48 px, 52 px on touch                 | the buy button                |
| `max-w-site`                | 420 px, 576 px from a tablet up       | a creator page's column       |
| `max-w-site-wide`           | 640 px, 768 px from a tablet up       | a wider column, for grids     |
| `text-xs` to `text-2xl`     | Tailwind's type scale (12–24 px)      | all text; body is `text-base` |
| `p-3`, `gap-2`, `size-13` … | Tailwind's spacing scale (4 px steps) | padding, gaps, thumbnails     |

The control presets work like any spacing value (`h-control`,
`size-control-md`), and they grow on touch screens by themselves, so a block
never needs `pointer-coarse:` for its height. Wrap a page in `SitePage` (or
give its column `max-w-site`) so blocks never stretch across a big screen.
Inputs keep 16 px text on touch screens so phones don't zoom in.

### Phone, tablet and desktop

A page fills a phone, then from a tablet up (768 px and wider) its column grows
to 576 px and stays there, centred, however wide the screen gets. In Storybook,
**Pages/Creator page** has a story for each screen (phone, tablet, tablet
turned sideways, desktop), and the screen menu in the toolbar shows any story
at those sizes. Each screen story checks that the page never scrolls sideways
and that no block spills out of its column. The end-to-end tests run on a
desktop, a tablet and a phone.

An app that imports `@levuche/ui/tokens.css` gets the same presets, so its
own buttons and fields can use `min-h-control` too, without defining it
again. The widths are named `site` so an app's own `max-w-page` stays its
own.

## Grid pages

`SiteGrid` lays a page out on a grid of 10 columns, with a separate
arrangement for a phone, a tablet and a desktop, so each block can sit in a
different place, at a different size, on each screen. It's what a
drag-and-drop page editor saves and shows.

```tsx
import { SiteGrid, type PageLayouts } from '@levuche/ui';

<SiteGrid
  as="main"
  blocks={[
    {
      id: 'profile',
      kind: 'profile',
      sticky: true,
      children: <CreatorHeader name="Desi Origins" />,
    },
    {
      id: 'shop',
      kind: 'link',
      children: (
        <SiteLinkButton href="/shop" fullWidth>
          Shop
        </SiteLinkButton>
      ),
    },
    {
      id: 'video',
      kind: 'media',
      children: <YouTubeVideo video="…" title="…" />,
    },
  ]}
  layouts={savedLayouts /* PageLayouts, or leave it out */}
/>;
```

- **Layouts:** one list per screen of `{ i, x, y, w, h }`: the block's id, its
  first column (0 to 9) and row, and how many columns and rows it spans. It's
  the shape drag-and-drop grid editors read and write, so an editor's output
  can be saved as it is.
- **Rows:** as many as the page needs. A row is at least 3rem (48 px) tall
  and grows to fit what's in it, so nothing is ever cut off.
- **Screens:** a tablet from 42rem (672 px) wide and a desktop from 56rem
  (896 px), measured on the page itself rather than the window, so a page in
  an editor's preview pane switches at the same sizes.
- **Starting arrangement:** a screen with nothing saved gets
  `defaultLayout`. A phone has everything one under the other. A tablet has
  the profile on the left and the rest on the right. A desktop has the rest
  in a grid on the left, two links or cards to a row where they fit, and the
  profile on the right. Set `side: true` on any block to put it in the
  profile's column too.
- **Size limits:** each block has a `kind` (profile, link, links, card,
  media, gallery, text or band), and `BLOCK_SIZES` gives each kind's smallest
  and largest width and height in rem. `limitsFor(kind, screen)` turns those
  into the `minW`, `maxW`, `minH` and `maxH` an editor takes, in columns and
  rows for that screen.
- **Saved layouts are checked:** `fitLayout` drops blocks that are gone, keeps
  each one inside the 10 columns and its size limits, moves a block down if it
  would cover another, and adds new blocks at the bottom. `SiteGrid` runs it
  on every layout it's given.
- **Reading order:** screen readers and the Tab key follow the order of
  `blocks`, whatever the arrangement, so put the profile first.

In Storybook, **Pages/Grid page** shows the sample page on each screen, and a
creator's own desktop arrangement. Each story checks where the blocks landed,
that no block covers another and that the page never scrolls sideways.

## What's in it

| Group       | Blocks                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme, look | `CreatorTheme`, `siteThemeStyle`, `isSafeColor`, `isSafeFont`, `Block`, `withBlockLook`, `BlockLook`                                                                                              |
| Atoms       | `SiteButton`, `SiteLinkButton`, `SiteLink`, `SiteHeading`, `SiteText`, `Badge`, `Thumb`, `Avatar`, `SiteInput`, `Skeleton`, icons                                                                 |
| Molecules   | `SiteSection`, `ItemHead`, `LinkTile`, `Price`, `Rating`, `CheckList`, `Field`, `EmailForm`, `CopyButton`, `PlayFrame`, `SiteDialog`, `Segmented`, `CountUp`, `StatList`, `Sparkline`, `LiveData` |
| Page        | `SitePage`, `SiteGrid`, `CreatorFooter`, `MapCard`, `QrCode`                                                                                                                                      |
| Profile     | `CreatorHeader`, `SocialIcons`, `SaveContact`                                                                                                                                                     |
| Links       | `LinkList`, `FeaturedLink`, `LockedLink`                                                                                                                                                          |
| Selling     | `FeaturedPack`, `PackRow`, `PackGrid`, `BuyButton`, `PackCheckout`, `CourseCard`, `PricingTable`, `TopPicks`                                                                                      |
| Offers      | `BookingCard`, `BookingEmbed`, `MembershipCard`, `LeadMagnet`, `TipJar`, `DiscountCode`, `Countdown`                                                                                              |
| Trust       | `Testimonials`, `FaqList`, `LogoStrip`, `StatsRow`, `Timeline`                                                                                                                                    |
| Media       | `YouTubeVideo`, `ReelGrid`, `ImageGrid`, `SiteImage`, `ImageCarousel`, `BeforeAfter`                                                                                                              |
| Forms       | `NewsletterBand`, `ContactForm`                                                                                                                                                                   |
| Developer   | `GitHubProfile`, `ContributionGraph`, `RepoCard`, `RepoList`, `PackageStats`, `TechStack`                                                                                                         |

`BLOCKS` in the registry lists every block with its group, so this table
is a summary; the registry is the full list.

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

1. Build it in `src/organisms/` on `<Block name="your-block">`, taking
   `BlockRootProps` so it gets every look prop. Use atoms and molecules
   before writing new markup, `--site-*` tokens only (no raw colours),
   `rounded-block` or `rounded-block-inner` for corners, `p-block` and
   `gap-block-gap` for spacing, and the size presets above (`min-h-control`
   or more for anything tapped). Put words in a `labels` prop, links through
   `SiteLink`, and add `'use client'` only if it has state.
2. Add it to `BLOCKS` in `src/system/registry.ts` and export it from
   `src/index.ts`.
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
