import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent } from 'react';
import { expect, fn, within } from 'storybook/test';
import { NewsletterBand } from '../src';
import { expectTapSize } from './expect-tap-size';

const meta = {
  title: 'Blocks/Newsletter',
  component: NewsletterBand,
  tags: ['autodocs'],
  args: {
    title: 'One origin story every Friday',
    onSubmit: fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
  },
} satisfies Meta<typeof NewsletterBand>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The sign-up checks the address before it subscribes. */
export const SignUp: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const email = canvas.getByRole('textbox', { name: 'Email' });
    const subscribe = canvas.getByRole('button', { name: 'Subscribe' });
    await expectTapSize(email, 'email box');
    await expectTapSize(subscribe, 'subscribe button');
    await userEvent.type(email, 'not-an-email');
    await userEvent.click(subscribe);
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect((email as HTMLInputElement).validity.valid).toBe(false);
    await userEvent.clear(email);
    await userEvent.type(email, 'reader@example.com');
    await userEvent.click(subscribe);
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

/**
 * A compact tile with one button: the form opens in a pop-up, and focus goes
 * back to the button when it closes.
 */
export const Tile: Story = {
  args: {
    display: 'tile',
    detail: 'Short, and never more than once a week.',
  },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    // No email box on the tile itself, only the button.
    await expect(canvas.queryByRole('textbox')).toBeNull();
    const open = canvas.getByRole('button', { name: 'Sign up' });
    await expect(open).toHaveAttribute('aria-haspopup', 'dialog');
    await expectTapSize(open, 'sign-up button');
    await userEvent.click(open);
    const dialog = within(
      within(canvasElement.ownerDocument.body).getByRole('dialog', {
        name: 'One origin story every Friday',
      })
    );
    const email = dialog.getByRole('textbox', { name: 'Email' });
    await expectTapSize(email, 'email box');
    await userEvent.type(email, 'reader@example.com');
    await userEvent.click(dialog.getByRole('button', { name: 'Subscribe' }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
    await userEvent.click(dialog.getByRole('button', { name: 'Close' }));
    await expect(open).toHaveFocus();
  },
};

/** The tile's words can be changed, as every word a visitor sees. */
export const TileWords: Story = {
  args: {
    display: 'tile',
    tileLabels: { open: 'Join the list', close: 'Not now' },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Join the list' })
    ).toBeVisible();
  },
};
