import { Fragment, type ReactNode } from 'react';
import { SiteLink } from '../atoms/link';
import { cn } from '../system/cn';
import { isSafeHref } from '../system/href';
import {
  parseRichText,
  type RichInline,
  type RichLine,
} from '../system/rich-text';

function inline(nodes: RichInline[]): ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case 'text':
        return <Fragment key={i}>{node.text}</Fragment>;
      case 'strong':
        return <strong key={i}>{inline(node.children)}</strong>;
      case 'em':
        return <em key={i}>{inline(node.children)}</em>;
      case 'link':
        // An address that isn't safe shows its words, not a link.
        if (!isSafeHref(node.href)) {
          return <Fragment key={i}>{inline(node.children)}</Fragment>;
        }
        return (
          <SiteLink
            key={i}
            href={node.href}
            className="text-site-link font-semibold underline underline-offset-2"
          >
            {inline(node.children)}
          </SiteLink>
        );
    }
  });
}

function lines(rows: RichLine[]): ReactNode[] {
  return rows.map((row, i) => (
    <Fragment key={i}>
      {i > 0 ? <br /> : null}
      {inline(row)}
    </Fragment>
  ));
}

/**
 * A creator's text with bold, italic, links and lists (see rich-text.ts for
 * the format), drawn as React elements. Nothing in it is ever read as HTML,
 * and links that aren't safe show as plain words.
 */
export function RichText({
  text,
  markers = 'outside',
  className,
}: {
  text: string | null | undefined;
  /** `inside` keeps bullets with centred or end-aligned text. */
  markers?: 'inside' | 'outside';
  className?: string;
}) {
  const blocks = parseRichText(text);
  if (blocks.length === 0) return null;
  const list = cn(
    'm-0 flex flex-col gap-1',
    markers === 'inside' ? 'list-inside ps-0' : 'list-outside ps-5'
  );
  return (
    <div
      className={cn('flex flex-col gap-[0.75em] leading-relaxed', className)}
    >
      {blocks.map((block, i) => {
        if (block.type === 'paragraph') {
          return (
            <p key={i} className="m-0">
              {lines(block.lines)}
            </p>
          );
        }
        const items = block.items.map((item, at) => (
          <li key={at} className="m-0">
            {inline(item)}
          </li>
        ));
        return block.ordered ? (
          <ol
            key={i}
            start={block.start === 1 ? undefined : block.start}
            className={cn(list, 'list-decimal')}
          >
            {items}
          </ol>
        ) : (
          <ul key={i} className={cn(list, 'list-disc')}>
            {items}
          </ul>
        );
      })}
    </div>
  );
}
