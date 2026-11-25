import type { ReactNode } from 'react';
import { cn } from './cn';
import { ChevronDownIcon, StarIcon } from './icons';
import { Avatar } from './profile';

/** What buyers and fans say: a quote, who said it and an optional rating. */
export function Testimonials({
  items,
  className,
}: {
  items: {
    quote: ReactNode;
    name: string;
    /** As "Bought the reel pack". */
    detail?: string;
    avatar?: string | null;
    /** 1 to 5 stars. */
    rating?: number;
  }[];
  className?: string;
}) {
  return (
    <ul className={cn('m-0 flex list-none flex-col gap-2.5 p-0', className)}>
      {items.map((item, i) => {
        const stars =
          item.rating === undefined
            ? null
            : Math.max(0, Math.min(5, Math.round(item.rating)));
        return (
          <li key={`${i}-${item.name}`} className="m-0">
            <figure className="bg-site-surface text-site-text rounded-site m-0 flex flex-col gap-2.5 p-3.5">
              {stars !== null ? (
                <p
                  role="img"
                  aria-label={`${stars} out of 5 stars`}
                  className="text-site-link m-0 flex gap-0.5"
                >
                  {Array.from({ length: 5 }, (_, s) => (
                    <StarIcon
                      key={s}
                      size={16}
                      fill={s < stars ? 'currentColor' : 'none'}
                    />
                  ))}
                </p>
              ) : null}
              <blockquote className="m-0 text-base leading-relaxed">
                {item.quote}
              </blockquote>
              <figcaption className="flex items-center gap-2 text-sm">
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
        );
      })}
    </ul>
  );
}

/** Questions a visitor can open one at a time. */
export function FaqList({
  items,
  className,
}: {
  items: { question: string; answer: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {items.map((item, i) => (
        <details
          key={`${i}-${item.question}`}
          className="bg-site-surface text-site-text rounded-site group"
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
    </div>
  );
}
