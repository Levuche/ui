import { useId, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { CheckIcon } from '../atoms/icons';
import { ProgressBar } from '../atoms/progress-bar';
import { Badge } from '../atoms/text';
import { DaysLeft, type DaysLeftLabels } from '../molecules/days-left';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { cn } from '../system/cn';
import { usePageLocale, usePageWords } from '../system/page-words';
import { WORDS_EN } from '../system/words/en';
import {
  doneCount,
  fillTemplate,
  formatAmount,
  formatPercent,
  progressOf,
  type Progress,
  type ProgressBarStyle,
  type ProgressValueStyle,
} from '../system/progress';

/* ------------------------------------------------------------- GoalTracker */

/** One thing to tick off on the way to a goal. */
export type GoalItem = {
  label: string;
  done?: boolean;
};

/**
 * The goal tracker's words. {done}, {total}, {current}, {target}, {date}
 * and {n} are filled in.
 */
export type GoalTrackerLabels = DaysLeftLabels & {
  /** How many items are done, as "3 of 5 done". */
  items: string;
  /** How much of an amount there is, as "$370 of $1,000". */
  amount: string;
  /** Beside the title once the goal is reached. */
  reached: string;
  /** Names the list of items for screen readers. */
  list: string;
  /** Read out before an item that's done. */
  done: string;
  /** Read out before an item that isn't done yet. */
  notDone: string;
};

export const GOAL_TRACKER_LABELS: GoalTrackerLabels = WORDS_EN.goalTracker;

/**
 * A goal and how far along it is: a title, a deadline with the days left,
 * the items to tick off, and a bar with the percentage. The percentage is
 * worked out from the items that are done, or, when a `target` is set, from
 * `current` towards it, written as money with a `currency` code ("$370 of
 * $1,000") or as a count ("37 of 100").
 *
 * The bar is smooth or in `steps`, in the theme's accent, and is a progress
 * bar to screen readers, named by the title. Renders on the server; only the
 * days left wait for the visitor's browser (see DaysLeft).
 */
export function GoalTracker({
  title,
  detail,
  deadline,
  items = [],
  current,
  target,
  currency,
  bar = 'smooth',
  steps = 10,
  showPercent = true,
  labels,
  locale: localeProp,
  now,
  headingAs: Heading = 'h3',
  ...root
}: BlockRootProps & {
  title: ReactNode;
  /** A line about the goal. */
  detail?: ReactNode;
  /** When it's due, as an ISO date and time. */
  deadline?: string;
  /** The steps to tick off. Without a `target`, they make the percentage. */
  items?: GoalItem[];
  /** How much there is so far, towards `target`. */
  current?: number;
  /** An amount to reach. Set, it makes the percentage instead of the items. */
  target?: number;
  /** A three-letter code (USD, INR) to write the amounts as money. */
  currency?: string;
  bar?: ProgressBarStyle;
  /** How many steps the bar has, from 2 to 20, when it's in steps. */
  steps?: number;
  showPercent?: boolean;
  labels?: Partial<GoalTrackerLabels>;
  /** For the numbers and the date. Left out, en-US, as on the server. */
  locale?: string;
  /** Freeze the clock for the days left (ms), for previews and tests. */
  now?: number;
  headingAs?: HeadingTag;
}) {
  const locale = usePageLocale(localeProp);
  const words = usePageWords('goalTracker', labels);
  const headingId = useId();
  const byAmount = target !== undefined && target !== null;

  let progress: Progress;
  let summary = '';
  if (byAmount) {
    progress = progressOf(current ?? 0, target);
    const now = formatAmount(current ?? 0, { currency, locale });
    summary = progress.valid
      ? fillTemplate(words.amount, {
          current: now,
          target: formatAmount(target, { currency, locale }),
        })
      : now;
  } else {
    const count = doneCount(items);
    progress = progressOf(count.done, count.total);
    summary = count.total
      ? fillTemplate(words.items, { done: count.done, total: count.total })
      : '';
  }
  const percent = formatPercent(progress.percent, locale);
  const valueText = [summary, percent].filter(Boolean).join(', ');

  return (
    <Block
      as="article"
      name="goal-tracker"
      data-done={progress.done ? '' : undefined}
      {...root}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Heading
          id={headingId}
          className="text-block-title m-0 min-w-0 leading-tight font-bold"
        >
          {title}
        </Heading>
        {progress.done ? <Badge tone="solid">{words.reached}</Badge> : null}
      </div>
      {detail ? <p className="text-site-text-2 m-0 text-sm">{detail}</p> : null}
      {deadline ? (
        <DaysLeft
          deadline={deadline}
          now={now}
          locale={locale}
          labels={words}
        />
      ) : null}
      <div className="flex flex-col gap-1.5">
        {summary || showPercent ? (
          <p
            aria-hidden
            className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 text-sm"
          >
            <span className="text-site-text-2">{summary}</span>
            {showPercent ? (
              <span className="text-base font-bold tabular-nums">
                {percent}
              </span>
            ) : null}
          </p>
        ) : null}
        <ProgressBar
          value={progress.value}
          max={progress.max}
          steps={bar === 'steps' ? steps : undefined}
          labelledBy={headingId}
          valueText={valueText}
          locale={locale}
        />
      </div>
      {items.length ? (
        <ul
          aria-label={words.list}
          className="m-0 flex list-none flex-col gap-2 p-0 text-sm"
        >
          {items.map((item, n) => (
            <li key={n} className="m-0 flex items-start gap-2.5">
              <span
                aria-hidden
                className={cn(
                  'mt-px inline-flex size-5 flex-none items-center justify-center rounded-full border-2',
                  item.done
                    ? 'bg-site-button border-site-button text-site-on-button'
                    : 'border-site-border'
                )}
              >
                {item.done ? <CheckIcon size={12} strokeWidth={3} /> : null}
              </span>
              <span className={item.done ? 'text-site-text-2' : undefined}>
                <span className="sr-only">
                  {item.done ? words.done : words.notDone}:{' '}
                </span>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </Block>
  );
}

/* ------------------------------------------------------------ ProgressList */

/** One bar in a ProgressList, such as a skill or a rating. */
export type ProgressItem = {
  label: string;
  value: number;
  /** What counts as full for this one. Left out, the list's `max`. */
  max?: number;
};

/** The progress list's words. {value} and {max} are filled in. */
export type ProgressListLabels = {
  /** A value out of its max, as "4 of 5". */
  amount: string;
};

export const PROGRESS_LIST_LABELS: ProgressListLabels = WORDS_EN.progressList;

/**
 * Bars in a list, one per skill, rating or language, with a name and its
 * number: as a percentage ("80%"), as an amount ("4 of 5") or not at all.
 * The same bar as GoalTracker, smooth or in steps; each is a progress bar to
 * screen readers, named by its label.
 */
export function ProgressList({
  items,
  title,
  max = 100,
  valueAs = 'percent',
  bar = 'smooth',
  steps = 10,
  labels,
  locale: localeProp,
  headingAs = 'h3',
  ...root
}: BlockRootProps & {
  items: ProgressItem[];
  title?: ReactNode;
  /** What counts as full, unless an item says otherwise. */
  max?: number;
  valueAs?: ProgressValueStyle;
  bar?: ProgressBarStyle;
  /** How many steps each bar has, from 2 to 20, when they're in steps. */
  steps?: number;
  labels?: Partial<ProgressListLabels>;
  /** For the numbers. Left out, en-US, as on the server. */
  locale?: string;
  headingAs?: HeadingTag;
}) {
  const locale = usePageLocale(localeProp);
  const words = usePageWords('progressList', labels);
  const id = useId();
  return (
    <Block name="progress-list" {...root}>
      {title ? <ItemHead title={title} headingAs={headingAs} /> : null}
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((item, n) => {
          const progress = progressOf(item.value, item.max ?? max);
          const percent = formatPercent(progress.percent, locale);
          const shown =
            valueAs === 'amount'
              ? fillTemplate(words.amount, {
                  value: formatAmount(progress.value, { locale }),
                  max: formatAmount(progress.max, { locale }),
                })
              : valueAs === 'none'
                ? ''
                : percent;
          return (
            <li key={n} className="m-0 flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span id={`${id}-${n}`} className="min-w-0 font-semibold">
                  {item.label}
                </span>
                {shown ? (
                  <span
                    aria-hidden
                    className="text-site-text-2 flex-none tabular-nums"
                  >
                    {shown}
                  </span>
                ) : null}
              </span>
              <ProgressBar
                value={progress.value}
                max={progress.max}
                steps={bar === 'steps' ? steps : undefined}
                labelledBy={`${id}-${n}`}
                valueText={shown || percent}
                locale={locale}
                size="sm"
              />
            </li>
          );
        })}
      </ul>
    </Block>
  );
}
