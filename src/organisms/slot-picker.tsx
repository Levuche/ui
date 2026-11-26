'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { ChoiceChips } from '../molecules/choice-chips';
import { ItemHead, type HeadingTag } from '../molecules/item-head';
import { LiveData } from '../molecules/live-data';
import { SellButton, type SellProps } from '../molecules/sell-button';
import { isTimeZone } from '../system/calendar';
import type { LiveProps } from '../system/live';
import { useVisitorLocale } from '../system/locale';
import type { ItemSell } from '../system/sell';
import { useControllableState } from '../system/state';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';

export type SlotPickerLabels = {
  day: string;
  time: string;
  /** {zone} is filled in. */
  zone: string;
  /** Before a time is picked. */
  pick: string;
  /** {time} is filled in. */
  book: string;
  none: ReactNode;
};

export const SLOT_PICKER_LABELS: SlotPickerLabels = WORDS_EN.slotPicker;

/**
 * Free times for a booking, from the app (BuildBase's booking calendar), as
 * days and then times to pick. The chosen start goes into the sale as
 * `slotStart`, so the buy button books that slot. Times show in `timeZone`,
 * named under them, so the server and the visitor's browser agree.
 */
export function SlotPicker({
  data,
  loading,
  error,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  timeZone,
  locale,
  value,
  defaultValue = '',
  onChange,
  title,
  detail,
  labels,
  headingAs = 'h3',
  ...root
}: BlockRootProps &
  LiveProps<string[]> &
  Omit<SellProps, 'sell'> & {
    /** The booking item; the picked slot is added as `slotStart`. */
    sell: ItemSell;
    /** An IANA zone, such as "Asia/Kolkata". */
    timeZone: string;
    locale?: string;
    /** The picked slot's start, to own the choice. */
    value?: string;
    defaultValue?: string;
    onChange?: (slotStart: string) => void;
    title?: ReactNode;
    detail?: ReactNode;
    labels?: Partial<SlotPickerLabels>;
    headingAs?: HeadingTag;
  }) {
  const words = usePageWords('slotPicker', labels);
  const [picked, setPicked] = useControllableState({
    value,
    defaultValue,
    onChange,
  });
  const id = useId();
  const shownLocale = useVisitorLocale(locale);
  // A zone that isn't one would make the dates throw; show UTC instead.
  const zone = isTimeZone(timeZone) ? timeZone : 'UTC';
  const days = useMemo(() => {
    const dayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const dayName = new Intl.DateTimeFormat(shownLocale, {
      timeZone: zone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    const timeName = new Intl.DateTimeFormat(shownLocale, {
      timeZone: zone,
      hour: 'numeric',
      minute: '2-digit',
    });
    const byDay = new Map<
      string,
      { label: string; times: { value: string; label: string }[] }
    >();
    // By the moment each starts: as text, times in different zones would
    // sort wrong ("10:00+05:30" is before "09:00Z").
    const starts = (data ?? [])
      .map((start) => ({ start, at: new Date(start) }))
      .filter(({ at }) => !Number.isNaN(at.getTime()))
      .sort((a, b) => a.at.getTime() - b.at.getTime());
    for (const { start, at } of starts) {
      const key = dayKey.format(at);
      const day = byDay.get(key) ?? { label: dayName.format(at), times: [] };
      day.times.push({ value: start, label: timeName.format(at) });
      byDay.set(key, day);
    }
    return [...byDay.entries()].map(([key, day]) => ({ key, ...day }));
  }, [data, zone, shownLocale]);

  const [dayKey, setDayKey] = useState('');
  const pickedDay =
    days.find((day) => day.times.some((t) => t.value === picked)) ??
    days.find((day) => day.key === dayKey) ??
    days[0];
  const pickedTime = pickedDay?.times.find((t) => t.value === picked);

  return (
    <Block name="slot-picker" {...root}>
      {title ? (
        <ItemHead title={title} detail={detail} headingAs={headingAs} />
      ) : null}
      <LiveData data={data} loading={loading} error={error}>
        {() =>
          days.length === 0 ? (
            <p className="text-site-text-2 m-0 text-sm">{words.none}</p>
          ) : (
            <>
              <ChoiceChips
                legend={words.day}
                name={`${id}-day`}
                value={pickedDay?.key ?? ''}
                onChange={(key) => {
                  // A new day clears the time: the visitor picks it.
                  setDayKey(key);
                  if (picked) setPicked('');
                }}
                options={days.map((day) => ({
                  value: day.key,
                  label: day.label,
                }))}
              />
              <ChoiceChips
                legend={words.time}
                name={`${id}-time`}
                value={pickedTime?.value ?? ''}
                onChange={setPicked}
                options={pickedDay?.times ?? []}
              />
              <p className="text-site-text-2 m-0 text-sm">
                {words.zone.replace('{zone}', zone)}
              </p>
              <SellButton
                sell={
                  pickedTime
                    ? // As UTC, which BuildBase always takes, whatever way
                      // the app wrote the start.
                      {
                        ...sell,
                        slotStart: new Date(pickedTime.value).toISOString(),
                      }
                    : sell
                }
                sellState={sellState}
                sellLabels={sellLabels}
                renderBuy={renderBuy}
                action="book"
                disabled={!pickedTime}
              >
                {pickedTime
                  ? words.book.replace(
                      '{time}',
                      `${pickedDay.label}, ${pickedTime.label}`
                    )
                  : words.pick}
              </SellButton>
            </>
          )
        }
      </LiveData>
    </Block>
  );
}
