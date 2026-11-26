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
code is free to use, change and ship in your own sites and apps, including
commercial ones, but not to resell as a component library, kit or template,
or to use for training AI models.

## Use it in a Levuche app

Install a released version straight from GitHub (no npm account or token
needed):

```bash
npm install github:Levuche/ui#v0.2.0
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

### Colours a visitor can read

`isSafeColor` only checks that a colour is a plain value. In the theme editor,
`contrastIssues(theme)` says which of the creator's pairs are too faint to
read by WCAG 2.2 AA (4.5:1 for text, 3:1 for buttons against the page): text
and softer text on the page and on cards, links, button text on the accent,
text on the band, and buttons against the page. Each issue has a `label` to
show, its `ratio`, what it `needed`, the colour to `change` (the one the
creator picked) and a `suggestion`: the nearest colour, same hue, that
passes. `fixContrast(theme)` applies every suggestion, for a "Fix all"
button, and `contrastRatio(a, b)` measures any two colours.

```tsx
contrastIssues({ colors: { accent: '#fbbf24', onAccent: '#ffffff' } });
// [{ label: 'Button text on the accent colour', ratio: 1.66, needed: 4.5,
//    change: 'onAccent', suggestion: '#545454', ... }, ...]
```

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
- `displayFont`: a second font for a few words set apart, such as the
  header's `highlight`; it falls back to `font`.
- `cards`: `flat` (the default), `outline` (a thin line), `raised` (a soft
  shadow tinted with the accent) or `glass` (see-through and blurred over the
  page's background). It restyles every card on the page; a block that picks
  its own `shadow` keeps it. The page's background itself is set by the app.
- `hover`: `lift` (the default) raises links and linked cards a little under
  the pointer and presses them in on tap; `none` keeps them still. Neither
  moves for visitors who ask for less motion.

Buttons also take `variant` (`solid`, `outline`, `soft`, `text`) and `size`
(`sm`, `md`, `lg`), so creators can pick them per block.

### One block's own look

Every block also takes the same look props, on top of the page theme, so a
creator can change one block without touching the others:

| Prop         | Values                                                                      |
| ------------ | --------------------------------------------------------------------------- |
| `tone`       | `surface`, `muted`, `inset`, `accent`, `band`, `notice`, `outline`, `plain` |
| `size`       | `sm`, `md`, `lg`: padding, gaps and type together                           |
| `radius`     | `theme` (the page's corners), `none`, `sm`, `md`, `lg`, `full`              |
| `align`      | `start`, `center`, `end`                                                    |
| `shadow`     | `none`, `sm`, `md`, `lg`                                                    |
| `motion`     | `none`, `fade`, `rise`, `scale` (off for visitors who ask for less)         |
| `colors`     | this block's own colours, the same keys as the theme                        |
| `font`       | this block's own font                                                       |
| `background` | a gradient, a faint pattern or a picture behind the words (see below)       |
| `hideOn`     | screens to hide it on: `phone`, `tablet`, `desktop`                         |

A tone swaps the colours inside the block, so text, links and buttons stay
readable: in an `accent` block, solid buttons turn inside out. Text boxes keep
the page's colours in any tone. Blocks also take an `id`, `className`,
`style`, `ref` and `data-*` attributes.

`inset` presses the block into the page: a shade off the page's colour with a
soft shadow inside its top edge, beside cards that are raised.

#### A block's own background

`background` puts a gradient, a pattern or a picture behind a block's words,
over any tone, corners and card style, and inside `withBlockLook` and
`<Block>` too. Colours are the theme's, by name, so a background follows the
creator's theme and dark mode; a creator never types CSS.

```tsx
// Two or three theme colours, at any angle. `move` drifts it slowly.
<BookingCard background={{ type: 'gradient', stops: ['accent', 'band'], angle: 135 }} />

// lines, rings, dots, grid or waves, in a theme colour, 12% strong (30% at most).
<BookingCard background={{ type: 'pattern', pattern: 'rings', color: 'accent' }} />

