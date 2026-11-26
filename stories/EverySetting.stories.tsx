import type { Meta, StoryObj } from '@storybook/react-vite';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, waitFor } from 'storybook/test';
import { StatsRow, YouTubeVideo } from '../src';
import { BLOCK_GROUPS, type BlockGroup } from '../src/system/registry';
import { LOOK_SETTINGS, type SettingField } from '../src/system/settings';
import {
  BLOCKS,
  BLOCK_COMPONENT,
  appProps,
  leastProps,
  sampleProps,
  variants,
} from '../e2e/setting-samples';

/*
 * Every block in a real browser, with its effects running: the page shows
 * each group's blocks with every setting set (checked for accessibility),
 * and the test mounts each block every other way too: only what's required,
 * and each choice, toggle, number, empty list and long line in turn. None
 * may fail to show or make React warn. e2e/every-setting.spec.ts checks the
 * same ways on the server, and that each setting changes the page.
 *
 * Blocks that load another site wait for consent here, so nothing loads.
 */

type Props = Record<string, unknown>;

const meta = {
  title: 'Checks/Every setting',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const inGroup = (group: BlockGroup) =>
  BLOCKS.filter((block) => block.group === group);

/** A block's props: the app's, then the given, waiting for consent. */
function propsFor(block: (typeof BLOCKS)[number], props: Props): Props {
  return {
    ...appProps(block),
    ...props,
    ...((block.appOnly as readonly string[]).includes('consent')
      ? { consent: false }
      : {}),
  };
}

function waysOf(block: (typeof BLOCKS)[number]) {
  const full = sampleProps(block.settings, block.id);
  return [
    {
      label: 'only what’s required',
      props: leastProps(block.settings, block.id),
    },
    ...block.settings.flatMap((field) =>
      variants(field).map((variant) => ({
        label: `${field.name} = ${variant.label}`,
        props: { ...full, [field.name]: variant.value },
      }))
    ),
    ...LOOK_SETTINGS.flatMap((field) =>
      variants(field as SettingField).map((variant) => ({
        label: `look ${field.name} = ${variant.label}`,
        props: { ...full, [field.name]: variant.value },
      }))
    ),
  ];
}

function groupStory(group: BlockGroup): Story {
  return {
    render: () => (
      <div className="flex flex-col gap-6">
        {inGroup(group).map((block) =>
          createElement(BLOCK_COMPONENT(block), {
            key: block.id,
            ...propsFor(block, sampleProps(block.settings, block.id)),
          })
        )}
      </div>
    ),
    play: async ({ canvasElement }) => {
      for (const block of inGroup(group)) {
        await expect(
          canvasElement.querySelector(`[data-block="${block.id}"]`),
          block.id
        ).not.toBeNull();
      }
      // Each other way, mounted and taken down again off the story's page.
      const host = document.createElement('div');
      document.body.append(host);
      const warnings: string[] = [];
      const original = console.error;
      console.error = (...args: unknown[]) => {
        warnings.push(args.map(String).join(' ').slice(0, 300));
      };
      try {
        for (const block of inGroup(group)) {
          for (const way of waysOf(block)) {
            const root = createRoot(host);
            flushSync(() =>
              root.render(
                createElement(
                  BLOCK_COMPONENT(block),
                  propsFor(block, way.props)
                )
              )
            );
            // Let effects run, as they would on a page.
            await new Promise((done) => setTimeout(done, 0));
            await expect(
              host.querySelector(`[data-block="${block.id}"]`),
              `${block.id}: ${way.label}`
            ).not.toBeNull();
            root.unmount();
            await expect(warnings, `${block.id}: ${way.label}`).toEqual([]);
          }
        }
      } finally {
        console.error = original;
        host.remove();
      }
    },
  };
}

export const Profile = groupStory('profile');
export const Links = groupStory('links');
export const Selling = groupStory('selling');
export const Offers = groupStory('offers');
export const Media = groupStory('media');
export const Trust = groupStory('trust');
export const Forms = groupStory('forms');
export const Feeds = groupStory('feeds');
export const Developer = groupStory('developer');
export const Text = groupStory('text');
export const Page = groupStory('page');

/** A group added to the registry needs its story here. */
export const AllGroups: Story = {
  render: () => <p>Every group has its story.</p>,
  play: async () => {
    const stories = [
      'profile',
      'links',
      'selling',
      'offers',
      'media',
      'trust',
      'forms',
      'feeds',
      'developer',
      'text',
      'page',
    ];
    await expect([...BLOCK_GROUPS]).toEqual(stories);
  },
};

/** `start` is in the player's address once play is pressed. */
export const VideoStart: Story = {
  render: () => (
    <YouTubeVideo
      video="https://www.youtube.com/watch?v=M7lc1UVf-VE"
      title="How tea came to India"
      start={42.7}
    />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Play: How tea came to India' })
    );
    await waitFor(() =>
      expect(canvasElement.querySelector('iframe')).not.toBeNull()
    );
    await expect(canvasElement.querySelector('iframe')?.src).toContain(
      '&start=42'
    );
  },
};

/** The numbers we see on the way to the last one. */
async function numbersShown(canvasElement: HTMLElement) {
  const seen = new Set<string>();
  const number = () =>
    canvasElement.querySelector('[data-block="stats-row"] [aria-hidden]');
  const watch = new MutationObserver(() => {
    const text = number()?.textContent;
    if (text) seen.add(text);
  });
  watch.observe(canvasElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  seen.add(number()?.textContent ?? '');
  await new Promise((done) => setTimeout(done, 1600));
  watch.disconnect();
  seen.add(number()?.textContent ?? '');
  return seen;
}

/** `animate` counts up from 0 once the row is on screen. */
export const StatsCountUp: Story = {
  render: () => (
    <StatsRow locale="en" stats={[{ value: 1000, label: 'Recipes' }]} />
  ),
  play: async ({ canvasElement }) => {
    const seen = await numbersShown(canvasElement);
    await expect(seen.has('1,000')).toBe(true);
    // Reduced motion shows the number at once; otherwise it counts.
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(seen.size).toBeGreaterThan(1);
    }
  },
};

/** `animate={false}` shows the number straight away. */
export const StatsStill: Story = {
  render: () => (
    <StatsRow
      locale="en"
      stats={[{ value: 1000, label: 'Recipes' }]}
      animate={false}
    />
  ),
  play: async ({ canvasElement }) => {
    const seen = await numbersShown(canvasElement);
    await expect([...seen]).toEqual(['1,000']);
  },
};
