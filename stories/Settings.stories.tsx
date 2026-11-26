import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BLOCKS, BLOCK_TONES, LOOK_SETTINGS, blockInfo } from '../src';
import { SettingsPreview } from './settings-preview';

/*
 * Each block describes its own settings (BLOCKS[].settings), so the page
 * editor can build its panel without a hand-made form per block. This is a
 * rough preview of that panel: the block's own fields, then the look every
 * block shares. Pick any block in Controls.
 */
const meta = {
  title: 'Editor/Settings panel',
  component: SettingsPreview,
  args: { block: 'tip-jar' },
  argTypes: {
    block: {
      control: 'select',
      options: BLOCKS.map((block) => block.id),
    },
  },
} satisfies Meta<typeof SettingsPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The preview's two sections, found inside the themed page. */
const sections = (canvasElement: HTMLElement) => {
  const page = canvasElement.querySelector<HTMLElement>(
    '[data-testid="story-theme"]'
  )!;
  return {
    page,
    own: page.querySelector<HTMLElement>('[data-section="settings"]')!,
    look: page.querySelector<HTMLElement>('[data-section="look"]')!,
  };
};

/** The top-level fields of a section, by name. */
const fieldNames = (section: HTMLElement) =>
  [...section.querySelectorAll(':scope > [data-setting]')].map((element) =>
    element.getAttribute('data-setting')
  );

export const TipJar: Story = {
  play: async ({ canvasElement }) => {
    const { own, look } = sections(canvasElement);
    // One field per setting, in the registry's order.
    await expect(fieldNames(own)).toEqual(
      blockInfo('tip-jar')!.settings.map((field) => field.name)
    );
    // The look is the same list on every panel, with the package's tones.
    await expect(fieldNames(look)).toEqual(
      LOOK_SETTINGS.map((field) => field.name)
    );
    const tone = within(look).getByLabelText(/^Colours/);
    await expect(tone.querySelectorAll('option')).toHaveLength(
      BLOCK_TONES.length
    );
    // Defaults fill the fields, and a toggle can be changed.
    await expect(within(own).getByLabelText(/^Currency sign/)).toHaveValue('$');
    const other = within(own).getByLabelText(/^Any amount/);
    await expect(other).toBeChecked();
    await userEvent.click(other);
    await expect(other).not.toBeChecked();
    // Its words come from the package's own defaults.
    await expect(
      own.querySelector('[data-setting="labels"] legend')
    ).toHaveTextContent('Words');
  },
};

export const MainLinkAndSlowFields: Story = {
  args: { block: 'youtube-video' },
  play: async ({ canvasElement }) => {
    const { own } = sections(canvasElement);
    const video = within(own).getByLabelText(/^Video/);
    await expect(video).toHaveAttribute('type', 'url');
    const label = own.querySelector('[data-setting="video"] label')!;
    await expect(label).toHaveTextContent('pasted links go here');
    await expect(label).toHaveTextContent('waits until typing stops');
    await expect(label).toHaveTextContent('required');
    // Only one field takes a pasted link.
    await expect(own.textContent?.split('pasted links go here')).toHaveLength(
      2
    );
  },
};

export const GroupsAndLists: Story = {
  args: { block: 'save-contact' },
  play: async ({ canvasElement }) => {
    const { own } = sections(canvasElement);
    const card = own.querySelector<HTMLElement>('[data-setting="contact"]')!;
    await expect(card.tagName).toBe('FIELDSET');
    await expect(within(card).getByLabelText(/^Email/)).toBeInTheDocument();
    await expect(within(card).getByLabelText(/^Website/)).toHaveAttribute(
      'type',
      'url'
    );
  },
};

export const ReadFromTheApp: Story = {
  args: { block: 'latest-videos' },
  play: async ({ canvasElement }) => {
    const { own } = sections(canvasElement);
    const label = own.querySelector('[data-setting="channel"] label')!;
    await expect(label).toHaveTextContent('read by the app');
    await expect(label).toHaveTextContent('waits until typing stops');
  },
};
