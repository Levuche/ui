/*
 * The grid a creator arranges their page on. Every screen is 10 columns wide
 * and as many rows tall as the page needs. Each screen (phone, tablet and
 * desktop) has its own arrangement, so a block can sit in a different place,
 * and take a different size, on each one.
 *
 * A layout is a list of { i, x, y, w, h } items, in columns and rows, counted
 * from 0 at the top left. It's the shape drag-and-drop grid editors read and
 * write, so an editor's output can be saved as is and given to <SiteGrid>.
 *
 * Plain functions only, so they run on a server, in a browser or in a test.
 */

/** Columns on every screen. */
export const GRID_COLUMNS = 10;

/** The screens a page has an arrangement for, smallest first. */
export const GRID_SCREENS = ['phone', 'tablet', 'desktop'] as const;
export type GridScreen = (typeof GRID_SCREENS)[number];

/**
 * The page is laid out as a tablet from 42rem (672 px) wide and as a desktop
 * from 56rem (896 px). That's the page's own width, after the space around
 * it, so a tablet held upright gets the tablet layout even with a scroll bar
 * and some padding, and a tablet on its side or a laptop gets the desktop
 * one. Measured on the page itself, not the window, so a page inside an
 * editor's preview pane switches at the same sizes.
 */
export const GRID_BREAKPOINTS: Record<GridScreen, number> = {
  phone: 0,
  tablet: 42,
  desktop: 56,
};

/** One row is 3rem (48 px), and there's 1rem (16 px) between rows and columns. */
export const GRID_ROW = 3;
export const GRID_GAP = 1;

/**
 * About how wide the grid is on each screen, in rem. Used to turn a block's
 * sizes into columns; the real width varies a little with the screen.
 */
export const GRID_WIDTH: Record<GridScreen, number> = {
  phone: 22,
  tablet: 44,
  desktop: 68,
};

/** A block's place on one screen, in columns and rows. */
export type GridItem = {
  /** The block's id. */
  i: string;
  /** First column, 0 to 9. */
  x: number;
  /** First row, from 0. */
  y: number;
  /** Columns it spans, 1 to 10. */
  w: number;
  /** Rows it spans. On the page a row grows to fit what's in it. */
  h: number;
};

export type GridLayout = GridItem[];

/** A page's arrangement on each screen. A missing one is made by defaultLayout. */
export type PageLayouts = Partial<Record<GridScreen, GridLayout>>;

/**
 * The kinds of block, each with the sizes it needs:
 *
 * - profile: CreatorHeader, with SocialIcons under it
 * - link: SiteLinkButton, a LinkTile, SaveContact or LockedLink
 * - links: LinkList
 * - card: FeaturedLink, FeaturedPack, PackRow, BookingCard, MembershipCard,
 *   LeadMagnet, TipJar, DiscountCode, Countdown, ContactForm, MapCard, QrCode
 * - media: YouTubeVideo, SiteImage, ImageCarousel, BeforeAfter
 * - gallery: ImageGrid, ReelGrid, PackGrid
 * - text: SiteText, Testimonials, FaqList, Timeline
 * - band: NewsletterBand, PackCheckout, CreatorFooter, LogoStrip, StatsRow
 *
 * Every block's kind is also in BLOCKS, in registry.ts.
 */
export type BlockKind =
  'profile' | 'link' | 'links' | 'card' | 'media' | 'gallery' | 'text' | 'band';

/** What a kind of block needs, in rem. */
export type BlockSize = {
  minWidth: number;
  maxWidth?: number;
  minHeight: number;
  maxHeight?: number;
  /** Two of these sit side by side on a desktop when they're next to each other. */
  half?: boolean;
};

export const BLOCK_SIZES: Record<BlockKind, BlockSize> = {
  profile: { minWidth: 15, maxWidth: 32, minHeight: 9 },
  link: { minWidth: 10, minHeight: 3, maxHeight: 7, half: true },
  links: { minWidth: 15, minHeight: 7 },
  card: { minWidth: 15, minHeight: 7, half: true },
  media: { minWidth: 18, minHeight: 11 },
  gallery: { minWidth: 15, minHeight: 7 },
  text: { minWidth: 15, minHeight: 3 },
  band: { minWidth: 18, minHeight: 7 },
};

