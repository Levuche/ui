import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { MessageCard, useBlockActions, type BlockAction } from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/*
 * A card that opens a chat with the creator, with a message ready to send.
 * The number or address isn't in the page's HTML: it's shown, and the
 * button links, once the page runs (as here in Storybook).
 */
const meta = {
  title: 'Blocks/Message card',
  component: MessageCard,
  tags: ['autodocs'],
  args: {
    channel: 'whatsapp',
    name: 'Desi Origins',
    picture: null,
    detail: 'Usually replies within an hour',
    to: '+91 98765 43210',
    message: 'Hi! 👋 I’d like a quote for a custom print.',
  },
} satisfies Meta<typeof MessageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** WhatsApp: the number, the message in a bubble and a button to send it. */
export const WhatsApp: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: 'Message on WhatsApp' });
    await expect(button).toHaveAttribute(
      'href',
      'https://wa.me/919876543210?text=Hi!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20a%20quote%20for%20a%20custom%20print.'
    );
    await expect(button).toHaveAttribute('target', '_blank');
    await expect(button).toHaveAttribute('data-action', 'contact');
    await expectTapSize(button, 'Message on WhatsApp');
    await expect(canvas.getByText('+919876543210')).toBeVisible();
    await expect(
      canvas.getByText(/I’d like a quote for a custom print/)
    ).toBeVisible();
    await expect(
      canvas.getByRole('heading', { name: 'Desi Origins' })
    ).toBeVisible();
  },
};

/** Telegram, by username. */
export const Telegram: Story = {
  args: { channel: 'telegram', to: '@desi_origins', message: 'Hi! 👋' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: 'Message on Telegram' });
    await expect(button).toHaveAttribute(
      'href',
      'https://t.me/desi_origins?text=Hi!%20%F0%9F%91%8B'
    );
    await expect(canvas.getByText('@desi_origins')).toBeVisible();
  },
};

/** A text message, opening the phone's messages app. */
export const Text: Story = {
  args: { channel: 'sms', to: '+1 (555) 010-0199', message: 'Quote request' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: 'Send a text' });
    await expect(button).toHaveAttribute(
      'href',
      'sms:+15550100199?&body=Quote%20request'
    );
    await expect(button).not.toHaveAttribute('target');
  },
};

/** Email, with a subject and a body over several lines. */
export const Email: Story = {
  args: {
    channel: 'email',
    name: 'Hill View Homestay',
    detail: 'Two rooms, breakfast included',
    to: 'stay@example.com',
    subject: 'Stay request',
    message: 'Hi! I’d like to stay.\nCheck-in: \nCheck-out: \nGuests: ',
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('link', { name: 'Send an email' });
    const href = button.getAttribute('href') ?? '';
    await expect(href).toMatch(/^mailto:stay@example\.com\?/);
    const query = new URLSearchParams(href.split('?')[1]);
    await expect(query.get('subject')).toBe('Stay request');
    await expect(query.get('body')).toBe(
      'Hi! I’d like to stay.\r\nCheck-in: \r\nCheck-out: \r\nGuests: '
    );
    await expect(canvas.getByText('stay@example.com')).toBeVisible();
  },
};

/** Messenger, by username. */
export const Messenger: Story = {
  args: { channel: 'messenger', to: 'desi.origins', message: 'Hi!' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Message on Messenger' })
    ).toHaveAttribute('href', 'https://m.me/desi.origins?text=Hi!');
  },
};

/** The visitor changes the message before sending; the link follows. */
export const VisitorEditsTheMessage: Story = {
  args: { editable: true, message: 'Hi! 👋' },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('textbox', { name: 'Your message' });
    await expect(box).toHaveValue('Hi! 👋');
    await expect(
      canvas.getByText('Change it if you like, then send.')
    ).toBeVisible();
    await userEvent.clear(box);
    await userEvent.type(box, 'Price for 3 prints & a frame?');
    await expect(
      canvas.getByRole('link', { name: 'Message on WhatsApp' })
    ).toHaveAttribute(
      'href',
      'https://wa.me/919876543210?text=Price%20for%203%20prints%20%26%20a%20frame%3F'
    );
  },
};

