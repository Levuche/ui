import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { FaqList, Testimonials } from '../src';
import { expectTapSize } from './expect-tap-size';
import { SAMPLE_FAQ, SAMPLE_TESTIMONIALS } from './sample-page';

const meta = {
  title: 'Blocks/Reviews and questions',
  component: Testimonials,
  tags: ['autodocs'],
  args: { items: SAMPLE_TESTIMONIALS },
} satisfies Meta<typeof Testimonials>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Quotes with who said them; stars are read as "5 out of 5 stars". */
export const Reviews: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('img', { name: '5 out of 5 stars' })
    ).toBeVisible();
    await expect(canvas.getByText('Meera K.')).toBeVisible();
  },
};

/** Answers open one question at a time. */
export const Questions: StoryObj<typeof FaqList> = {
  render: () => <FaqList items={SAMPLE_FAQ} />,
  play: async ({ canvas, userEvent }) => {
    const question = canvas
      .getByText('What do I get in the reel pack?')
      .closest('summary')!;
    const answer = canvas.getByText(/100 prompts/);
    await expect(answer).not.toBeVisible();
    await expectTapSize(question, 'question');
    await userEvent.click(question);
    await expect(answer).toBeVisible();
  },
};