/** A block on the page, as the layout helpers see it. */
export type GridBlockSpec = {
  i: string;
  kind: BlockKind;
  /**
   * Sits in the side column on a tablet and desktop. Profiles do unless this
   * says otherwise; anything else can join them, like a newsletter sign-up.
   */
  side?: boolean;
};

/** Size limits in columns and rows, the way grid editors take them. */
export type GridLimits = {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
};

const columnWidth = (screen: GridScreen) =>
  (GRID_WIDTH[screen] - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** How many columns a width in rem takes on a screen, at least 1, at most 10. */
export function columnsFor(width: number, screen: GridScreen) {
  const span = Math.ceil(
    (width + GRID_GAP) / (columnWidth(screen) + GRID_GAP) - 1e-9
  );
  return clamp(span, 1, GRID_COLUMNS);
}

/** How many rows a height in rem takes, at least 1. */
export function rowsFor(height: number) {
  return Math.max(
    1,
    Math.ceil((height + GRID_GAP) / (GRID_ROW + GRID_GAP) - 1e-9)
  );
}

/** A kind of block's size limits on a screen, in columns and rows. */
export function limitsFor(kind: BlockKind, screen: GridScreen): GridLimits {
  const size = BLOCK_SIZES[kind];
  const minW = columnsFor(size.minWidth, screen);
  const maxW =
    size.maxWidth === undefined
      ? GRID_COLUMNS
      : Math.max(minW, columnsFor(size.maxWidth, screen));
  const minH = rowsFor(size.minHeight);
  const maxH =
    size.maxHeight === undefined
      ? Number.POSITIVE_INFINITY
      : Math.max(minH, rowsFor(size.maxHeight));
  return { minW, maxW, minH, maxH };
}

const isSide = (block: GridBlockSpec) => block.side ?? block.kind === 'profile';
/*
 * Blocks start at their smallest height. Rows grow to fit what's in them, so
 * starting small never cuts anything off, while starting tall would leave a
 * gap under a short block.
 */
const startRows = (block: GridBlockSpec) =>
  rowsFor(BLOCK_SIZES[block.kind].minHeight);

/** The row after the last one a layout uses. */
export function layoutBottom(layout: GridLayout) {
  return layout.reduce((bottom, item) => Math.max(bottom, item.y + item.h), 0);
}

/** Every block full width, one under the other, in the order given. */
export function stackLayout(
  blocks: GridBlockSpec[],
  x = 0,
  w = GRID_COLUMNS,
  y = 0
): GridLayout {
  let row = y;
  return blocks.map((block) => {
    const item = { i: block.i, x, y: row, w, h: startRows(block) };
    row += item.h;
    return item;
  });
}

/*
 * Blocks in a column `w` wide from column `x`. Two half blocks next to each
 * other share a row; everything else, and a half block on its own, takes the
 * whole column.
 */
function packLayout(blocks: GridBlockSpec[], x: number, w: number) {
  const half = Math.floor(w / 2);
  const layout: GridLayout = [];
  let row = 0;
  let open: GridItem | null = null;
  for (const block of blocks) {
    const h = startRows(block);
    if (BLOCK_SIZES[block.kind].half && half > 0) {
      if (open) {
        const item = { i: block.i, x: x + half, y: open.y, w: w - half, h };
        // Both halves take the taller one's rows, so the pair lines up.
        open.h = item.h = Math.max(open.h, h);
        layout.push(item);
        row = open.y + open.h;
        open = null;
      } else {
        open = { i: block.i, x, y: row, w: half, h };
        layout.push(open);
      }
      continue;
    }
    if (open) {
      // A half with no partner takes the whole column, so no gap is left.
      open.w = w;
      row = open.y + open.h;
      open = null;
    }
    layout.push({ i: block.i, x, y: row, w, h });
    row += h;
  }
  if (open) open.w = w;
  return layout;
}

/** The two columns a side and main layout splits into. */
function sideAndMain(blocks: GridBlockSpec[]) {
  return {
    side: blocks.filter(isSide),
    main: blocks.filter((block) => !isSide(block)),
  };
}

/*
 * The side column runs the whole height of the main one, so the profile can
 * stay in view while the rest scrolls past.
 */
function stretchSide(side: GridLayout, main: GridLayout) {
  const last = side.at(-1);
  if (last) last.h = Math.max(last.h, layoutBottom(main) - last.y);
  return [...side, ...main];
}

/**
 * The arrangement a page starts with on each screen:
 *
 * - phone: everything one under the other, full width, in the order given
 * - tablet: the profile in a column on the left, the rest one under the
 *   other on the right
 * - desktop: the rest in a grid on the left, two cards to a row where they
 *   fit, and the profile in a column on the right
 */
export function defaultLayout(
  blocks: GridBlockSpec[],
  screen: GridScreen
): GridLayout {
  if (screen === 'phone') return stackLayout(blocks);
  const { side, main } = sideAndMain(blocks);
  if (side.length === 0 || main.length === 0) {
    return screen === 'desktop'
      ? packLayout(blocks, 0, GRID_COLUMNS)
      : stackLayout(blocks);
  }
  if (screen === 'tablet') {
    return stretchSide(stackLayout(side, 0, 4), stackLayout(main, 4, 6));
  }
  return stretchSide(stackLayout(side, 6, 4), packLayout(main, 0, 6));
}

const overlaps = (a: GridItem, b: GridItem) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * Makes a saved layout safe to show: drops blocks that are gone, keeps each
 * block inside the 10 columns and within its kind's size limits, moves a
 * block down if it would cover another, and adds any new block at the
 * bottom, as wide as its kind allows. Returns a new layout; the one given
 * isn't changed.
 */
export function fitLayout(
  layout: GridLayout,
  blocks: GridBlockSpec[],
  screen: GridScreen
): GridLayout {
  const kinds = new Map(blocks.map((block) => [block.i, block.kind]));
  const seen = new Set<string>();
  const kept: GridItem[] = [];
  for (const saved of layout) {
    const kind = kinds.get(saved.i);
    if (!kind || seen.has(saved.i)) continue;
    seen.add(saved.i);
    const limits = limitsFor(kind, screen);
    const whole = (value: number, fallback: number) =>
      Number.isFinite(value) ? Math.round(value) : fallback;
    const w = clamp(whole(saved.w, GRID_COLUMNS), limits.minW, limits.maxW);
    const h = clamp(whole(saved.h, limits.minH), limits.minH, limits.maxH);
    const x = clamp(whole(saved.x, 0), 0, GRID_COLUMNS - w);
    const y = Math.max(0, whole(saved.y, 0));
    kept.push({ i: saved.i, x, y, w, h });
  }

  // Place from the top down; anything covering a placed block moves below it.
  kept.sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: GridItem[] = [];
  for (const item of kept) {
    let clash = placed.find((other) => overlaps(item, other));
    while (clash) {
      item.y = clash.y + clash.h;
      clash = placed.find((other) => overlaps(item, other));
    }
    placed.push(item);
  }

  // New blocks go at the bottom, as wide as their kind allows.
  let row = layoutBottom(placed);
  for (const block of blocks.filter((spec) => !seen.has(spec.i))) {
    const w = limitsFor(block.kind, screen).maxW;
    placed.push({ i: block.i, x: 0, y: row, w, h: startRows(block) });
    row += startRows(block);
  }
  return placed;
}

/** A page's arrangement on every screen: saved ones made safe, missing ones made. */
export function pageLayouts(
  blocks: GridBlockSpec[],
  saved: PageLayouts = {}
): Record<GridScreen, GridLayout> {
  const layouts = {} as Record<GridScreen, GridLayout>;
  for (const screen of GRID_SCREENS) {
    const layout = saved[screen];
    layouts[screen] = layout
      ? fitLayout(layout, blocks, screen)
      : defaultLayout(blocks, screen);
  }
  return layouts;
}