// A picture, cropped to fill, under a layer of the block's own colour:
// `dim` is that layer's strength, 80% if left out and never under 50%.
<BookingCard background={{ type: 'image', src: heroPicture, position: 'top', dim: 85 }} />
```

- **Words stay readable.** `backgroundIssues(look, theme)` checks the
  block's text against every gradient colour, the pattern's lines and the
  worst picture there could be, as `contrastIssues` does for a theme.
  `fixBackground(look, theme)` returns the background with the smallest
  change that passes (a stronger layer, or fainter lines). The defaults pass
  in the sample theme, light and dark, for the quieter tones; on `accent` or
  `band` a picture needs a stronger layer.
- **Pictures are checked.** A picture takes a plain address or an
  `ImageSource`; only https, http, same-site, `blob:` and `data:image/`
  addresses are drawn (`cssImageUrl`). A background picture is decoration:
  one that says something belongs in a picture block, with `alt` text.
- **Nothing moves** for visitors who ask their device for less motion.

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

### Tracking clicks and sign-ups with BuildBase

Blocks load no analytics. `useBlockActions` reports every link, button and
form on the page as a `BlockAction`; your app forwards it to BuildBase
tracking (`@buildbase/sdk/tracking`), which sends it to the tags set up in
the console (GA4, PostHog and the rest) and waits for the visitor's consent
where a tag needs it. Use it once, inside the SDK's provider:

```tsx
'use client';
import { useBlockActions } from '@levuche/ui';
import { useTracking } from '@buildbase/sdk/tracking';

// Form blocks whose submit is a sign-up.
const SIGN_UPS = new Set(['newsletter-band', 'lead-magnet', 'contact-form']);

export function BlockTracking({ children }: { children: React.ReactNode }) {
  const { track } = useTracking();
  useBlockActions(({ action, block, label, href, sell }) => {
    // A sale: BuildBase reports checkout_started and purchase itself.
    if (sell) return;
    // A sign-up is BuildBase's lead event, sent on as a conversion
    // (GA4 generate_lead, Meta Lead, TikTok SubmitForm).
    if (action === 'form_submit' && block && SIGN_UPS.has(block)) {
      track('lead', { block });
      return;
    }
    track(action, {
      block: block ?? 'page',
      label,
      // Where a link goes, by its site only: a mailto: or tel: link holds an address.
      ...(href?.startsWith('http') ? { link_host: new URL(href).host } : {}),
    });
  });
  return children;
}
```

- Event names follow BuildBase's rule: lowercase letters, digits and
  underscores, starting with a letter, 40 characters at most. The built-in
  names are `link_click`, `button_click` and `form_submit`; a block's own
  `data-action` (`buy`, `tip`, `save_contact`, `contact`, `qr_download`,
  `audio_play`, …) follows the same rule, and so must yours.
- Send ids and labels only. Never send what a visitor typed, an email
  address, a name or anything else that identifies them: every tag
  forbids it. A link marked `data-href-private` (a `MessageCard`'s button,
  which carries the message) is reported without its query.
- Each press is reported once: a submit button is reported by its form's
  submit, and a click inside a form (ticking its consent box, say) isn't
  the form's action.
- To make one of these a conversion in an ad network that takes labels
  (Google Ads, X, LinkedIn), map its name to the label under **Settings,
  Tracking & tags** in the BuildBase console.
- Cookie consent isn't here: BuildBase's consent banner covers it.

### Sending forms to BuildBase Forms

`NewsletterBand`, `LeadMagnet`, `ContactForm`, `PackCheckout` and `TipJar`
take `onSubmit` (or `action`) and a `status`: `idle`, `sending`, `sent` or
`error`. While sending, the button is disabled and says so; once sent, a
thank-you shows; on error, the reason shows under the form. Each change is
read out to screen readers. The words are in each block's
`labels`.

Send sign-ups to a BuildBase form rather than a backend of your own. It
stores each submission, adds the person to the audience and sends the
confirmation email:

1. In the BuildBase console, make a collection under **Content,
   Collections** with an `email` field (and any others the block sends,
   such as `name` and `message`), and publish a version.
2. Under **Forms**, create a form on that collection and **Publish** it.
   Until then its endpoint answers 404.
3. For a newsletter or waitlist, turn on **Collect subscribers**. Leave
   **Ask them to confirm (double opt-in)** on, as it is by default, so
   nobody can sign someone else up.

Send the form from your server, not the browser, so the app can check the
request came from its own site, cap each field and solve a captcha the form
asks for. The block posts to your route and shows how it went:

```tsx
'use client';
import { useState } from 'react';
import { NewsletterBand, type FormStatus } from '@levuche/ui';