/** The creator's own words, for the button and everything else. */
export const OwnWords: Story = {
  args: {
    editable: true,
    showTarget: false,
    buttonLabel: 'Get a quote',
    labels: { message: 'What do you need?', hint: 'We reply the same day.' },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Get a quote' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('textbox', { name: 'What do you need?' })
    ).toBeVisible();
    await expect(canvas.getByText('We reply the same day.')).toBeVisible();
    await expect(canvas.queryByText('+919876543210')).toBeNull();
  },
};

/** The bubble is named for screen readers, in the creator's words too. */
export const BubbleLabel: Story = {
  args: { labels: { preview: 'Message we’ll send' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Message we’ll send:')).toHaveClass(
      'sr-only'
    );
  },
};

/** A number that isn't valid gives no link, rather than a broken one. */
export const NotANumber: Story = {
  args: { to: 'javascript:alert(1)' },
  play: async ({ canvasElement, canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(
      canvasElement.querySelector('[data-unsafe-link]')
    ).toHaveTextContent('Message on WhatsApp');
  },
};

/** A full row (2x1): the message and button sit beside the name. */
export const FullRow: Story = {
  globals: onScreen('desktop'),
  parameters: { frame: 'wide' },
  play: async ({ canvas }) => {
    const name = canvas.getByRole('heading', { name: 'Desi Origins' });
    const button = canvas.getByRole('link', { name: 'Message on WhatsApp' });
    const head = name.getBoundingClientRect();
    const send = button.getBoundingClientRect();
    await expect(send.top).toBeLessThan(head.bottom + 80);
    await expect(Math.abs(send.left - head.left)).toBeGreaterThan(100);
  },
};

/** Half a row (1x1): stacked, the button under the name. */
export const HalfRow: Story = {
  globals: onScreen('phone'),
  render: (args) => (
    <div className="max-w-80">
      <MessageCard {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const name = canvas.getByRole('heading', { name: 'Desi Origins' });
    const button = canvas.getByRole('link', { name: 'Message on WhatsApp' });
    await expect(button.getBoundingClientRect().top).toBeGreaterThan(
      name.getBoundingClientRect().bottom
    );
  },
};

/** In the page's dark scheme. */
export const Dark: Story = {
  globals: { theme: 'dark' },
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector<HTMLElement>(
      '[data-testid="story-theme"]'
    )!;
    await expect(page).toHaveAttribute('data-site', 'dark');
  },
};

function Tracked() {
  const root = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<BlockAction[]>([]);
  useBlockActions((action) => setSeen((all) => [...all, action]), root);
  // Report the press, but stay on the page.
  useEffect(() => {
    const node = root.current;
    const stay = (event: MouseEvent) => {
      if ((event.target as Element).closest('a')) event.preventDefault();
    };
    node?.addEventListener('click', stay);
    return () => node?.removeEventListener('click', stay);
  }, []);
  return (
    <div ref={root} className="flex flex-col gap-4">
      <MessageCard
        channel="whatsapp"
        name="Desi Origins"
        to="+91 98765 43210"
        message="Hi! My order number is 1234."
      />
      <output aria-label="Reported" className="font-mono text-xs">
        {JSON.stringify(
          seen.map(({ action, block, href }) => ({ action, block, href }))
        )}
      </output>
    </div>
  );
}

/** A press is reported to tracking as a contact, without the message. */
export const ReportedAsContact: Story = {
  render: () => <Tracked />,
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('link', { name: 'Message on WhatsApp' })
    );
    await waitFor(() =>
      expect(
        JSON.parse(canvas.getByLabelText('Reported').textContent ?? '[]')
      ).toEqual([
        {
          action: 'contact',
          block: 'message-card',
          href: 'https://wa.me/919876543210',
        },
      ])
    );
  },
};
