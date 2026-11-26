'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import {
  SiteButton,
  SiteLinkButton,
  type SiteButtonVariant,
} from '../atoms/button';
import { LockIcon } from '../atoms/icons';
import { SiteDialog } from '../molecules/dialog';
import { Field } from '../molecules/field';
import { FormNotice } from '../molecules/form-notice';
import { isSafeHref, type LinkBehavior } from '../system/href';
import { usePreviewMode } from '../system/preview-mode';
import type { FormStatus } from '../system/state';
import { WORDS_EN } from '../system/words/en';
import { usePageWords } from '../system/page-words';

/**
 * What stands before the link: a `code` the visitor types, an `age` they
 * confirm, or a `warning` they read first.
 */
export type LockMode = 'code' | 'age' | 'warning';

export type LockedLinkLabels = {
  code: string;
  unlock: string;
  wrongCode: ReactNode;
  /** {age} is filled in. */
  ageQuestion: string;
  ageYes: string;
  ageNo: string;
  /** {age} is filled in. */
  ageDenied: string;
  warningTitle: string;
  continue: string;
  cancel: string;
  open: string;
  close: string;
};

export const LOCKED_LINK_LABELS: LockedLinkLabels = WORDS_EN.lockedLink;

/**
 * Checks a code on the server and answers the link's address, or nothing
 * when the code is wrong. Pass a server action, so the address reaches the
 * page only after the right code.
 */
export type UnlockLink = (code: string) => Promise<string | null | undefined>;

const noSubscribe = () => () => {};

const fill = (text: string, age: number) => text.replace('{age}', String(age));

const read = (key: string) => {
  try {
    return sessionStorage.getItem(key) === 'ok';
  } catch {
    return false;
  }
};
const remember = (key: string) => {
  try {
    sessionStorage.setItem(key, 'ok');
  } catch {
    /* Private windows may refuse; the visitor is just asked again. */
  }
};

/**
 * A link behind a code, an age check or a warning. The button opens a dialog
 * that keeps focus inside and gives it back on close.
 *
 * - `code`: the visitor types a code and `unlock` checks it on the server.
 *   The address isn't in the page until the code is right.
 * - `age` and `warning`: `href` is in the page; the answer is remembered
 *   until the tab is closed, so the visitor isn't asked twice.
 */
