import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
  CreatorHeader,
  EditMode,
  LinkList,
  SitePage,
  type EditPick,
} from '../src';
import { RegistrySamples } from './block-samples';

/*
 * Edit mode, as the page editor (Levuche/app) will use it: a creator clicks a
 * block's words and types them in place, or clicks a link or a picture and
 * the editor opens what sets it. Edits here are saved into the blocks' props
 * at once, as the app saves them, and picks are listed under the page.
 */

type Props = Record<string, unknown>;

/** `props` with the setting at `path` ("links.0.label") set to `value`. */
function setAt(props: Props, path: string, value: string): Props {
  const [key, ...rest] = path.split('.');
  const copy: Props | unknown[] = Array.isArray(props)
    ? [...props]
    : { ...props };
  const here = (copy as Props)[key];
  (copy as Props)[key] = rest.length
    ? setAt((here ?? {}) as Props, rest.join('.'), value)
    : value;
  return copy as Props;
}

/** The setting at `path`, when it's words. */
function readAt(props: Props, path: string): string | undefined {
  const value = path
    .split('.')
    .reduce<unknown>((at, key) => (at as Props | undefined)?.[key], props);
  return typeof value === 'string' ? value : undefined;
}

const START: Record<string, Props> = {
  header: {
    name: 'Asha Menon',
    tagline: 'Recipes and stories from a Kerala kitchen.',
  },
  links: {
    links: [
      { label: 'My cookbook', href: 'https://example.com/book' },
      {
        label: 'Weekly newsletter',
        href: 'https://example.com/news',
        detail: 'A recipe every Sunday',
      },
    ],
  },
};

function EditorCanvas({ everyBlock = false }: { everyBlock?: boolean }) {
  const [blocks, setBlocks] = useState(START);
  const [picks, setPicks] = useState<string[]>([]);
  const onPick = ({ block, path, kind }: EditPick) =>
    setPicks((list) => [...list, `${block ?? '?'} ${path} (${kind})`]);
  return (
    <div className="flex flex-col gap-4">
      <EditMode
        onEdit={({ block, path, value }) => {
          if (!block) return;
          setBlocks((all) => ({
            ...all,
            [block]: setAt(all[block], path, value),
          }));
        }}
        onPick={onPick}
        readValue={({ block, path }) =>
          block && blocks[block] ? readAt(blocks[block], path) : undefined
        }
        describe={({ path }) => `Edit ${path}`}
      >
        <SitePage>
          <CreatorHeader
            data-edit-block="header"
            {...(blocks.header as { name: string })}
          />
          <LinkList
            data-edit-block="links"
            {...(blocks.links as Parameters<typeof LinkList>[0])}
          />
          {everyBlock ? <RegistrySamples /> : null}
        </SitePage>
      </EditMode>
      <ul aria-label="Picked" className="m-0 font-mono text-xs">
        {picks.map((pick, i) => (
          <li key={i}>{pick}</li>
        ))}
      </ul>
    </div>
  );
}

const meta = {
  title: 'Editor/Edit mode',
  component: EditorCanvas,
} satisfies Meta<typeof EditorCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Typing a name in place, keeping it, and putting a change back. */
export const TypeInPlace: Story = {
  play: async ({ canvas, canvasElement }) => {
    const name = canvasElement.querySelector<HTMLElement>(
      '[data-edit-block="header"] [data-edit="name"]'
    );
    await expect(name).not.toBeNull();
    await userEvent.click(name!);
    const box = await canvas.findByRole('textbox', { name: 'Edit name' });
    await expect(box).toHaveFocus();
    await userEvent.clear(box);
    await userEvent.keyboard('Asha M.{Enter}');
    await waitFor(() =>
      expect(canvas.getByText('Asha M.')).toBeInTheDocument()
    );
    await expect(canvas.queryByRole('textbox')).toBeNull();

    // Escape puts the words back.
    const label = canvas.getByText('My cookbook');
    await userEvent.click(label);
    const second = await canvas.findByRole('textbox');
    await userEvent.clear(second);
    await userEvent.keyboard('Something else{Escape}');
    await expect(canvas.getByText('My cookbook')).toBeInTheDocument();
    await expect(canvas.queryByText('Something else')).toBeNull();
  },
};

/** A click beside a link's words picks the link; links never open. */
export const PickALink: Story = {
  play: async ({ canvas, canvasElement }) => {
    const link = canvasElement.querySelector<HTMLElement>(
      '[data-edit="links.0.href"]'
    );
    await expect(link).not.toBeNull();
    await userEvent.click(link!, { skipHover: true });
    await waitFor(() =>
      expect(canvas.getByRole('list', { name: 'Picked' })).toHaveTextContent(
        'links links.0.href (link)'
      )
    );
  },
};

/** Every editable part can be reached with Tab and opened with Enter. */
export const FromTheKeyboard: Story = {
  play: async ({ canvas, canvasElement }) => {
    // All but those screen readers skip, such as a picture's placeholder.
    const parts = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-edit]'),
    ].filter((part) => !part.closest('[aria-hidden="true"], .sr-only'));
    await expect(parts.length).toBeGreaterThan(3);
    for (const part of parts) await expect(part.tabIndex).toBe(0);
    const tagline = canvasElement.querySelector<HTMLElement>(
      '[data-edit="tagline"]'
    )!;
    tagline.focus();
    await userEvent.keyboard('{Enter}');
    const box = await canvas.findByRole('textbox', { name: 'Edit tagline' });
    await expect(box).toHaveAttribute('aria-multiline', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(tagline).toHaveFocus();
  },
};

/** Every block in the registry, as just added, in edit mode. */
export const EveryBlock: Story = { args: { everyBlock: true } };
