/*
 * Selling from a block. A block that sells takes a `sell` reference: plain
 * data naming what BuildBase selling should check out. The block shows the
 * offer and reports the press; the app starts the checkout. Nothing here
 * calls the network or knows a key, and every block stays a Server Component.
 *
 * A reference is written on the button as data-sell, and in a form as a
 * hidden `sell` field, both as JSON. `useBlockActions` reads it back into
 * the action (`action.sell`), and a server action reads it with `readSell`.
 */

/** An item from a seller: one-time, a subscription price, a booking or free. */
export type ItemSell = {
  itemId: string;
  variantId: string;
  priceId: string;
  /** How many; the variant's least quantity when left out. */
  quantity?: number;
  /** Pay what you want: the buyer's amount in minor units, such as cents. */
  amount?: number;
  /** A free claim: no payment page. */
  free?: boolean;
  /** The price is a subscription. */
  recurring?: boolean;
  /** The chosen slot's start, as an ISO time, for an item booked by time. */
  slotStart?: string;
  couponCode?: string;
};

/** A plan of the app itself, as a subscription. */
export type PlanSell = {
  planVersionId: string;
  /** As "monthly" or "yearly"; monthly when left out. */
  billingInterval?: string;
  promotionCode?: string;
};

/** A pack of credits. */
export type CreditSell = {
  creditPackageId: string;
  promotionCode?: string;
};

/** What a block sells. */
export type SellRef = ItemSell | PlanSell | CreditSell;

export type SellKind = 'item' | 'plan' | 'credits';

export function sellKind(ref: SellRef): SellKind {
  if ('planVersionId' in ref) return 'plan';
  if ('creditPackageId' in ref) return 'credits';
  return 'item';
}

/** Where the sale stands, from the app. */
export type SellState =
  'idle' | 'sending' | 'sold_out' | 'unavailable' | 'error';

export type SellLabels = {
  soldOut: string;
  unavailable: string;
  error: string;
};

export const SELL_LABELS: SellLabels = {
  soldOut: 'Sold out',
  unavailable: 'Not on sale right now',
  error: 'That didn’t go through. Please try again.',
};

const ID = /^[A-Za-z0-9_-]{1,64}$/;
const CODE = /^[A-Za-z0-9_-]{1,64}$/;
const INTERVAL =
  /^(daily|weekly|monthly|quarterly|half_yearly|yearly|(day|week|month|year)_[1-9][0-9]{0,2})$/;

const text = (value: unknown, pattern: RegExp) =>
  typeof value === 'string' && pattern.test(value) ? value : undefined;

const whole = (value: unknown, min: number, max: number) =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= min &&
  value <= max
    ? value
    : undefined;

const isoTime = (value: unknown) =>
  typeof value === 'string' &&
  value.length <= 40 &&
  /^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:\d{2})$/.test(value) &&
  !Number.isNaN(Date.parse(value))
    ? value
    : undefined;

/** Drops the keys that are undefined, so the JSON stays small. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as T;
}

/**
 * The reference with only the fields BuildBase takes, each checked, or null
 * when it names nothing that can be sold. Use it on anything read back from
 * a page, since a visitor can change the page.
 */
export function cleanSellRef(value: unknown): SellRef | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if ('planVersionId' in v) {
    const planVersionId = text(v.planVersionId, ID);
    if (!planVersionId) return null;
    return compact<PlanSell>({
      planVersionId,
      billingInterval: text(v.billingInterval, INTERVAL),
      promotionCode: text(v.promotionCode, CODE),
    });
  }
  if ('creditPackageId' in v) {
    const creditPackageId = text(v.creditPackageId, ID);
    if (!creditPackageId) return null;
    return compact<CreditSell>({
      creditPackageId,
      promotionCode: text(v.promotionCode, CODE),
    });
  }
  const itemId = text(v.itemId, ID);
  const variantId = text(v.variantId, ID);
  const priceId = text(v.priceId, ID);
  if (!itemId || !variantId || !priceId) return null;
  return compact<ItemSell>({
    itemId,
    variantId,
    priceId,
    quantity: whole(v.quantity, 1, 999),
    amount: whole(v.amount, 0, 100_000_000),
    free: v.free === true ? true : undefined,
    recurring: v.recurring === true ? true : undefined,
    slotStart: isoTime(v.slotStart),
    couponCode: text(v.couponCode, CODE),
  });
}

/** The reference as JSON, for data-sell or a hidden field; '' if unusable. */
export function sellJson(ref: SellRef | null | undefined): string {
  const clean = ref ? cleanSellRef(ref) : null;
  return clean ? JSON.stringify(clean) : '';
}

/**
 * Reads a reference back: from a form's data in a server action, or from
 * the JSON a block wrote. Null when it's missing or not a sale.
 */
export function readSell(
  source: FormData | string | null | undefined
): SellRef | null {
  const raw =
    typeof source === 'string'
      ? source
      : source instanceof FormData
        ? source.get('sell')
        : null;
  if (typeof raw !== 'string' || !raw || raw.length > 2000) return null;
  try {
    return cleanSellRef(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * A link with an affiliate's referral code as `?ref=`, the way BuildBase
 * links carry it. Other query parts and the #anchor stay as they were.
 */
export function referralHref(href: string, code: string | null | undefined) {
  const ref = code ? text(code, CODE) : undefined;
  if (!ref) return href;
  const [whole, hash] = href.split('#', 2);
  // Last click wins: an older code in the link is replaced.
  const base = whole.replace(/([?&])ref=[^&]*(&|$)/, (_, lead, tail) =>
    tail ? lead : ''
  );
  const joined = `${base}${base.includes('?') ? '&' : '?'}ref=${ref}`;
  return hash === undefined ? joined : `${joined}#${hash}`;
}
