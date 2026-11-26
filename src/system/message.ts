/*
 * Links that open a chat with the creator, with a message ready to send:
 * WhatsApp, Telegram, a text (SMS), email and Messenger.
 *
 * What a creator types is checked strictly before it goes into a link. A
 * phone number becomes digits only, a username keeps only the characters the
 * service allows, and an email address only plain address characters, so
 * nothing they type can add a scheme, a host, a path or another address (as
 * "?bcc=" in an email). The message and subject are always URL-encoded.
 *
 * Plain functions only, so they run on a server, in a browser or in a test.
 */

/** The services a message card can open. */
export const MESSAGE_CHANNELS = [
  'whatsapp',
  'telegram',
  'sms',
  'email',
  'messenger',
] as const;
export type MessageChannel = (typeof MESSAGE_CHANNELS)[number];

/** The longest message, in characters; longer ones are cut. */
export const MESSAGE_MAX_LENGTH = 1000;
/** The longest email subject, in characters. */
export const SUBJECT_MAX_LENGTH = 200;

/** True when `value` is one of MESSAGE_CHANNELS. */
export function isMessageChannel(value: unknown): value is MessageChannel {
  return MESSAGE_CHANNELS.includes(value as MessageChannel);
}

/**
 * A phone number as digits only, with its country code and no "+", as
 * "919876543210"; null when it isn't one. Spaces, dashes, dots and brackets
 * are dropped, and a "+" or "00" in front is read as the international
 * prefix. Anything else (letters, "?", "#", "/", "@", digits from another
 * script) means it isn't a phone number.
 */
export function cleanPhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\+?[0-9 ().-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/[^0-9]/g, '').replace(/^00/, '');
  // E.164: at most 15 digits. Fewer than 7 is no full number anywhere.
  return /^[0-9]{7,15}$/.test(digits) ? digits : null;
}

/**
 * A Telegram username, as "asha_menon": 5 to 32 letters, digits and
 * underscores, starting with a letter and not ending with an underscore. An
 * "@" in front, or a pasted t.me link, is fine.
 */
export function cleanTelegram(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value
    .trim()
    .replace(/^(https?:\/\/)?(t\.me|telegram\.me)\//i, '')
    .replace(/^@/, '');
  return /^[A-Za-z][A-Za-z0-9_]{3,30}[A-Za-z0-9]$/.test(name) ? name : null;
}

/**
 * A Messenger username or page id, as "desi.origins": 5 to 50 letters,
 * digits and dots, with no dot at either end or two together. A pasted m.me
 * link is fine.
 */
export function cleanMessenger(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value
    .trim()
    .replace(/^(https?:\/\/)?m\.me\//i, '')
    .replace(/^@/, '');
  return /^[A-Za-z0-9](?:[A-Za-z0-9]|\.(?!\.)){3,48}[A-Za-z0-9]$/.test(name)
    ? name
    : null;
}

/**
 * An email address, lower-cased in its domain, as "hello@example.com". Only
 * letters, digits and . _ + - before the "@" and a plain domain after it,
 * so it can't carry a second address, a header or a query.
 */
export function cleanEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const address = value.trim();
  if (address.length > 254) return null;
  const match =
    /^([A-Za-z0-9_+-]+(?:\.[A-Za-z0-9_+-]+)*)@((?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59}))$/.exec(
      address
    );
  if (!match || match[1].length > 64) return null;
  return `${match[1]}@${match[2].toLowerCase()}`;
}

/**
 * Where a message goes on a channel, checked: digits for WhatsApp and texts,
 * a username (or a "+" phone number) for Telegram, a username for Messenger
 * and an address for email. Null when it isn't valid there.
 */
export function cleanMessageTarget(
  channel: MessageChannel,
  to: unknown
): string | null {
  switch (channel) {
    case 'whatsapp':
    case 'sms':
      return cleanPhone(to);
    case 'telegram': {
      // Telegram opens a chat by phone number too, written with its "+".
      if (typeof to === 'string' && to.trim().startsWith('+')) {
        const phone = cleanPhone(to);
        return phone ? `+${phone}` : null;
      }
      return cleanTelegram(to);
    }
    case 'messenger':
      return cleanMessenger(to);
    case 'email':
      return cleanEmail(to);
    default:
      return null;
  }
}

