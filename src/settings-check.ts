/*
 * Checks, when the package is type-checked, that every block's settings in
 * BLOCKS (system/registry.ts) match the block's props. Nothing here runs:
 * `npm run typecheck` fails with a line naming the block and the prop, as
 *
 *   Type '"TipJar.amounts: a text field doesn't fit the prop"' does not
 *   satisfy the constraint 'never'.
 *
 * For each block, and inside each list and group:
 *
 * - every prop (besides the shared look, id, className, style, ref and
 *   data-*) is a setting or in `appOnly`, so nothing goes missing
 * - every setting and `appOnly` name is a prop (or the field is `forApp`)
 * - each field's type fits the prop: a toggle sets a boolean, a list an
 *   array, a link a string...
 * - a choice's options are exactly the values the prop takes, no more and
 *   no fewer
 * - a `words` field names an export of the package that fits the prop
 * - a prop the block needs is a required setting
 */
import type { BlockRootProps } from './atoms/block';
import type * as ui from './index';
import type { BLOCKS } from './system/registry';
import type { ItemSell, PlanSell, CreditSell } from './system/sell';
import type { BlockLook } from './system/look';
import type { LOOK_SETTINGS } from './system/settings';

/** Keys of every member of a union. */
type KeysOf<T> = T extends unknown ? keyof T : never;
/** The type at a key, across a union's members. */
type At<T, K> = T extends unknown ? (K extends keyof T ? T[K] : never) : never;
type IsUnion<T, U = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : never;
/** Keys that must be given (no `?`). */
type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

type Fields = readonly { name: string; type: string }[];
type Names<F extends Fields> = F[number] extends infer E
  ? E extends { forApp: true }
    ? never
    : E extends { name: infer N }
      ? N
      : never
  : never;

type StringValued =
  'text' | 'longText' | 'link' | 'colour' | 'dateTime' | 'picture';

type Sells = { item: ItemSell; plan: PlanSell; credits: CreditSell };

type Fits<F, T> = F extends { type: StringValued }
  ? [string] extends [T]
    ? true
    : false
  : F extends { type: 'toggle' }
    ? [boolean] extends [T]
      ? true
      : false
    : F extends { type: 'number' }
      ? [number] extends [T]
        ? true
        : false
      : F extends { type: 'choice'; options: readonly (infer O)[] }
        ? F extends { multiple: true }
          ? T extends readonly (infer E)[]
            ? Same<O, E>
            : false
          : Same<O, T>
        : F extends { type: 'list' }
          ? T extends readonly unknown[]
            ? true
            : false
          : F extends { type: 'group' }
            ? T extends object
              ? true
              : false
            : F extends { type: 'words'; from: infer N }
              ? N extends keyof typeof ui
                ? [(typeof ui)[N]] extends [T]
                  ? true
                  : false
                : false
              : F extends { type: 'product'; sells: readonly (infer S)[] }
                ? [S] extends [keyof Sells]
                  ? Same<Sells[S], T>
                  : false
                : false;

/** What's wrong with one field, as messages, or never. */
type FieldProblems<F, T, Path extends string> = F extends {
  name: infer N extends string;
  type: infer Type extends string;
}
  ? F extends { forApp: true }
    ? never
    : | (Fits<F, NonNullable<At<T, N>>> extends true
          ? never
          : `${Path}.${N}: a ${Type} field doesn't fit the prop`)
      | (F extends { type: 'list'; of: infer Of }
          ? NonNullable<At<T, N>> extends readonly (infer E)[]
            ? Fits<{ type: Of }, E> extends true
              ? never
              : `${Path}.${N}: the list's values don't fit`
            : never
          : F extends {
                type: 'list' | 'group';
                fields: infer Inner extends Fields;
              }
            ? ObjectProblems<
                Inner,
                F extends { appOnly: infer A extends readonly string[] }
                  ? A[number]
                  : never,
                F extends { type: 'list' }
                  ? NonNullable<At<T, N>> extends readonly (infer E)[]
                    ? E
                    : never
                  : NonNullable<At<T, N>>,
                `${Path}.${N}`,
                never
              >
            : never)
  : never;

/** What's wrong with a list of fields for an object type, as messages. */
type ObjectProblems<F extends Fields, AppOnly, T, Path extends string, Skip> =
  | {
      [
        K in Exclude<KeysOf<T>, Skip | Names<F> | AppOnly> & string
      ]: `${Path}.${K}: not in settings or appOnly`;
    }[Exclude<KeysOf<T>, Skip | Names<F> | AppOnly> & string]
  | {
      [
        K in Exclude<Names<F> | AppOnly, KeysOf<T>> & string
      ]: `${Path}.${K}: not a prop`;
    }[Exclude<Names<F> | AppOnly, KeysOf<T>> & string]
  | (IsUnion<T> extends true
      ? never
      : {
          [K in Exclude<RequiredKeys<T>, Skip | AppOnly> & string]: Extract<
            F[number],
            { name: K }
          > extends {
            required: true;
          }
            ? never
            : `${Path}.${K}: the block needs it, so it's required`;
        }[Exclude<RequiredKeys<T>, Skip | AppOnly> & string])
  | FieldProblems<F[number], T, Path>;

type Entry = (typeof BLOCKS)[number];
type PropsOf<C> = C extends (props: infer P) => unknown ? P : never;

type BlockProblems<E extends Entry> = ObjectProblems<
  E['settings'],
  E['appOnly'][number],
  PropsOf<(typeof ui)[E['component']]>,
  E['component'],
  keyof BlockRootProps
>;

type EachBlock<E> = E extends Entry ? BlockProblems<E> : never;

type AllProblems =
  | ObjectProblems<typeof LOOK_SETTINGS, never, BlockLook, 'look', never>
  | EachBlock<Entry>;

type NoProblems<T extends never> = T;

/** Fails to type-check, naming each problem, when settings and props disagree. */
export type BlockSettingsCheck = NoProblems<AllProblems>;
