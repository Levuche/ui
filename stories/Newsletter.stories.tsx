import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FormEvent } from 'react';
import { expect, fn } from 'storybook/test';
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
