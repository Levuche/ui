import { useCallback, useState } from 'react';

/*
 * State a block can own or hand to the app: the carousel's slide, the
 * tip jar's amount, the slider's position. Leave `value` out and the block
 * keeps it itself (uncontrolled, starting at `defaultValue`); pass `value`
 * and `onChange` and the app owns it (controlled), as with a React <input>.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const [own, setOwn] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : own;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setOwn(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );
  return [current, set];
}

/** Where a form is: nothing sent yet, sending, sent, or it failed. */
export type FormStatus = 'idle' | 'sending' | 'sent' | 'error';
