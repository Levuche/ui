import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  CameraIcon,
  FeaturedLink,
  LinkList,
  LinkTile,
  SocialIcons,
} from '../src';
import { expectTapSize } from './expect-tap-size';
import { SAMPLE_LINKS, SAMPLE_SOCIALS } from './sample-page';

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

/** The one link a creator wants seen first, with a big picture. */
export const Featured: StoryObj<typeof FeaturedLink> = {
  render: () => (
    <FeaturedLink
      href="https://www.youtube.com/watch?v=M7lc1UVf-VE"
      title="New: how tea came to India"
      detail="12 minutes, out now"
    />
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /how tea came to India/ });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveTextContent('12 minutes, out now');
  },
};

/** Round icon links, each named for screen readers. */
export const Social: StoryObj<typeof SocialIcons> = {
  render: () => <SocialIcons links={SAMPLE_SOCIALS} />,
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Social accounts' });
    await expect(nav).toBeVisible();
    for (const name of ['Instagram', 'YouTube', 'Email']) {
      const link = canvas.getByRole('link', { name });
      await expectTapSize(link, name);
    }
    await expect(
      canvas.getByRole('link', { name: 'Email' })
    ).not.toHaveAttribute('target');
  },
};
