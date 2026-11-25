'use client';

import { useId, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { Segmented } from '../molecules/segmented';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import { useControllableState } from '../system/state';
import type { SellProps } from '../molecules/sell-button';
import type { SellRef, SellState } from '../system/sell';
import { MembershipCard } from './offers';

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
  /** What it checks out for the yearly price, when it isn't `sell`. */
  yearlySell?: SellRef;
  /** Where this plan's sale stands, from the app. */
  sellState?: SellState;
  /** Outlined in the button colour, with `featuredLabel`. */
  featured?: boolean;
  featuredLabel?: string;
  buttonLabel?: string;
};

export type PricingTableLabels = {
  billing: string;
  monthly: string;
  yearly: string;
  /** Shown beside Yearly, such as "Save 20%". */
  yearlyNote?: ReactNode;
  month: string;
  year: string;
};

export const PRICING_TABLE_LABELS: PricingTableLabels = {
  billing: 'Billing',
  monthly: 'Monthly',
  yearly: 'Yearly',
  month: 'month',
  year: 'year',
};

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
  ...root
}: BlockRootProps &
  LinkBehavior &
  Pick<SellProps, 'sellLabels' | 'renderBuy'> & {
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
  const words = { ...PRICING_TABLE_LABELS, ...labels };
  const name = useId();
  const [shown, setShown] = useControllableState({
    value: period,
    defaultValue: defaultPeriod,
    onChange: onPeriodChange,
  });
  const hasYearly = plans.some((plan) => plan.yearlyPrice);
  const yearly = hasYearly && shown === 'yearly';
  const cols = Math.min(4, Math.max(2, plans.length)) as 2 | 3 | 4;
  const planHeading =
    headingAs === 'h2' ? 'h3' : headingAs === 'h3' ? 'h4' : 'p';
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
            { value: 'yearly', label: words.yearly, note: words.yearlyNote },
          ]}
        />
      ) : null}
      <div className={cn('@container grid gap-4', PLAN_COLUMNS[cols])}>
        {plans.map((plan) => {
          const useYear = yearly && plan.yearlyPrice;
          return (
            <MembershipCard
              key={plan.name}
              title={plan.name}
              price={useYear ? plan.yearlyPrice! : plan.price}
              was={useYear ? undefined : plan.was}
              period={useYear ? words.year : words.month}
              perks={plan.perks}
              href={useYear ? (plan.yearlyHref ?? plan.href) : plan.href}
              sell={useYear ? (plan.yearlySell ?? plan.sell) : plan.sell}
              sellState={plan.sellState}
              sellLabels={sellLabels}
              renderBuy={renderBuy}
              featured={plan.featured}
              featuredLabel={plan.featuredLabel}
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
