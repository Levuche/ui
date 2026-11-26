import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LockedLink } from '../src';
import { expectTapSize } from './expect-tap-size';
import { onScreen } from './screens';

/** Stands in for a server action: "CHAI" is the right code. */
const unlock = fn(async (code: string) =>
  code.toUpperCase() === 'CHAI' ? 'https://example.com/early-access' : null
);

const meta = {
  title: 'Blocks/Locked link',
  component: LockedLink,
  tags: ['autodocs'],
  args: {
    label: 'Early access: the reel pack',
    mode: 'code',
    unlock,
    newTab: true,
  },
  beforeEach: () => {
    sessionStorage.clear();
    unlock.mockClear();
  },
} satisfies Meta<typeof LockedLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialogOf = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).getByRole('dialog');

/** The right code shows the link; it wasn't in the page before. */
export const Code: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.innerHTML).not.toContain('early-access');
    const open = canvas.getByRole('button', { name: /Early access/ });
    await expectTapSize(open, 'Locked link');
    await userEvent.click(open);
    const dialog = within(dialogOf(canvasElement));
    await userEvent.type(dialog.getByLabelText('Code'), 'chai');
    await userEvent.click(dialog.getByRole('button', { name: 'Unlock' }));
    await expect(unlock).toHaveBeenCalledWith('chai');
    await expect(
      await dialog.findByRole('link', { name: /Open the link/ })
    ).toHaveAttribute('href', 'https://example.com/early-access');
  },
};

/** A wrong code says so, and the address stays out of the page. */
export const WrongCode: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Early access/ }));
    const dialog = within(dialogOf(canvasElement));
    await userEvent.type(dialog.getByLabelText('Code'), 'TEA');
    await userEvent.click(dialog.getByRole('button', { name: 'Unlock' }));
    await expect(await dialog.findByRole('status')).toHaveTextContent(
      /didn’t work/
    );
    await expect(canvasElement.ownerDocument.body.innerHTML).not.toContain(
      'early-access'
    );
  },
};

/** An age check: "No" says why, and closing gives focus back to the button. */
export const AgeCheck: Story = {
  globals: onScreen('phone'),
  args: {
    mode: 'age',
    label: 'The tasting notes',
    href: 'https://example.com/tasting',
    unlock: undefined,
  },
  play: async ({ canvas, canvasElement }) => {
    const open = canvas.getByRole('button', { name: /The tasting notes/ });
    await userEvent.click(open);
    const dialog = within(dialogOf(canvasElement));
    await expect(dialog.getByText('Are you 18 or older?')).toBeVisible();
    // Empty until "No", so the answer is announced.
    await expect(dialog.getByRole('status')).toBeEmptyDOMElement();
    await userEvent.click(dialog.getByRole('button', { name: 'No' }));
    await expect(dialog.getByRole('status')).toHaveTextContent(/18 and over/);
    const close = dialog.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(close).toHaveFocus());
    await userEvent.click(close);
    await expect(open).toHaveFocus();
  },
};

/** A warning first, then Continue opens the link. */
export const Warning: Story = {
  globals: onScreen('tablet'),
  args: {
    mode: 'warning',
    label: 'The full documentary',
    href: 'https://example.com/documentary',
    message: 'This film shows an animal being hunted.',
    unlock: undefined,
  },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /The full documentary/ })
    );
    const dialog = within(dialogOf(canvasElement));
    await expect(dialog.getByText(/animal being hunted/)).toBeVisible();
    const go = dialog.getByRole('link', { name: 'Continue' });
    await expect(go).toHaveAttribute('target', '_blank');
    await expectTapSize(go, 'Continue');
  },
};

/** The creator's own words, on a desktop. */
export const OwnWords: Story = {
  globals: onScreen('desktop'),
  args: {
    tone: 'accent',
    labels: { code: 'Member code', unlock: 'Let me in' },
  },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Early access/ }));
    const dialog = within(dialogOf(canvasElement));
    await expect(dialog.getByLabelText('Member code')).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Let me in' })
    ).toBeVisible();
  },
};
