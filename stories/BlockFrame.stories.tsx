import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  BlockFrame,
  CreatorHeader,
  EditMode,
  LinkList,
  SiteImage,
  SitePage,
  SocialIcons,
  TextBlock,
  type BlockDropPlace,
} from '../src';
import { RELEASE_ONE, readAt, setAt, type Props } from './release-one';

/*
 * The page editor with one frame around every block: the same <BlockFrame>
 * gives each of release 1's blocks its name and its buttons (drag, move up
 * and down, duplicate, settings, delete, and add a block below), so no block
 * has buttons of its own. The editor here keeps the list of blocks as the
 * app would: a delete can be undone, a click on words still types them in
 * place, and every change is listed under the page.
 */

type Kind = 'header' | 'social' | 'links' | 'text' | 'picture';
type Block = { id: string; kind: Kind; props: Props };

const NAMES: Record<Kind, string> = {
  header: 'Profile',
  social: 'Social icons',
  links: 'Links',
  text: 'Text',
  picture: 'Picture',
};
const KINDS = Object.keys(NAMES) as Kind[];

/** What a block is when it's added: release 1's sample, or a new text. */
const NEW_BLOCK: Record<Kind, Props> = {
  ...(RELEASE_ONE as Record<Kind, Props>),
  text: { text: 'New text. Click to type.' },
};

function Show({ block }: { block: Block }): ReactNode {
  const props = block.props as never;
  switch (block.kind) {
    case 'header':
      return (
        <CreatorHeader {...(props as Parameters<typeof CreatorHeader>[0])} />
      );
    case 'social':
      return <SocialIcons {...(props as Parameters<typeof SocialIcons>[0])} />;
    case 'links':
      return <LinkList {...(props as Parameters<typeof LinkList>[0])} />;
    case 'text':
      return <TextBlock {...(props as Parameters<typeof TextBlock>[0])} />;
    case 'picture':
      return <SiteImage {...(props as Parameters<typeof SiteImage>[0])} />;
  }
}

/** A new block, with an id no other block has. */
let made = 0;
const make = (kind: Kind, props = NEW_BLOCK[kind]): Block => ({
  id: `${kind}-${++made}`,
  kind,
  props,
});

