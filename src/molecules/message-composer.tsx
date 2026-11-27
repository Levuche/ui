'use client';

import { useState, type ReactNode } from 'react';
import { siteButtonClasses, type SiteButtonVariant } from '../atoms/button';
import { cn } from '../system/cn';
import { editable, type EditPaths } from '../system/edit';
import { linkAttrs } from '../system/href';
import { useHydrated } from '../system/locale';
import {
  MESSAGE_MAX_LENGTH,
  messageHref,
  revealText,
  type MessageChannel,
} from '../system/message';
import { Field } from './field';

/**
 * Text kept out of the page's HTML: `text` as hideText left it, shown once
 * the page runs. Without `hidden`, `text` as it is.
 */
export function HiddenText({
  text,
  hidden = false,
}: {
  text: string;
  hidden?: boolean;
}) {
  const hydrated = useHydrated();
  if (!hidden) return text;
  return hydrated ? revealText(text) : null;
}

/**
 * The button that opens a chat with the message filled in, and, when the
 * visitor may change the message, the box to change it in. `to` is a
 * checked target (see cleanMessageTarget), hidden with hideText when
 * `hidden`: the link then appears only once the page runs, so the number or
 * address is never in the HTML. It's checked again when it's read back.
 */
export function MessageComposer({
  channel,
  to,
  hidden = false,
  message = '',
  subject,
  editable: changeable = false,
  fieldLabel,
  hint,
  button,
  buttonVariant,
  icon,
  edit = {},
}: {
  channel: MessageChannel;
  /** Null when the creator's number or address isn't valid: no link. */
  to: string | null;
  hidden?: boolean;
  message?: string;
  subject?: string;
  editable?: boolean;
  fieldLabel: ReactNode;
  hint?: ReactNode;
  button: ReactNode;
  buttonVariant?: SiteButtonVariant;
  icon?: ReactNode;
  /** The message's setting path, for edit mode (see edit.ts). */
  edit?: EditPaths<'message'>;
}) {
  const hydrated = useHydrated();
  const [text, setText] = useState(message);
  // A new `message` (the creator editing it) replaces what's typed.
  const [shown, setShown] = useState(message);
  if (shown !== message) {
    setShown(message);
    setText(message);
  }
  const target = to && hidden ? (hydrated ? revealText(to) : null) : to;
  const attrs = linkAttrs(
    target ? messageHref({ channel, to: target, message: text, subject }) : null
  );
  const classes = siteButtonClasses({
    variant: buttonVariant,
    fullWidth: true,
  });
  const field = changeable ? (
    <Field
      label={fieldLabel}
      hint={hint}
      name="message"
      multiline
      rows={3}
      maxLength={MESSAGE_MAX_LENGTH}
      value={text}
      onChange={(event) => setText(event.target.value)}
    />
  ) : null;
  return (
    <>
      {field && edit.message ? (
        // Marks the box's words; the label and hint keep their own marks.
        <div {...editable(edit.message, 'longText')}>{field}</div>
      ) : (
        field
      )}
      {attrs ? (
        // The message is the visitor's: tracking gets the link without it.
        <a
          {...attrs}
          data-action="contact"
          data-href-private=""
          className={classes}
        >
          {icon}
          {button}
        </a>
      ) : (
        // No link yet while the page starts, or none at all when the
        // creator's number or address isn't valid.
        <span
          className={cn(classes, 'cursor-default hover:opacity-100')}
          data-unsafe-link={to ? undefined : ''}
        >
          {icon}
          {button}
        </span>
      )}
    </>
  );
}
