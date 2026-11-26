import { cn } from '../system/cn';
import { usePageWords } from '../system/page-words';

type Amount = {
  number: number;
  prefix: string;
  suffix: string;
  decimals: number;
  comma: boolean;
};

/**
 * Reads a price as a creator wrote it ("$1,299", "₹499", "12,50 €"): the
 * number, and the words around it. Null when there's no single number.
 */
function readAmount(price: string): Amount | null {
  const match = /^([^\d]*?)(\d[\d.,\s]*\d|\d)([^\d]*)$/.exec(price.trim());
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const plain = digits.replace(/\s/g, '');
  // A comma before one or two final digits, with no full stop, is a decimal
  // comma (12,50); otherwise commas group thousands (1,299).
  const comma = /^[\d.]*,\d{1,2}$/.test(plain) && !plain.includes('.');
  const normal = comma
    ? plain.replace(/\./g, '').replace(',', '.')
    : plain.replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(normal)) return null;
  const decimals = normal.includes('.') ? normal.split('.')[1].length : 0;
  return { number: Number(normal), prefix, suffix, decimals, comma };
}

/**
 * What a visitor saves, written the way the price is ("$8", "₹1,000"), or
 * null when the two prices can't be compared or nothing is saved.
 */
export function priceSaving(value: string, was: string): string | null {
  const now = readAmount(value);
  const before = readAmount(was);
  if (!now || !before) return null;
  if (now.prefix !== before.prefix || now.suffix !== before.suffix) return null;
  const saved = before.number - now.number;
  if (!(saved > 0)) return null;
  const decimals = Math.max(now.decimals, before.decimals);
  const text = saved.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const number = now.comma ? text.replace(/,/g, ' ').replace('.', ',') : text;
  return `${now.prefix}${number}${now.suffix}`;
}

/**
 * A price as the creator wrote it ("$40", "Free", "₹499"), with an optional
 * period ("/ month") and an old price struck through.
 */
export function Price({
  value,
  period,
  was,
  saveLabel: saveLabelProp,
  size = 'md',
  className,
}: {
  value: string;
  /** Shown as "/ month". */
  period?: string;
  /** The price before a discount. */
  was?: string;
  /**
   * With `was`, what the visitor saves, where {amount} is worked out from the
   * two prices. Null hides it. Left out when the prices can't be compared.
   */
  saveLabel?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const own = usePageWords('props');
  const saveLabel = saveLabelProp === undefined ? own.save : saveLabelProp;
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl' };
  const saving = was && saveLabel ? priceSaving(value, was) : null;
  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5',
        className
      )}
    >
      {was ? (
        <s className="text-site-text-2 text-sm whitespace-nowrap tabular-nums">
          <span className="sr-only">{own.was} </span>
          {was}
        </s>
      ) : null}
      <span
        className={cn(
          'font-bold whitespace-nowrap tabular-nums',
          sizes[size] ?? sizes.md
        )}
      >
        {value}
      </span>
      {period ? (
        <span className="text-site-text-2 text-sm">/ {period}</span>
      ) : null}
      {saving && saveLabel ? (
        <span className="text-site-link text-sm font-semibold">
          {saveLabel.replace('{amount}', saving)}
        </span>
      ) : null}
    </span>
  );
}
