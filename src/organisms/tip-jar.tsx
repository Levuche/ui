'use client';

import { useId, useState, type FormEventHandler, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteButton } from '../atoms/button';
import { HeartIcon } from '../atoms/icons';
import { SiteInput } from '../atoms/input';
import type { FormStatus } from '../system/state';
import { ChoiceChips } from '../molecules/choice-chips';
import { FormNotice } from '../molecules/form-notice';
import { SellField } from '../molecules/sell-button';
import type { SellRef } from '../system/sell';

/** The words a tip jar shows. */
export type TipJarLabels = {
  other: string;
  sent: ReactNode;
  error: ReactNode;
};

export const TIP_JAR_LABELS: TipJarLabels = {
  other: 'Other amount',
  sent: 'Thank you!',
  error: 'The tip didn’t go through. Please try again.',
};

/**
 * A tip jar: preset amounts to pick, or any other amount. The form sends
 * `amount` (a whole number) to `action`, or hands it to `onSubmit`.
 * `status` is how the payment went. With `sell` (a pay-what-you-want item),
 * the form also sends it as `sell`; the app adds the amount in minor units.
 */
export function TipJar({
  title = 'Leave a tip',
  detail,
  icon,
  amounts = [3, 5, 10],
  defaultAmount,
  currency = '$',
  allowOther = true,
  buttonLabel = 'Tip',
  labels,
  status = 'idle',
  onSubmit,
  action,
  sell,
  ...root
}: BlockRootProps & {
  /** The pay-what-you-want item the tip buys through BuildBase. */
  sell?: SellRef;
  title?: ReactNode;
  detail?: ReactNode;
  /** Beside the title; a heart by default, `null` for none. */
  icon?: ReactNode;
  amounts?: number[];
  /** The amount picked at first; the middle one by default. */
  defaultAmount?: number;
  /** Put before the amount, as "$" or "€". */
  currency?: string;
  /** Show the "Other amount" box. */
  allowOther?: boolean;
  /** The button reads "{buttonLabel} {currency}{amount}". */
  buttonLabel?: string;
  labels?: Partial<TipJarLabels>;
  status?: FormStatus;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string | ((data: FormData) => void | Promise<void>);
}) {
  const words = { ...TIP_JAR_LABELS, ...labels };
  const id = useId();
  const [picked, setPicked] = useState<string>(
    String(defaultAmount ?? amounts[1] ?? amounts[0] ?? '')
  );
  const [other, setOther] = useState('');
  const amount = other || picked;
  return (
    <Block
      as="form"
      name="tip-jar"
      data-action="tip"
      action={action}
      method={typeof action === 'string' ? 'post' : undefined}
      onSubmit={onSubmit}
      {...root}
    >
      <SellField sell={sell} />
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="text-block-title mb-1 flex items-center gap-2 p-0 font-bold">
          {icon === undefined ? (
            <HeartIcon size={20} className="text-site-link" />
          ) : (
            icon
          )}
          {title}
        </legend>
        {detail ? (
          <p className="text-site-text-2 m-0 text-sm">{detail}</p>
        ) : null}
        <ChoiceChips
          // Always one group, so the arrow keys move between amounts. While
          // another amount is typed none is checked, so the chips send nothing.
          name="amount"
          value={other ? '' : picked}
          onChange={(value) => {
            setPicked(value);
            setOther('');
          }}
          options={amounts.map((value) => ({
            value: String(value),
            label: `${currency}${value}`,
          }))}
        />
        {allowOther ? (
          <label
            htmlFor={`${id}-other`}
            className="text-site-text-2 flex flex-col gap-1 text-sm"
          >
            {words.other}
            <SiteInput
              id={`${id}-other`}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              name={other ? 'amount' : undefined}
              value={other}
              onChange={(event) => setOther(event.target.value)}
              className="min-h-control"
            />
          </label>
        ) : null}
      </fieldset>
      <SiteButton
        type="submit"
        action="tip"
        fullWidth
        disabled={!amount}
        loading={status === 'sending'}
      >
        {buttonLabel} {amount ? `${currency}${amount}` : ''}
      </SiteButton>
      <FormNotice status={status} sent={words.sent} error={words.error} />
    </Block>
  );
}
