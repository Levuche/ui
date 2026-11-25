import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CameraIcon, LinkList, LinkTile } from '../src';
import { expectTapSize } from './expect-tap-size';
import { SAMPLE_LINKS } from './sample-page';

const meta = {
  title: 'Blocks/Links',
  component: LinkList,
  tags: ['autodocs'],
  args: { label: 'Desi Origins links', links: SAMPLE_LINKS },
} satisfies Meta<typeof LinkList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Links to other sites open in a new tab; email links don't. */
export const List: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Desi Origins links' });
    await expect(nav).toBeVisible();
    const youtube = canvas.getByRole('link', { name: /YouTube channel/ });
    await expect(youtube).toHaveAttribute('target', '_blank');
    await expect(youtube).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    );
    await expect(youtube).toHaveTextContent('New video every Friday');
    await expect(
      canvas.getByRole('link', { name: 'Email me' })
    ).not.toHaveAttribute('target');
    for (const link of canvas.getAllByRole('link')) {
      await expectTapSize(link, link.textContent ?? 'link');
    }
  },
};

export const Tile: StoryObj<typeof LinkTile> = {
  render: () => (
    <LinkTile
      href="https://www.instagram.com/example"
      icon={<CameraIcon size={20} />}
    >
      Instagram
    </LinkTile>
  ),
};
