import { Avatar } from '../atoms/avatar';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteDivider, SiteHeading } from '../atoms/text';
import { RichText } from '../molecules/rich-text';
import { cn } from '../system/cn';
import { editable } from '../system/edit';
import { GRID_GAP, GRID_ROW } from '../system/grid';
import type { ImageSrc } from '../system/image';
import {
  nameLook,
  type NameCase,
  type NameColor,
  type NameWeight,
} from '../system/name-style';
import { anchorId } from '../system/rich-text';

/*
 * Blocks for the words on a page: a heading that starts a part of the page,
 * a paragraph or list, a quote, and a gap between blocks. Everything a
 * creator types here is shown as text, never read as HTML.
 */

/**
 * A heading that starts a part of the page, such as "My works" or "Let's
 * connect", with an optional line of detail under it. Give it an `id` and a
 * link elsewhere can jump to it (#my-works); the id is cleaned to small letters,
 * digits and hyphens. On a grid page it takes the whole width of its column.
 */
export function SectionHeading({
  title,
  detail,
  headingAs = 'h2',
  id,
  titleColor,
  titleTint,
  titleCase,
  titleWeight,
  ...root
}: BlockRootProps & {
  title: string;
  detail?: string;
  /** The heading's colour from the theme: text (as the rest), accent or links. */
  titleColor?: NameColor;
  /**
   * A colour of the creator's own for the heading, in place of
   * `titleColor`. Only a plain colour is used (isSafeColor).
   */
  titleTint?: string;
  /** `upper` writes the heading in capitals; screen readers hear it as typed. */
  titleCase?: NameCase;
  /** How heavy the heading is: bold if left out. */
  titleWeight?: NameWeight;
  /** The heading's level on the page. `p` when it's only for looks. */
  headingAs?: 'h2' | 'h3' | 'p';
}) {
  const anchor = anchorId(id) || undefined;
  const titleStyle = nameLook({
    color: titleColor,
    tint: titleTint,
    case: titleCase,
    weight: titleWeight,
  });
  return (
    <Block
      name="section-heading"
      defaults={{ tone: 'plain' }}
      {...root}
      id={anchor}
      className={cn('scroll-mt-6 justify-end gap-1', root.className)}
    >
      <SiteHeading
        {...editable('title')}
        as={headingAs}
        size="lg"
        className={cn(
          'text-[calc(var(--block-title)*1.35)] text-balance',
          titleStyle.className
        )}
        style={titleStyle.style}
      >
        {title}
      </SiteHeading>
      {detail ? (
        <p
          {...editable('detail', 'longText')}
          className="text-site-text-2 m-0 leading-snug"
        >
          {detail}
        </p>
      ) : null}
    </Block>
  );
}

/**
 * A paragraph, or a few, with **bold**, *italic*, [links](https://…),
 * bullet and numbered lists and emoji. `size` and `align` set the text's
 * size and alignment. The text is never read as HTML, and links that
 * aren't safe show as plain words.
 */
export function TextBlock({
  text,
  ...root
}: BlockRootProps & {
  /** The words, in the format rich-text.ts describes. */
  text: string;
}) {
  const align = root.align ?? 'start';
  return (
    <Block name="text-block" {...root}>
      <RichText
        text={text}
        marks={editable('text', 'longText')}
        markers={align === 'start' ? 'outside' : 'inside'}
        className="self-stretch"
      />
    </Block>
  );
}

/**
 * A quote, with who said it and a small picture. The picture shows when
 * `avatar` is given; `null` shows the name's initials instead.
 */
export function QuoteBlock({
  quote,
  name,
  detail,
  avatar,
  ...root
}: BlockRootProps & {
  quote: string;
  /** Who said it. */
  name?: string;
  /** As "Founder, Chai Co." */
  detail?: string;
  avatar?: ImageSrc | null;
}) {
  return (
    <Block
      name="quote-block"
      as="figure"
      {...root}
      className={cn('m-0', root.className)}
    >
      <blockquote className="m-0 flex flex-col gap-1">
        <span
          aria-hidden="true"
          className="text-site-link block h-[0.5em] text-[calc(var(--block-title)*2.5)] leading-none font-bold"
        >
          “
        </span>
        <p
          {...editable('quote', 'longText')}
          className="text-block-title m-0 leading-snug font-semibold whitespace-pre-line"
        >
          {quote}
        </p>
      </blockquote>
      {name ? (
        <figcaption className="flex items-center gap-2.5 text-sm">
          {avatar !== undefined ? (
            <Avatar
              name={name}
              src={avatar}
              size={40}
              marks={editable('avatar', 'picture')}
            />
          ) : null}
          <span className="flex min-w-0 flex-col">
            <span {...editable('name')} className="font-semibold">
              {name}
            </span>
            {detail ? (
              <span {...editable('detail')} className="text-site-text-2">
                {detail}
              </span>
            ) : null}
          </span>
        </figcaption>
      ) : null}
    </Block>
  );
}

/** The most rows a spacer can take. */
export const SPACER_MAX_ROWS = 12;

/** A spacer's height in rem for its rows, gaps between rows included. */
export function spacerHeight(rows: number) {
  const whole = Number.isFinite(rows) ? Math.round(rows) : 1;
  const count = Math.min(Math.max(whole, 1), SPACER_MAX_ROWS);
  return count * GRID_ROW + (count - 1) * GRID_GAP;
}

/**
 * An empty gap between blocks, or a thin line across it. Its height is in
 * grid rows (1 to 12); on a grid page give its place the same rows. A gap is
 * hidden from screen readers; a line is read as a separator.
 */
export function Spacer({
  rows = 1,
  line = false,
  ...root
}: BlockRootProps & {
  /** How tall, in grid rows. */
  rows?: number;
  /** Draw a thin line across the middle. */
  line?: boolean;
}) {
  return (
    <Block
      name="spacer"
      defaults={{ tone: 'plain' }}
      {...editable('rows', 'setting')}
      {...(line ? {} : { 'aria-hidden': true })}
      {...root}
      className={cn('justify-center', root.className)}
      style={{ minHeight: `${spacerHeight(rows)}rem`, ...root.style }}
    >
      {line ? <SiteDivider className="self-stretch" /> : null}
    </Block>
  );
}
