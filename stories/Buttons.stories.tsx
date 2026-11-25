import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { ShareIcon, SiteButton, SiteLinkButton } from '../src';
import { expectTapSize } from './expect-tap-size';

const meta = {
  title: 'Blocks/Buttons',
  component: SiteButton,
  tags: ['autodocs'],
  args: { children: 'Shop my presets', onClick: fn() },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['solid', 'outline', 'soft', 'text'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof SiteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'Shop my presets' });
    await expectTapSize(button, 'button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Outline: Story = { args: { variant: 'outline' } };
export const Soft: Story = {
  args: { variant: 'soft', icon: <ShareIcon size={18} />, children: 'Share' },
};
export const Text: Story = { args: { variant: 'text', children: 'Read more' } };

export const Disabled: Story = {
  args: { disabled: true, children: 'Sold out' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Sold out' })
    ).toBeDisabled();
  },
};

/** Every size, small to large, is still big enough to tap. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <SiteButton {...args} size="sm">
        Small
      </SiteButton>
      <SiteButton {...args} size="md">
        Medium
      </SiteButton>
      <SiteButton {...args} size="lg">
        Large
      </SiteButton>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const name of ['Small', 'Medium', 'Large']) {
      await expectTapSize(canvas.getByRole('button', { name }), name);
    }
  },
};

/** A button that goes to another site opens it in a new tab. */
export const LinkButton: StoryObj<typeof SiteLinkButton> = {
  render: () => (
    <SiteLinkButton href="https://example.com/presets" fullWidth>
      Shop my presets
    </SiteLinkButton>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Shop my presets' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    );
    await expectTapSize(link, 'link button');
  },
};
