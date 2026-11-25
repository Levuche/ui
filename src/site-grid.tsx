import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';
import {
  pageLayouts,
  type BlockKind,
  type GridItem,
  type GridScreen,
  type PageLayouts,
} from './grid';

/** A block on a grid page: what it is, and what to show. */
export type SiteGridBlock = {
  id: string;
  kind: BlockKind;
  /** Sits in the side column on a tablet and desktop. Profiles do already. */
  side?: boolean;
  /** Stays in view while the rest of the page scrolls, on a tablet and desktop. */
  sticky?: boolean;
  children: ReactNode;
};

const SCREEN_KEYS: Record<GridScreen, string> = {
  phone: 'p',
  tablet: 't',
  desktop: 'd',
};

/*
 * Each block gets its column and row on every screen as CSS variables, and
 * the container queries below pick the screen's pair. Classes are written
 * out in full so Tailwind finds them.
 */
const PLACE =
  '[grid-column:var(--grid-p-col)] [grid-row:var(--grid-p-row)] ' +
  '@3xl:[grid-column:var(--grid-t-col)] @3xl:[grid-row:var(--grid-t-row)] ' +
  '@5xl:[grid-column:var(--grid-d-col)] @5xl:[grid-row:var(--grid-d-row)]';

function placeStyle(places: Record<GridScreen, GridItem | undefined>) {
  const style: Record<string, string> = {};
  for (const [screen, key] of Object.entries(SCREEN_KEYS)) {
    const item = places[screen as GridScreen];
    if (!item) continue;
    style[`--grid-${key}-col`] = `${item.x + 1} / span ${item.w}`;
    style[`--grid-${key}-row`] = `${item.y + 1} / span ${item.h}`;
  }
  return style as CSSProperties;
}

/**
 * A creator's page laid out on a 10-column grid, with its own arrangement on
 * a phone, a tablet and a desktop. Give it the blocks, in reading order, and
 * the layouts the creator saved; a screen with no saved layout gets the
 * default one (see defaultLayout). Saved layouts go through fitLayout first,
 * so a block that's gone, new or out of bounds can't break the page.
 *
 * Rows are 3rem tall at the least and grow to fit what's in them, so text is
 * never cut off. The screen is chosen by the page's own width: a tablet from
 * 48rem and a desktop from 64rem. Screen readers and the Tab key follow the
 * order of `blocks`, whatever the arrangement.
 */
export function SiteGrid({
  blocks,
  layouts,
  as: Tag = 'div',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  blocks: SiteGridBlock[];
  layouts?: PageLayouts;
  as?: 'div' | 'main';
}) {
  const fitted = pageLayouts(
    blocks.map(({ id, kind, side }) => ({ i: id, kind, side })),
    layouts
  );
  const placeOf = (screen: GridScreen, id: string) =>
    fitted[screen].find((item) => item.i === id);

  return (
    <Tag
      className={cn('@container mx-auto w-full max-w-6xl', className)}
      {...props}
    >
      <div className="grid auto-rows-[minmax(3rem,auto)] grid-cols-10 gap-4">
        {blocks.map((block) => (
          <div
            key={block.id}
            data-grid-block={block.id}
            className={cn(
              PLACE,
              'flex min-w-0 flex-col *:grow',
              block.sticky && '@3xl:sticky @3xl:top-6 @3xl:self-start'
            )}
            style={placeStyle({
              phone: placeOf('phone', block.id),
              tablet: placeOf('tablet', block.id),
              desktop: placeOf('desktop', block.id),
            })}
          >
            {block.children}
          </div>
        ))}
      </div>
    </Tag>
  );
}