/**
 * Text that's safe to encode: no control characters but new lines and tabs,
 * no half emoji (a lone surrogate, which encodeURIComponent throws on), cut
 * to `max` characters without splitting one.
 */
export function cleanMessageText(value: unknown, max = MESSAGE_MAX_LENGTH) {
  if (typeof value !== 'string') return '';
  const text = value
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex -- these are what it removes
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .replace(
      /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g,
      '�'
    );
  return Array.from(text).slice(0, max).join('');
}

/** URL-encoded text; email asks for CRLF line ends (RFC 6068). */
const encode = (text: string, crlf = false) =>
  encodeURIComponent(crlf ? text.replace(/\n/g, '\r\n') : text);

/** What a message link is made from. */
export type MessageLinkInput = {
  channel: MessageChannel;
  /** A phone number with its country code, a username or an email address. */
  to: unknown;
  /** The ready-made message. */
  message?: unknown;
  /** Email only: the subject line. */
  subject?: unknown;
};

/**
 * The link that opens a chat with `to` on `channel`, with the message filled
 * in, or null when `to` isn't valid there:
 *
 * - whatsapp: https://wa.me/919876543210?text=Hi
 * - telegram: https://t.me/asha_menon?text=Hi
 * - sms: sms:+919876543210?&body=Hi (the "?&" works on both iPhone and Android)
 * - email: mailto:hello@example.com?subject=Stay&body=Hi
 * - messenger: https://m.me/desi.origins?text=Hi
 */
export function messageHref({
  channel,
  to,
  message,
  subject,
}: MessageLinkInput): string | null {
  if (!isMessageChannel(channel)) return null;
  const target = cleanMessageTarget(channel, to);
  if (!target) return null;
  const text = cleanMessageText(message);
  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/${target}${text ? `?text=${encode(text)}` : ''}`;
    case 'telegram':
      return `https://t.me/${target}${text ? `?text=${encode(text)}` : ''}`;
    case 'messenger':
      return `https://m.me/${target}${text ? `?text=${encode(text)}` : ''}`;
    case 'sms':
      return `sms:+${target}${text ? `?&body=${encode(text)}` : ''}`;
    case 'email': {
      const title = cleanMessageText(subject, SUBJECT_MAX_LENGTH).replace(
        /\s+/g,
        ' '
      );
      const query = [
        title.trim() && `subject=${encode(title.trim())}`,
        text && `body=${encode(text, true)}`,
      ].filter(Boolean);
      return `mailto:${target}${query.length ? `?${query.join('&')}` : ''}`;
    }
  }
}

/** How the checked target is shown on the card, as "+919876543210" or "@asha". */
export function messageTargetText(channel: MessageChannel, to: unknown) {
  const target = cleanMessageTarget(channel, to);
  if (!target) return null;
  if (channel === 'whatsapp' || channel === 'sms') return `+${target}`;
  if (channel === 'telegram' && !target.startsWith('+')) return `@${target}`;
  return target;
}

/*
 * Keeping a number or address out of the plain page source: the page holds
 * it reversed and base64-encoded, and the browser turns it back once the page
 * runs. That stops scrapers that read the HTML for numbers and addresses; it
 * isn't encryption, and the address is checked again when it's read back.
 * The text is ASCII here, since only checked targets are hidden.
 */
const reverse = (text: string) => Array.from(text).reverse().join('');

/** `text` (ASCII) in the form the page holds it. */
export function hideText(text: string) {
  return btoa(reverse(text));
}

/** The text hideText hid, or null when `hidden` isn't such text. */
export function revealText(hidden: unknown): string | null {
  if (typeof hidden !== 'string') return null;
  try {
    return reverse(atob(hidden));
  } catch {
    return null;
  }
}