export function LockedLink({
  label,
  mode,
  href,
  unlock,
  minAge = 18,
  message,
  labels,
  rememberAs,
  buttonVariant,
  newTab,
  sponsored,
  nofollow,
  onUnlock,
  ...root
}: BlockRootProps &
  LinkBehavior & {
    /** The button's words, such as "Early access: the reel pack". */
    label: ReactNode;
    mode: LockMode;
    /** Where an `age` or `warning` link goes. Not used with `code`. */
    href?: string;
    /** For `code`: the server's check. */
    unlock?: UnlockLink;
    minAge?: number;
    /** For `warning`: what the visitor should know first. */
    message?: ReactNode;
    labels?: Partial<LockedLinkLabels>;
    /** Where the answer is kept for the visit. Defaults to `href`. */
    rememberAs?: string;
    buttonVariant?: SiteButtonVariant;
    onUnlock?: () => void;
  }) {
  const words = usePageWords('lockedLink', labels);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const key = `levuche-lock:${rememberAs ?? href ?? ''}`;
  const [passed, setPassed] = useState(false);
  const [denied, setDenied] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [opened, setOpened] = useState<string | null>(null);
  const preview = usePreviewMode();

  // Asked already in this tab? Read after hydration, so server and browser agree.
  const askedBefore = useSyncExternalStore(
    noSubscribe,
    () => mode !== 'code' && read(key),
    () => false
  );

  // The button the visitor pressed is swapped for the link once they pass,
  // so focus goes to the link rather than to the page.
  const unlocked = useRef<HTMLElement>(null);
  const focusLink = useRef(false);
  useEffect(() => {
    if (!passed || !focusLink.current) return;
    focusLink.current = false;
    unlocked.current?.querySelector('a')?.focus();
  }, [passed]);

  const link = { newTab, sponsored, nofollow };
  const target = mode === 'code' ? opened : isSafeHref(href) ? href : null;

  if (mode !== 'code' && (passed || askedBefore) && target) {
    return (
      <Block name="locked-link" ref={unlocked} {...root}>
        <SiteLinkButton
          href={target}
          {...link}
          variant={buttonVariant}
          action="link_click"
          fullWidth
        >
          {label}
        </SiteLinkButton>
      </Block>
    );
  }

  const close = () => {
    dialog.current?.close();
  };
  const pass = () => {
    remember(key);
    focusLink.current = true;
    setPassed(true);
    onUnlock?.();
    close();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '');
    if (!unlock || !code.trim()) return;
    setStatus('sending');
    try {
      const answer = await unlock(code.trim());
      if (isSafeHref(answer)) {
        setOpened(answer);
        setStatus('idle');
        onUnlock?.();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <Block name="locked-link" data-lock={mode} {...root}>
      <SiteButton
        ref={trigger}
        variant={buttonVariant}
        icon={<LockIcon size={18} />}
        action="lock_open"
        aria-haspopup="dialog"
        fullWidth
        onClick={() => {
          // The page editor selects the block; nothing opens.
          if (preview) return;
          setDenied(false);
          dialog.current?.showModal();
        }}
      >
        {label}
      </SiteButton>
      <SiteDialog
        ref={dialog}
        title={
          mode === 'age'
            ? fill(words.ageQuestion, minAge)
            : mode === 'warning'
              ? words.warningTitle
              : label
        }
        onClose={() => trigger.current?.focus()}
      >
        {mode === 'code' && opened ? (
          <SiteLinkButton
            href={opened}
            {...link}
            variant={buttonVariant}
            action="lock_continue"
            fullWidth
            onClick={close}
          >
            {words.open}
          </SiteLinkButton>
        ) : null}

        {mode === 'code' && !opened ? (
          <form
            onSubmit={submit}
            data-action="lock_unlock"
            className="flex flex-col gap-3"
          >
            <Field
              label={words.code}
              name="code"
              autoComplete="off"
              required
              readOnly={status === 'sending'}
            />
            <SiteButton
              type="submit"
              variant={buttonVariant}
              loading={status === 'sending'}
              action="lock_unlock"
              fullWidth
            >
              {words.unlock}
            </SiteButton>
            <FormNotice status={status} error={words.wrongCode} />
          </form>
        ) : null}

        {mode === 'age' ? (
          denied ? (
            <p role="status" className="m-0">
              {fill(words.ageDenied, minAge)}
            </p>
          ) : target ? (
            <div className="flex flex-col gap-2">
              <SiteLinkButton
                href={target}
                {...link}
                variant={buttonVariant}
                action="lock_continue"
                fullWidth
                onClick={pass}
              >
                {words.ageYes}
              </SiteLinkButton>
              <SiteButton
                variant="outline"
                fullWidth
                action="lock_cancel"
                onClick={() => {
                  setDenied(true);
                  // The answer buttons go; keep focus in the dialog.
                  requestAnimationFrame(() => closeButton.current?.focus());
                }}
              >
                {words.ageNo}
              </SiteButton>
            </div>
          ) : null
        ) : null}

        {mode === 'warning' && target ? (
          <>
            {message ? <div className="text-site-text-2">{message}</div> : null}
            <SiteLinkButton
              href={target}
              {...link}
              variant={buttonVariant}
              action="lock_continue"
              fullWidth
              onClick={pass}
            >
              {words.continue}
            </SiteLinkButton>
          </>
        ) : null}

        <SiteButton
          ref={closeButton}
          variant="text"
          action="lock_cancel"
          fullWidth
          onClick={close}
        >
          {mode === 'warning' ? words.cancel : words.close}
        </SiteButton>
      </SiteDialog>
    </Block>
  );
}
