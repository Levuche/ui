import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import {
  LinkList,
  NewsletterBand,
  useBlockActions,
  type BlockAction,
} from '../src';

/*
 * Tracking: one useBlockActions on the page reports every press, as the app
 * would forward it to BuildBase tracking. Here the "app" lists what it got,
 * so a test can check each press is reported once, with its block.
 */

function Page() {
  const root = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<BlockAction[]>([]);
  useBlockActions((action) => setSeen((all) => [...all, action]), root);
  // The test runs inside this page, so a link must not leave it: the click
  // is still reported, but the browser doesn't follow it.
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
      <LinkList
        label="Links"
        links={[{ label: 'Read the guide', href: '#guide' }]}
      />
      <NewsletterBand
        title="One origin story every Friday"
        onSubmit={(event) => event.preventDefault()}
      />
      <output aria-label="Reported" className="font-mono text-xs">
        {JSON.stringify(seen.map(({ action, block }) => ({ action, block })))}
      </output>
    </div>
  );
}

function reported(canvas: { getByLabelText: (t: string) => HTMLElement }) {
  return JSON.parse(canvas.getByLabelText('Reported').textContent ?? '[]');
}

const meta = {
  title: 'Blocks/Tracking',
  component: Page,
  tags: ['autodocs'],
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A link and a sign-up are each reported once, named by their block. */
export const OncePerPress: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Read the guide' }));
    await waitFor(() =>
      expect(reported(canvas)).toEqual([
        { action: 'link_click', block: 'link-list' },
      ])
    );

    // Typing in the box and pressing the submit button is one sign-up.
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Email' }),
      'reader@example.com'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }));
    await waitFor(() =>
      expect(reported(canvas)).toEqual([
        { action: 'link_click', block: 'link-list' },
        { action: 'form_submit', block: 'newsletter-band' },
      ])
    );
  },
};