function PageEditor() {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    KINDS.map((kind) => ({ id: kind, kind, props: RELEASE_ONE[kind] }))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [settings, setSettings] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<{ block: Block; at: number } | null>(
    null
  );
  const [log, setLog] = useState<string[]>([]);
  const note = (line: string) => setLog((all) => [...all, line]);
  const nameOf = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    return block ? NAMES[block.kind] : id;
  };

  const move = (id: string, by: -1 | 1) => {
    setBlocks((all) => {
      const from = all.findIndex((b) => b.id === id);
      const to = from + by;
      if (from < 0 || to < 0 || to >= all.length) return all;
      const copy = [...all];
      [copy[from], copy[to]] = [copy[to], copy[from]];
      return copy;
    });
    note(`moved ${nameOf(id)} ${by < 0 ? 'up' : 'down'}`);
  };
  const drop = (from: string, onto: string, place: BlockDropPlace) => {
    setBlocks((all) => {
      const block = all.find((b) => b.id === from);
      if (!block) return all;
      const rest = all.filter((b) => b.id !== from);
      const at = rest.findIndex((b) => b.id === onto);
      rest.splice(place === 'before' ? at : at + 1, 0, block);
      return rest;
    });
    note(`dragged ${nameOf(from)} ${place} ${nameOf(onto)}`);
  };
  const duplicate = (id: string) => {
    const at = blocks.findIndex((b) => b.id === id);
    const copy = make(blocks[at].kind, blocks[at].props);
    setBlocks((all) => [...all.slice(0, at + 1), copy, ...all.slice(at + 1)]);
    setSelected(copy.id);
    note(`duplicated ${nameOf(id)}`);
  };
  const remove = (id: string) => {
    const at = blocks.findIndex((b) => b.id === id);
    if (at < 0) return;
    setDeleted({ block: blocks[at], at });
    setBlocks((all) => all.filter((b) => b.id !== id));
    if (selected === id) setSelected(null);
    if (settings === id) setSettings(null);
    note(`deleted ${nameOf(id)}`);
  };
  const undo = () => {
    if (!deleted) return;
    const { block, at } = deleted;
    setBlocks((all) => [...all.slice(0, at), block, ...all.slice(at)]);
    setSelected(block.id);
    setDeleted(null);
    note(`put back ${NAMES[block.kind]}`);
  };
  const add = (after: string, kind: Kind) => {
    const at = blocks.findIndex((b) => b.id === after);
    const block = make(kind);
    setBlocks((all) => [...all.slice(0, at + 1), block, ...all.slice(at + 1)]);
    setSelected(block.id);
    setAdding(null);
    note(`added ${NAMES[kind]}`);
  };
  const setting = blocks.find((b) => b.id === settings);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex min-w-0 flex-1 basis-[28rem] flex-col gap-6 py-6">
        <EditMode
          onEdit={({ block, path, value }) => {
            if (!block) return;
            setBlocks((all) =>
              all.map((b) =>
                b.id === block
                  ? { ...b, props: setAt(b.props, path, value) }
                  : b
              )
            );
            note(`${nameOf(block)} ${path} = ${value}`);
          }}
          onPick={({ block, path, kind }) =>
            note(`${block ? nameOf(block) : '?'} ${path} (${kind})`)
          }
          readValue={({ block, path }) => {
            const found = blocks.find((b) => b.id === block);
            return found ? readAt(found.props, path) : undefined;
          }}
          describe={({ path }) => `Edit ${path}`}
        >
          <SitePage gap="lg">
            {blocks.map((block, i) => (
              <div key={block.id} className="contents">
                <BlockFrame
                  id={block.id}
                  label={NAMES[block.kind]}
                  first={i === 0}
                  last={i === blocks.length - 1}
                  selected={selected === block.id}
                  onSelect={setSelected}
                  onMove={(by) => move(block.id, by)}
                  onDrop={(from, place) => drop(from, block.id, place)}
                  onDuplicate={() => duplicate(block.id)}
                  onSettings={() => setSettings(block.id)}
                  onDelete={() => remove(block.id)}
                  onAdd={() => setAdding(block.id)}
                >
                  <Show block={block} />
                </BlockFrame>
                {adding === block.id ? (
                  <div
                    role="group"
                    aria-label="Add a block"
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 text-sm"
                  >
                    {KINDS.map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        className="rounded-lg border px-3 py-1.5"
                        onClick={() => add(block.id, kind)}
                      >
                        {NAMES[kind]}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="px-3 py-1.5 underline"
                      onClick={() => setAdding(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </SitePage>
        </EditMode>
        {deleted ? (
          <div
            role="status"
            className="flex items-center gap-3 self-center rounded-xl bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Deleted {NAMES[deleted.block.kind]}.
            <button
              type="button"
              className="font-semibold underline"
              onClick={undo}
            >
              Undo
            </button>
          </div>
        ) : null}
      </div>
      <aside className="flex w-72 flex-col gap-4 text-sm">
        {setting ? (
          <section
            aria-label={`${NAMES[setting.kind]} settings`}
            className="flex flex-col gap-2 rounded-xl border p-4"
          >
            <h2 className="m-0 text-base font-semibold">
              {NAMES[setting.kind]} settings
            </h2>
            {Object.entries(setting.props)
              .filter(([, value]) => typeof value === 'string')
              .map(([key, value]) => (
                <label key={key} className="flex flex-col gap-1">
                  {key}
                  <input
                    className="rounded border px-2 py-1"
                    value={value as string}
                    onChange={(event) =>
                      setBlocks((all) =>
                        all.map((b) =>
                          b.id === setting.id
                            ? {
                                ...b,
                                props: {
                                  ...b.props,
                                  [key]: event.target.value,
                                },
                              }
                            : b
                        )
                      )
                    }
                  />
                </label>
              ))}
            <button
              type="button"
              className="self-start underline"
              onClick={() => setSettings(null)}
            >
              Close
            </button>
          </section>
        ) : null}
        <ol aria-label="Changes" className="m-0 font-mono text-xs">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

const meta = {
  title: 'Editor/Block frame',
  component: PageEditor,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The editor to try by hand: hover, click, drag and use the keyboard. */
export const TryIt: Story = {};

/** The blocks' names on the page, top to bottom. */
const order = (root: HTMLElement) =>
  [...root.querySelectorAll('[data-block-frame]')].map((frame) =>
    frame.getAttribute('aria-label')
  );
const frames = (root: HTMLElement, name: string) =>
  [...root.querySelectorAll<HTMLElement>('[data-block-frame]')].filter(
    (frame) => frame.getAttribute('aria-label') === name
  );
/** A button on a block's frame, once the block is selected and shows them. */
const button = (frame: HTMLElement, name: string) =>
  within(
    frame.querySelector<HTMLElement>('[data-block-frame-bar]')!
  ).findByRole('button', { name });

/**
 * Every block gets the same buttons from one frame: select a block and move
 * it, copy it, delete it and undo, add a block under another, drag one onto
 * another, and do the same from the keyboard. Words still type in place.
 */
export const EveryBlockOneFrame: Story = {
  play: async ({ canvas, canvasElement, step }) => {
    const changes = () => canvas.getByRole('list', { name: 'Changes' });
    await expect(order(canvasElement)).toEqual([
      'Profile',
      'Social icons',
      'Links',
      'Text',
      'Picture',
    ]);

    await step('A click selects a block and shows its buttons', async () => {
      const [text] = frames(canvasElement, 'Text');
      await expect(
        getComputedStyle(text.querySelector('[data-block-frame-bar]')!)
          .visibility
      ).toBe('hidden');
      await userEvent.click(text.querySelector<HTMLElement>('[data-edit]')!);
      // The click reached the words too: they're open to type in.
      await expect(await canvas.findByRole('textbox')).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(text).toHaveAttribute('data-selected'));
      await waitFor(() =>
        expect(
          getComputedStyle(text.querySelector('[data-block-frame-bar]')!)
            .visibility
        ).toBe('visible')
      );
      // The keyboard selects too, and the first block can't go up.
      const [profile] = frames(canvasElement, 'Profile');
      profile.focus();
      await expect(await button(profile, 'Move up')).toBeDisabled();
    });

    await step('Move up', async () => {
      const [text] = frames(canvasElement, 'Text');
      text.focus();
      await userEvent.click(await button(text, 'Move up'));
      await expect(order(canvasElement)).toEqual([
        'Profile',
        'Social icons',
        'Text',
        'Links',
        'Picture',
      ]);
    });

    await step('Duplicate, delete and undo', async () => {
      const [picture] = frames(canvasElement, 'Picture');
      picture.focus();
      await userEvent.click(await button(picture, 'Duplicate'));
      await expect(frames(canvasElement, 'Picture')).toHaveLength(2);
      const copy = frames(canvasElement, 'Picture')[1];
      await userEvent.click(await button(copy, 'Delete'));
      await expect(frames(canvasElement, 'Picture')).toHaveLength(1);
      await expect(canvas.getByRole('status')).toHaveTextContent(
        'Deleted Picture.'
      );
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
      await expect(frames(canvasElement, 'Picture')).toHaveLength(2);
      await userEvent.click(
        await button(frames(canvasElement, 'Picture')[1], 'Delete')
      );
    });

    await step('Add a block below another', async () => {
      const [profile] = frames(canvasElement, 'Profile');
      profile.focus();
      await userEvent.click(
        await within(profile).findByRole('button', {
          name: 'Add a block below',
        })
      );
      const menu = canvas.getByRole('group', { name: 'Add a block' });
      await userEvent.click(within(menu).getByRole('button', { name: 'Text' }));
      await expect(order(canvasElement)).toEqual([
        'Profile',
        'Text',
        'Social icons',
        'Text',
        'Links',
        'Picture',
      ]);
      await expect(frames(canvasElement, 'Text')[0]).toHaveAttribute(
        'data-selected'
      );
    });

    await step('Drag a block onto another', async () => {
      const [picture] = frames(canvasElement, 'Picture');
      const [profile] = frames(canvasElement, 'Profile');
      const data = new DataTransfer();
      const grip = picture.querySelector('[data-block-frame-grip]')!;
      grip.dispatchEvent(
        new DragEvent('dragstart', { bubbles: true, dataTransfer: data })
      );
      const box = profile.getBoundingClientRect();
      const below = {
        bubbles: true,
        cancelable: true,
        dataTransfer: data,
        clientY: box.bottom - 2,
      };
      profile.dispatchEvent(new DragEvent('dragover', below));
      await waitFor(() =>
        expect(profile).toHaveAttribute('data-drop', 'after')
      );
      profile.dispatchEvent(new DragEvent('drop', below));
      // React shows the drop after the event, so wait for it.
      await waitFor(() =>
        expect(order(canvasElement)).toEqual([
          'Profile',
          'Picture',
          'Text',
          'Social icons',
          'Text',
          'Links',
        ])
      );
      await expect(profile).not.toHaveAttribute('data-drop');
    });

    await step('From the keyboard', async () => {
      const [links] = frames(canvasElement, 'Links');
      links.focus();
      await waitFor(() => expect(links).toHaveAttribute('data-selected'));
      await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
      await expect(order(canvasElement).at(-2)).toBe('Links');
      await waitFor(() => expect(links).toHaveFocus());
      await userEvent.keyboard('{Delete}');
      await expect(frames(canvasElement, 'Links')).toHaveLength(0);
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
      await expect(frames(canvasElement, 'Links')).toHaveLength(1);
    });

    await step(
      'Words still type in place, and settings open beside',
      async () => {
        const [text] = frames(canvasElement, 'Text').slice(-1);
        const words = text.querySelector<HTMLElement>('[data-edit]')!;
        await userEvent.click(words);
        const box = await canvas.findByRole('textbox');
        await userEvent.keyboard(
          '{Control>}a{/Control}Hi there{Control>}{Enter}{/Control}'
        );
        await waitFor(() => expect(box).not.toBeInTheDocument());
        await expect(text).toHaveTextContent('Hi there');
        await userEvent.click(await button(text, 'Settings'));
        await expect(
          canvas.getByRole('region', { name: 'Text settings' })
        ).toBeInTheDocument();
        await expect(changes()).toHaveTextContent('Text text = Hi there');
      }
    );
  },
};