export function Newsletter() {
  const [status, setStatus] = useState<FormStatus>('idle');
  return (
    <NewsletterBand
      title="Get new packs first"
      status={status}
      onSubmit={async (event) => {
        event.preventDefault();
        if (status === 'sending') return;
        setStatus('sending');
        const email = new FormData(event.currentTarget).get('email');
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => null);
        setStatus(res?.ok ? 'sent' : 'error');
      }}
    />
  );
}
```

The route forwards it to the form's public endpoint, which needs no key.
The body is the data itself, keyed by field slug:

```ts
// app/api/newsletter/route.ts
export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));
  if (typeof email !== 'string' || email.length > 320) {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  const res = await fetch(
    `https://api.console.buildbase.app/api/forms/public/${ORG_ID}/${FORM_ID}/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    }
  );
  return Response.json({ ok: res.ok }, { status: res.ok ? 200 : res.status });
}
```

A `400` lists every field that failed, and a `429` means too many sends
from one address. Show either as `error`. BuildBase's Forms docs cover
captchas, spam rules and the `form.submitted` workflow trigger.

### Selling through BuildBase

Every block that sells takes `sell`: plain data naming what BuildBase
selling checks out. The block shows the offer and reports the press; your
app starts the checkout with the BuildBase SDK. ui has no SDK, no Stripe and
no keys, and the blocks stay Server Components.

| What is sold                                     | `sell`                                                        |
| ------------------------------------------------ | ------------------------------------------------------------- |
| An item, one-time or a subscription price        | `{ itemId, variantId, priceId, quantity?, recurring? }`       |
| Pay what you want, or free                       | the same, with `amount` (minor units) or `free: true`         |
| A booking (`BookingCard`, `SlotPicker`)          | the same; `SlotPicker` adds the chosen `slotStart`            |
| A plan of the app (`PricingTable`, `yearlySell`) | `{ planVersionId, billingInterval? }`                         |
| Credits (`CreditPack`)                           | `{ creditPackageId }`                                         |
| A coupon                                         | `couponCode` on an item, `promotionCode` on a plan or credits |

Blocks with a button (`ActionCard`, `PackRow`, `FeaturedPack`, `PackGrid`, `CourseCard`,
`BookingCard`, `MembershipCard`, `PricingTable`, `CreditPack`,
`SlotPicker`) write it on the button; form blocks (`PackCheckout`,
`TipJar`, `LeadMagnet`) send it as a hidden `sell` field. Any action with
`sell` is a sale, whatever its name (`buy`, `book`, `join`, …):

```tsx
'use client';
import { useBlockActions } from '@levuche/ui';
import { useCheckout } from '@buildbase/sdk/react';

export function Checkout({ children }: { children: React.ReactNode }) {
  const { checkout } = useCheckout();
  useBlockActions(async ({ sell }) => {
    if (!sell || !('itemId' in sell)) return;
    // free and recurring are for the SDK's <BuyButton>; checkout reads the price.
    const { itemId, free: _free, recurring: _recurring, ...input } = sell;
    const start = await checkout(itemId, input);
    if (start.url) window.location.assign(start.url);
  });
  return children;
}
```

In a server action, `readSell(formData)` reads a form's sale back, checked.
Check the price on the server as BuildBase does: a visitor can change a
page.

- `sellState` (`idle`, `sending`, `sold_out`, `unavailable`, `error`)
  shows where the sale stands; the words are in `sellLabels`.
- `renderBuy` draws your own buy button (such as the SDK's `<BuyButton>`)
  in the block's place.
- Affiliates: BuildBase keeps the visitor's referral token itself.
  `referralHref(href, code)` puts a creator's own code on a link as `?ref=`.
- `BookingEmbed` stays for booking pages outside BuildBase; `SlotPicker`
  is the BuildBase way.

### Free and paid blocks

Every block's code is free for anyone building with this package, under the
[licence](LICENSE): free to use, with no reselling. Packs only say what a
creator gets in the Levuche editor: core blocks are free, and a creator
unlocks each other pack once, with a one-time purchase. Using the code
doesn't unlock a pack in Levuche.

| Pack          | What's in it                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `core` (free) | Profile, links, contact and newsletter, basic pictures and video, FAQs and testimonials, map and QR code, and every block that sells through BuildBase |
| `growth`      | Countdown, discount code, locked link, top picks, stats, logo strip, timeline and review summary                                                       |
| `media`       | Carousel, before and after, reels, Spotify, TikTok, Instagram, link embed, audio player and podcast episodes                                           |
| `feeds`       | Latest videos and posts, live status, events and now playing                                                                                           |
| `developer`   | GitHub profile, contribution graph, repositories, package stats and tech stack                                                                         |

Each registry entry has a `pack`. `blocksInPack('media')` lists a pack's
blocks and `isPaidPack(pack)` says whether the editor should ask for the
unlock. Blocks that take payments stay in `core`, so every creator can sell.

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

### Pictures in the right size

Every block that shows a picture takes a plain address or an `ImageSource`
with the other sizes it comes in, so a phone downloads a small copy:

```tsx
<SiteImage
  alt="Chai on a clay stove"
  src={{
    src: 'https://cdn.example.com/chai-800.jpg',
    srcSet:
      'https://cdn.example.com/chai-400.jpg 400w, https://cdn.example.com/chai-800.jpg 800w',
    width: 800,
    height: 600,
  }}
/>
```

- **Each block sets `sizes`** from its width on a phone and in the 576 px
  column (`columnSizes(1 / 3)` for three to a row); pass `sizes` in the source
  only for a page laid out differently, such as a grid page.
- **Nothing jumps while pictures load:** a block's shape, or the picture's own
  `width` and `height`, keeps its space.
- **Pictures load when near the screen.** The header's picture loads at once,
  as it's at the top; mark the first other picture with `priority: true`.
- **Making the sizes is the page app's job.** BuildBase Assets stores a file
  as it was uploaded, with no other sizes, and its uploads for an app's users
  are only workspace and profile pictures, so creator media needs an image
  service that resizes by address.

### Right-to-left scripts and long text

Blocks use start and end, not left and right, so `dir="rtl"` on the page, or
on any element around the blocks, mirrors them for Arabic, Hebrew or Urdu:
link icons sit on the right, the carousel's next slide is on the left (and the
left arrow key moves to it), the before-and-after picture shows from the
right, scrolling logos move right, and grid pages mirror their columns.

Long names, titles and addresses wrap inside their block, even a word with no
place to break, so nothing spills off a phone; prices stay on one line. In
Storybook, the toolbar's Direction menu shows any story right to left, and
**Pages/Right to left and long text** checks a page in Arabic and one with
very long words on each screen.

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
- **Heights in an editor:** on the page a row grows to fit what's in it, but
  a drag-and-drop editor's rows are fixed, so a tall block can look cut short
  there and seem to run into the one below. Measure each block in the editor
  (a `ResizeObserver` on each one, say), then pass the heights in px to
  `fitHeights(layout, measured, blocks)` before showing or saving the layout.
  Each block grows to the rows it needs, up to its kind's largest height,
  never shrinks, keeps lining up with a card beside it, and pushes anything
  under it down.
- **Reading order:** screen readers and the Tab key follow the order of
  `blocks`, whatever the arrangement, so put the profile first.

In Storybook, **Pages/Grid page** shows the sample page on each screen, and a
creator's own desktop arrangement. Each story checks where the blocks landed,
that no block covers another and that the page never scrolls sideways.

## What's in it

| Group       | Blocks                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme, look | `CreatorTheme`, `siteThemeStyle`, `isSafeColor`, `isSafeFont`, `contrastIssues`, `fixContrast`, `Block`, `withBlockLook`, `BlockLook`                                                                                                                         |
| Atoms       | `SiteButton`, `SiteLinkButton`, `SiteLink`, `SiteHeading`, `SiteText`, `Badge`, `Ribbon`, `Thumb`, `Avatar`, `SiteInput`, `Skeleton`, icons                                                                                                                   |
| Molecules   | `SiteSection`, `ItemHead`, `LinkTile`, `Price`, `Rating`, `CheckList`, `Field`, `EmailForm`, `CopyButton`, `PlayFrame`, `SiteDialog`, `Segmented`, `ChoiceChips`, `CountUp`, `StatList`, `Sparkline`, `LiveData`, `AudioBar`, `SellButton`, `MessageComposer` |
| Page        | `SitePage`, `SiteGrid`, `CreatorFooter`, `MapCard`, `QrCode`                                                                                                                                                                                                  |
| Profile     | `CreatorHeader`, `SocialIcons`, `SocialCard`, `SaveContact`                                                                                                                                                                                                   |
| Links       | `ActionCard`, `LinkList`, `FeaturedLink`, `LockedLink`                                                                                                                                                                                                        |
| Selling     | `FeaturedPack`, `PackRow`, `PackGrid`, `BuyButton`, `PackCheckout`, `CourseCard`, `PricingTable`, `CreditPack`, `SlotPicker`, `TopPicks`                                                                                                                      |
| Offers      | `BookingCard`, `BookingEmbed`, `MembershipCard`, `LeadMagnet`, `TipJar`, `DiscountCode`, `Countdown`                                                                                                                                                          |
| Trust       | `Testimonials`, `FaqList`, `LogoStrip`, `StatsRow`, `Timeline`                                                                                                                                                                                                |
| Media       | `YouTubeVideo`, `ReelGrid`, `ImageGrid`, `SiteImage`, `ImageCarousel`, `BeforeAfter`, `SpotifyEmbed`, `TikTokVideo`, `InstagramPost`, `LinkEmbed`, `AudioPlayer`, `PodcastEpisodes`                                                                           |
| Forms       | `NewsletterBand`, `ContactForm`, `MessageCard`                                                                                                                                                                                                                |
| Feeds       | `LatestVideos`, `LatestPosts`, `LiveStatus`, `EventList`, `ReviewSummary`, `NowPlaying`                                                                                                                                                                       |
| Developer   | `GitHubProfile`, `ContributionGraph`, `RepoCard`, `RepoList`, `PackageStats`, `TechStack`                                                                                                                                                                     |

`BLOCKS` in the registry lists every block with its group, so this table
is a summary; the registry is the full list.

`MessageCard` opens a chat on WhatsApp, Telegram, a text, email or
Messenger with a message ready to send (`channel`, `to`, `message`, and
`subject` for email). `messageHref` builds the link on its own: phone
numbers become digits only, usernames keep to each service's characters,
an email address can't carry another address or header, and the message is
URL-encoded. The number or address stays out of the page's HTML until the
page runs (`hideFromSource={false}` to turn that off); `editable` lets the
visitor change the message first.

`BookingCard` and `MembershipCard` link to the page that takes the booking
or the payment, or sell through BuildBase with `sell` (see below). `LeadMagnet`, `TipJar` and `NewsletterBand` are forms: give
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
theme only lets plain colours and fonts into CSS, and
`e2e/contrast.spec.ts` checks the contrast warnings and their suggestions.

### Storybook

Storybook (`stories/`, set up in `.storybook/`) has a story for each block
and state, with its props as controls and docs built from them. The toolbar's
Theme menu shows any story in the sample creator's light or dark scheme or in
a creator's own theme, and `Pages/Creator page` shows a whole page in each. The
Cards menu shows it in each card style, and `Pages/Card styles` shows a whole
page in each. The Direction menu shows it right to left. `Docs/Getting started`
walks through installing and theming, and `Docs/Every block` lists every block
with what it's for, its grid kind and whether it's free, read from the
registry. `CHANGELOG.md` lists what changed in each release.

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
v0.2.0`). The release pull request into `dev` also turns `CHANGELOG.md`'s
   Unreleased section into the new version's, with anything an app must
   change.
4. Each app moves to the new version in its own pull request
   (`npm install github:Levuche/ui#v0.2.0`), where its own tests run.

Tags are never moved or deleted once an app uses them.

## Get help, report a problem or contribute

- Questions and ideas: [Discussions](https://github.com/Levuche/ui/discussions)
- Something broken, or a block you'd like: [open an issue](https://github.com/Levuche/ui/issues/new/choose)
- A security problem: report it privately, as [SECURITY.md](.github/SECURITY.md) says
- Making a change: [CONTRIBUTING.md](.github/CONTRIBUTING.md), and our
  [Code of Conduct](.github/CODE_OF_CONDUCT.md)
