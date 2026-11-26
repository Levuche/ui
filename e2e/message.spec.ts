import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  cleanEmail,
  cleanMessageTarget,
  cleanMessageText,
  cleanPhone,
  hideText,
  isSafeHref,
  linkAttrs,
  MESSAGE_CHANNELS,
  MessageCard,
  MESSAGE_MAX_LENGTH,
  messageHref,
  messageTargetText,
  revealText,
  type MessageChannel,
} from '../src';

/*
 * Message links (MessageCard): each channel's link, with the message encoded,
 * and nothing a creator or visitor types able to change where it goes.
 */

test('each channel builds its own link with the message encoded', () => {
  expect(
    messageHref({
      channel: 'whatsapp',
      to: '+91 98765-43210',
      message: 'Hi! 👋 Quote request',
    })
  ).toBe(
    'https://wa.me/919876543210?text=Hi!%20%F0%9F%91%8B%20Quote%20request'
  );
  expect(
    messageHref({ channel: 'telegram', to: '@asha_menon', message: 'Hi & bye' })
  ).toBe('https://t.me/asha_menon?text=Hi%20%26%20bye');
  expect(
    messageHref({ channel: 'telegram', to: 'https://t.me/asha_menon' })
  ).toBe('https://t.me/asha_menon');
  expect(messageHref({ channel: 'telegram', to: '+44 7700 900123' })).toBe(
    'https://t.me/+447700900123'
  );
  expect(
    messageHref({ channel: 'sms', to: '(555) 010-0199 0', message: 'Hi?' })
  ).toBe('sms:+55501001990?&body=Hi%3F');
  expect(
    messageHref({
      channel: 'messenger',
      to: 'm.me/desi.origins',
      message: 'Hi',
    })
  ).toBe('https://m.me/desi.origins?text=Hi');
  expect(
    messageHref({
      channel: 'email',
      to: 'Stay@Example.COM',
      subject: 'Stay request',
      message: 'Check-in: 12 Dec\nCheck-out: 15 Dec',
    })
  ).toBe(
    'mailto:Stay@example.com?subject=Stay%20request&body=Check-in%3A%2012%20Dec%0D%0ACheck-out%3A%2015%20Dec'
  );
  // No message, no query.
  expect(messageHref({ channel: 'whatsapp', to: '0091 98765 43210' })).toBe(
    'https://wa.me/919876543210'
  );
  expect(messageHref({ channel: 'email', to: 'hi@example.com' })).toBe(
    'mailto:hi@example.com'
  );
});

