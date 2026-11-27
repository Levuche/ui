'use client';

import { useId, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { ItemHead, subHeading, type HeadingTag } from '../molecules/item-head';
import { Segmented } from '../molecules/segmented';
import { yearlySaving } from '../molecules/price';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { useControllableState } from '../system/state';
import type { SellProps } from '../molecules/sell-button';
import type { SellRef, SellState } from '../system/sell';
import { MembershipCard } from './offers';
import { WORDS_EN } from '../system/words/en';
import { usePageLocale, usePageWords } from '../system/page-words';

/**
 * What a plan checks out for its yearly price: `yearlySell`, or the monthly
 * plan billed yearly. An item or credit pack has no yearly billing, so with
 * no `yearlySell` it sells nothing yearly rather than the monthly price.
 */
function yearlySell(plan: Plan): SellRef | undefined {
  if (plan.yearlySell) return plan.yearlySell;
  if (plan.sell && 'planVersionId' in plan.sell) {
    return { ...plan.sell, billingInterval: 'yearly' };
  }
  return undefined;
}

/** How often a plan is paid for. */
export type BillingPeriod = 'monthly' | 'yearly';

/** One plan in a PricingTable. A yearly price turns the switch on. */
export type Plan = {
  name: string;
  /** As "₹299". */
  price: string;
  /** The yearly price, as "₹2,999". */
  yearlyPrice?: string;
  was?: string;
  perks: ReactNode[];
  /** Where the plan is bought. Not needed with `sell`. */
  href?: string;
  /** Where the yearly plan is bought, when it isn't `href`. */
  yearlyHref?: string;
  /** What BuildBase selling checks out for the monthly price. */
  sell?: SellRef;
  /**
   * What it checks out for the yearly price. Left out, a plan's `sell` is
   * billed yearly; an item or credit pack sells nothing yearly.
   */
  yearlySell?: SellRef;
  /** Where this plan's sale stands, from the app. */
  sellState?: SellState;
  /** Outlined in the button colour, with `featuredLabel`. */
  featured?: boolean;
  featuredLabel?: string;
  /** A small tilted label over the plan's top corner, such as "Best value". */
  ribbon?: string;
  buttonLabel?: string;
};

export type PricingTableLabels = {
  billing: string;
  monthly: string;
  yearly: string;
  /**
   * Shown beside Yearly, such as "Save 20%". Left out, `yearlySave` with
   * the least any plan saves by paying yearly, when the prices say.
   */
  yearlyNote?: ReactNode;
  /** {n} is the percent saved. */
  yearlySave: string;
  month: string;
  year: string;
};

export const PRICING_TABLE_LABELS: PricingTableLabels = WORDS_EN.pricingTable;

const PLAN_COLUMNS = {
  2: '@xl:grid-cols-2',
  3: '@xl:grid-cols-2 @4xl:grid-cols-3',
  4: '@xl:grid-cols-2 @5xl:grid-cols-4',
} as const;

/**
 * Two to four plans side by side, each a MembershipCard. When any plan has
 * a yearly price, a Monthly / Yearly switch shows the prices for each; the
 * app can own the switch with `period` and `onPeriodChange`.
 */
export function PricingTable({
  plans,
  title,
  detail,
  period,
  defaultPeriod = 'monthly',
  onPeriodChange,
  labels,
  cardTone = 'surface',
  headingAs = 'h2',
  newTab,
  sponsored,
  nofollow,
  sellLabels,
  renderBuy,
  saveLabel,
  ...root
}: BlockRootProps &
  LinkBehavior &
  Pick<SellProps, 'sellLabels' | 'renderBuy'> & {
    /** With `was`, what the visitor saves ("Save {amount}"); null hides it. */
    saveLabel?: string | null;
    plans: Plan[];
    title?: ReactNode;
    detail?: ReactNode;
    period?: BillingPeriod;
    defaultPeriod?: BillingPeriod;
    onPeriodChange?: (period: BillingPeriod) => void;
    labels?: Partial<PricingTableLabels>;
    /** The plans' own tone. */
    cardTone?: BlockRootProps['tone'];
    headingAs?: HeadingTag;
  }) {
  const words = usePageWords('pricingTable', labels);
  const locale = usePageLocale();
  // What every yearly plan saves at least, so the note is true for each.
  const savings = plans.map((plan) =>
    plan.yearlyPrice ? yearlySaving(plan.price, plan.yearlyPrice) : undefined
  );
  const leastSaving = savings.some((saving) => saving === null)
    ? null
    : Math.min(...savings.filter((saving): saving is number => saving != null));
  const yearlyNote =
    words.yearlyNote ??
    (leastSaving !== null && Number.isFinite(leastSaving)
      ? words.yearlySave.replace(
          '{n}',
          new Intl.NumberFormat(locale ?? 'en-US').format(leastSaving)
        )
      : undefined);
  const name = useId();
  const [shown, setShown] = useControllableState({
    value: period,
    defaultValue: defaultPeriod,
    onChange: onPeriodChange,
  });
  const hasYearly = plans.some((plan) => plan.yearlyPrice);
  const yearly = hasYearly && shown === 'yearly';
  const cols = Math.min(4, Math.max(2, plans.length)) as 2 | 3 | 4;
  const planHeading = subHeading(headingAs);
  return (
    <Block name="pricing-table" {...root}>
      {title ? (
        <ItemHead title={title} detail={detail} headingAs={headingAs} />
      ) : null}
      {hasYearly ? (
        <Segmented
          legend={words.billing}
          name={name}
          value={shown}
          onChange={setShown}
          className="self-center"
          options={[
            { value: 'monthly', label: words.monthly },
            { value: 'yearly', label: words.yearly, note: yearlyNote },
          ]}
        />
      ) : null}
      <div className={cn('@container grid gap-4', PLAN_COLUMNS[cols])}>
        {plans.map((plan) => {
          const useYear = yearly && plan.yearlyPrice;
          return (
            <MembershipCard
              saveLabel={saveLabel}
              key={plan.name}
              title={plan.name}
              price={useYear ? plan.yearlyPrice! : plan.price}
              was={useYear ? undefined : plan.was}
              period={useYear ? words.year : words.month}
              perks={plan.perks}
              href={useYear ? (plan.yearlyHref ?? plan.href) : plan.href}
              sell={useYear ? yearlySell(plan) : plan.sell}
              sellState={plan.sellState}
              sellLabels={sellLabels}
              renderBuy={renderBuy}
              featured={plan.featured}
              featuredLabel={plan.featuredLabel}
              ribbon={plan.ribbon}
              buttonLabel={plan.buttonLabel}
              headingAs={planHeading}
              tone={cardTone}
              newTab={newTab}
              sponsored={sponsored}
              nofollow={nofollow}
            />
          );
        })}
      </div>
    </Block>
  );
}
