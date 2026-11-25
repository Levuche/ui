import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { ContactForm, SaveContact } from '../src';
import { expectTapSize } from './expect-tap-size';

const meta = {
  title: 'Blocks/Contact',
  component: ContactForm,
  tags: ['autodocs'],
  args: {
    title: 'Work with me',
    detail: 'Brand collaborations and cooking classes.',
    onSubmit: fn((event) => event.preventDefault()),
  },
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Name, email and message, each with its label. */
export const Form: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByLabelText('Your name'), 'Asha');
    await userEvent.type(
      canvas.getByLabelText('Your email'),
      'asha@example.com'
    );
    await userEvent.type(canvas.getByLabelText('Message'), 'Hello!');
    const send = canvas.getByRole('button', { name: 'Send' });
    await expectTapSize(send, 'Send');
    await userEvent.click(send);
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};

/** Sending: the button spins and the fields can't change. */
export const Sending: Story = {
  args: { status: 'sending' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Send/ })).toHaveAttribute(
      'aria-busy',
      'true'
    );
  },
};

/** Sent: only the thank-you is left. */
export const Sent: Story = {
  args: { status: 'sent' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent(/Thanks/);
    await expect(canvas.queryByLabelText('Message')).toBeNull();
  },
};

/** Email and message only, in the creator's own words. */
export const OwnWords: Story = {
  args: {
    askName: false,
    tone: 'surface',
    labels: {
      email: 'Email',
      message: 'What can I help with?',
      button: 'Send it',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByLabelText('Your name')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Send it' })).toBeVisible();
  },
};

/** A button that saves the creator's contact card to the phone. */
export const SaveMyContact: Story = {
  render: () => (
    <SaveContact
      title="Save my contact"
      contact={{
        name: 'Asha Menon',
        org: 'Desi Origins',
        email: 'hello@example.com',
        url: 'https://example.com',
      }}
    />
  ),
  play: async ({ canvas }) => {
    const save = canvas.getByRole('link', { name: /Save contact/ });
    await expect(save).toHaveAttribute('download', 'Asha Menon.vcf');
    await expect(save.getAttribute('href')).toMatch(/^data:text\/vcard/);
    await expectTapSize(save, 'Save contact');
  },
};
