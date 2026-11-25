import type { ReactNode } from 'react';
import { Avatar } from '../atoms/avatar';
import { Block, type BlockRootProps } from '../atoms/block';
import { ChevronDownIcon } from '../atoms/icons';
import { cn } from '../system/cn';
import { Rating } from '../molecules/rating';

/** What buyers and fans say: a quote, who said it and an optional rating. */
export function Testimonials({
  items,
  columns = 1,
  cardTone = 'filled',
  ...root
}: BlockRootProps & {
  items: {
    quote: ReactNode;
    name: string;
    /** As "Bought the reel pack". */
    detail?: string;
    avatar?: string | null;
    /** 1 to 5 stars. */
    rating?: number;
  }[];
  /** Quotes to a row from a tablet up. */
  columns?: 1 | 2 | 3;
  /** `filled` puts each quote on a card; `outline` draws a line round it. */
  cardTone?: 'filled' | 'outline';
}) {
  return (
    <Block name="testimonials" defaults={{ tone: 'plain' }} {...root}>
      <ul
        className={cn(
          'm-0 grid list-none gap-2.5 p-0',
          columns === 2 && 'md:grid-cols-2',
          columns === 3 && 'md:grid-cols-3'
        )}
      >
        {items.map((item, i) => (
          <li key={`${i}-${item.name}`} className="m-0">
            <figure
              className={cn(
                'text-site-text rounded-block m-0 flex h-full flex-col gap-2.5 p-3.5',
                cardTone === 'outline'
                  ? 'border-site-border border-2'
                  : 'bg-site-surface'
              )}
            >
              {item.rating !== undefined ? (
                <p className="m-0">
                  <Rating value={item.rating} />
                </p>
              ) : null}
              <blockquote className="m-0 leading-relaxed">
                {item.quote}
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-2 text-sm">
                <Avatar name={item.name} src={item.avatar} size={32} />
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold">{item.name}</span>
                  {item.detail ? (
                    <span className="text-site-text-2">{item.detail}</span>
                  ) : null}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/**
 * Questions a visitor can open. `exclusive` lets only one be open at a time
 * (the browser closes the others; no JavaScript).
 */
export function FaqList({
  items,
  exclusive = false,
  defaultOpen,
  ...root
}: BlockRootProps & {
  items: { question: string; answer: ReactNode }[];
  exclusive?: boolean;
  /** The question open at first, by position. */
  defaultOpen?: number;
}) {
  const group = exclusive ? `faq-${root.id ?? 'list'}` : undefined;
  return (
    <Block
      name="faq-list"
      defaults={{ tone: 'plain' }}
      {...root}
      className={cn('gap-2', root.className)}
    >
      {items.map((item, i) => (
        <details
          key={`${i}-${item.question}`}
          name={group}
          open={defaultOpen === i || undefined}
          className="bg-site-surface text-site-text rounded-block group"
        >
          <summary className="min-h-control-md flex cursor-pointer list-none items-center justify-between gap-3 p-3 font-semibold [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDownIcon
              size={20}
              className="flex-none transition-transform group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="text-site-text-2 px-3 pb-3 text-sm leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </Block>
  );
}