test('every link it builds is a safe link to the channel’s own address', () => {
  const hosts: Partial<Record<MessageChannel, string>> = {
    whatsapp: 'wa.me',
    telegram: 't.me',
    messenger: 'm.me',
  };
  const targets: Record<MessageChannel, string> = {
    whatsapp: '+919876543210',
    telegram: 'asha_menon',
    sms: '+919876543210',
    email: 'hello@example.com',
    messenger: 'desi.origins',
  };
  const hostile = [
    'javascript:alert(1)',
    '#x?y&z=1 //evil.example/@evil',
    '\u0000‮\r\nBcc: evil@evil.example',
    '"><script>alert(1)</script>',
  ];
  for (const channel of MESSAGE_CHANNELS) {
    for (const message of hostile) {
      const href = messageHref({
        channel,
        to: targets[channel],
        message,
        subject: message,
      });
      expect(isSafeHref(href), `${channel}: ${href}`).toBe(true);
      expect(href, channel).not.toMatch(/[\s<>"]/);
      const url = new URL(href!);
      const host = hosts[channel];
      if (host) {
        expect(url.protocol).toBe('https:');
        expect(url.host).toBe(host);
        expect(url.hash).toBe('');
        // The message comes back exactly, less the control characters.
        expect(url.searchParams.get('text')).toBe(cleanMessageText(message));
        expect([...url.searchParams.keys()]).toEqual(['text']);
      } else if (channel === 'sms') {
        expect(href).toMatch(/^sms:\+919876543210\?&body=[^&#]*$/);
      } else {
        expect(href).toMatch(
          /^mailto:hello@example\.com\?subject=[^&#]*&body=[^&#]*$/
        );
      }
    }
  }
});

test('phone numbers are digits only', () => {
  expect(cleanPhone('+91 (98765) 43.210')).toBe('919876543210');
  for (const bad of [
    'javascript:alert(1)',
    '+1 555 0100?text=hi',
    '+1 555 0100#x',
    '123@evil.example',
    '//evil.example/12345678',
    '+1 555 0100\u0000',
    '１２３４５６７８', // digits from another script
    '+91 98765+43210',
    '12345', // too short
    '1234567890123456', // longer than E.164 allows
    'call me',
    '',
    null,
    42,
  ]) {
    expect(cleanPhone(bad), String(bad)).toBeNull();
    expect(
      messageHref({ channel: 'whatsapp', to: bad }),
      String(bad)
    ).toBeNull();
    expect(messageHref({ channel: 'sms', to: bad }), String(bad)).toBeNull();
  }
});

test('usernames keep to each service’s characters', () => {
  for (const bad of [
    'evil.example/path',
    'name?text=x',
    'asha menon',
    'asha#x',
    '../../evil',
    'https://evil.example/asha_menon',
    '_asha',
    'asha_',
    'abc', // too short
    '@@asha_menon',
    'javascript:alert(1)',
  ]) {
    expect(cleanMessageTarget('telegram', bad), bad).toBeNull();
  }
  expect(cleanMessageTarget('telegram', '@Asha_Menon')).toBe('Asha_Menon');
  for (const bad of [
    'desi..origins',
    '.desi.origins',
    'desi.origins.',
    'desi/origins',
    'desi_origins',
    'desi origins',
    'https://evil.example/desi.origins',
    'abc',
  ]) {
    expect(cleanMessageTarget('messenger', bad), bad).toBeNull();
  }
  expect(cleanMessageTarget('messenger', '100064512345')).toBe('100064512345');
});

test('an email address can’t carry a second address, a header or a query', () => {
  for (const bad of [
    'a@b.example?bcc=evil@evil.example',
    'a@b.example&cc=evil@evil.example',
    'a@b.example,evil@evil.example',
    'a@b.example;evil@evil.example',
    'a@b.example\r\nBcc: evil@evil.example',
    'a%40b@evil.example',
    '"a b"@example.com',
    '<script>@example.com',
    'a@localhost',
    'a@b..example',
    'a..b@example.com',
    'javascript:alert(1)//@example.com',
    'mailto:a@example.com',
    'a@-example.com',
    `${'a'.repeat(65)}@example.com`,
  ]) {
    expect(cleanEmail(bad), bad).toBeNull();
    expect(messageHref({ channel: 'email', to: bad }), bad).toBeNull();
  }
  expect(cleanEmail(' First.Last+tag@Mail.Example.co.in ')).toBe(
    'First.Last+tag@mail.example.co.in'
  );
  expect(cleanEmail('a@xn--80ak6aa92e.xn--p1ai')).toBe(
    'a@xn--80ak6aa92e.xn--p1ai'
  );
});

test('a message is cut to its length, never splitting an emoji', () => {
  const long = '👋'.repeat(MESSAGE_MAX_LENGTH + 10);
  expect(Array.from(cleanMessageText(long))).toHaveLength(MESSAGE_MAX_LENGTH);
  // A lone half of an emoji would make encodeURIComponent throw.
  const href = messageHref({
    channel: 'whatsapp',
    to: '919876543210',
    message: 'a\ud83db\udc4bc',
  });
  expect(new URL(href!).searchParams.get('text')).toBe('a�b�c');
  expect(cleanMessageText('a\r\nb\u0007\tc')).toBe('a\nb\tc');
  expect(cleanMessageText(undefined)).toBe('');
});

test('an unknown channel gives no link', () => {
  expect(
    messageHref({
      channel: 'javascript' as MessageChannel,
      to: '919876543210',
    })
  ).toBeNull();
});

test('the card shows the number or handle as people write it', () => {
  expect(messageTargetText('whatsapp', '91 98765 43210')).toBe('+919876543210');
  expect(messageTargetText('telegram', 'asha_menon')).toBe('@asha_menon');
  expect(messageTargetText('telegram', '+44 7700 900123')).toBe(
    '+447700900123'
  );
  expect(messageTargetText('email', 'hi@example.com')).toBe('hi@example.com');
  expect(messageTargetText('sms', 'not a number')).toBeNull();
});

test('a hidden number is not in the text, and comes back the same', () => {
  for (const value of ['919876543210', 'hello@example.com', '+447700900123']) {
    const hidden = hideText(value);
    expect(hidden).not.toContain(value);
    expect(hidden).not.toMatch(/@|[0-9]{7,}/);
    expect(revealText(hidden)).toBe(value);
  }
  expect(revealText('not base64!')).toBeNull();
  expect(revealText(undefined)).toBeNull();
});

test('message links open other apps safely', () => {
  expect(
    linkAttrs(messageHref({ channel: 'whatsapp', to: '919876543210' }))
  ).toEqual({
    href: 'https://wa.me/919876543210',
    target: '_blank',
    rel: 'noopener noreferrer',
  });
  expect(
    linkAttrs(messageHref({ channel: 'email', to: 'hi@example.com' }))
  ).toEqual({ href: 'mailto:hi@example.com' });
});

test('the number and address stay out of the server’s HTML', () => {
  for (const [channel, to] of [
    ['whatsapp', '+91 98765 43210'],
    ['sms', '+91 98765 43210'],
    ['email', 'stay@example.com'],
  ] as const) {
    const html = renderToString(
      createElement(MessageCard, {
        channel,
        name: 'Desi Origins',
        to,
        message: 'Hi!',
      })
    );
    expect(html, channel).not.toContain('9876543210');
    expect(html, channel).not.toContain('98765');
    expect(html, channel).not.toContain('stay@example.com');
    expect(html, channel).not.toContain('href=');
    expect(html, channel).toContain('Hi!');
  }
  // Asked to, it's in the HTML, and the link works without JavaScript.
  const plain = renderToString(
    createElement(MessageCard, {
      channel: 'whatsapp',
      name: 'Desi Origins',
      to: '+91 98765 43210',
      message: 'Hi!',
      hideFromSource: false,
    })
  );
  expect(plain).toContain('href="https://wa.me/919876543210?text=Hi!"');
  expect(plain).toContain('+919876543210');
});
