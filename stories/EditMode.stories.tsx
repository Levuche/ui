import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
  CreatorHeader,
  EditMode,
  LinkList,
  SiteImage,
  SitePage,
  SocialIcons,
  TextBlock,
  type EditPick,
} from '../src';
import { RegistrySamples } from './block-samples';
import { RELEASE_ONE, readAt, setAt, type Props } from './release-one';

/*
 * Edit mode, as the page editor (Levuche/app) will use it: a creator clicks a
 * block's words and types them in place, or clicks a link or a picture and
 * the editor opens what sets it. Edits here are saved into the blocks' props
 * at once, as the app saves them, and picks are listed under the page.
 */

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
    // A click edit mode didn't stop would follow the link: note it, and
    // stop it here so the test page stays.
    const opened: string[] = [];
    const follow = (event: MouseEvent) => {
      const href = (event.target as Element).closest?.('a[href]');
      if (!href || event.defaultPrevented) return;
      opened.push(href.getAttribute('href') ?? '');
      event.preventDefault();
    };
    window.addEventListener('click', follow);
    try {
      await userEvent.click(link!, { skipHover: true });
      await waitFor(() =>
        expect(canvas.getByRole('list', { name: 'Picked' })).toHaveTextContent(
          'links links.0.href (link)'
        )
      );
      await expect(opened).toEqual([]);
    } finally {
      window.removeEventListener('click', follow);
    }
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

function ReleaseOneCanvas() {
  const [blocks, setBlocks] = useState(RELEASE_ONE);
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-4">
      <EditMode
        onEdit={({ block, path, value }) => {
          if (!block) return;
          setBlocks((all) => ({
            ...all,
            [block]: setAt(all[block], path, value),
          }));
          setLog((all) => [...all, `${block} ${path} = ${value}`]);
        }}
        onPick={({ block, path, kind }) =>
          setLog((all) => [...all, `${block} ${path} (${kind})`])
        }
        readValue={({ block, path }) =>
          block && blocks[block] ? readAt(blocks[block], path) : undefined
        }
        describe={({ path }) => `Edit ${path}`}
      >
        <SitePage>
          <CreatorHeader
            data-edit-block="header"
            {...(blocks.header as Parameters<typeof CreatorHeader>[0])}
          />
          <SocialIcons
            data-edit-block="social"
            {...(blocks.social as Parameters<typeof SocialIcons>[0])}
          />
          <LinkList
            data-edit-block="links"
            {...(blocks.links as Parameters<typeof LinkList>[0])}
          />
          <TextBlock
            data-edit-block="text"
            {...(blocks.text as Parameters<typeof TextBlock>[0])}
          />
          <SiteImage
            data-edit-block="picture"
            {...(blocks.picture as Parameters<typeof SiteImage>[0])}
          />
        </SitePage>
      </EditMode>
      <ul aria-label="Changes" className="m-0 font-mono text-xs">
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/** The parts a creator can see, so can click: none screen readers skip. */
const seenParts = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[data-edit]')].filter(
    (part) =>
      !part.closest('[aria-hidden="true"], .sr-only, [hidden]') &&
      part.getClientRects().length > 0
  );

/**
 * Release 1's five blocks, every part tried in turn as a creator would: words
 * are clicked, typed over and kept; links and pictures are clicked and
 * picked. No link opens on the way, and every part can be reached with Tab.
 */
export const ReleaseOneBlocks: Story = {
  render: () => <ReleaseOneCanvas />,
  play: async ({ canvas, canvasElement }) => {
    const changes = () => canvas.getByRole('list', { name: 'Changes' });
    const page = canvasElement.querySelector<HTMLElement>(
      '[data-edit-mode="on"]'
    )!;
    const parts = seenParts(page).map((part) => ({
      block: part
        .closest('[data-edit-block]')!
        .getAttribute('data-edit-block')!,
      path: part.getAttribute('data-edit')!,
      kind: part.getAttribute('data-edit-kind') ?? 'text',
    }));
    // Each block has something to edit, and each kind of part is there.
    for (const block of Object.keys(RELEASE_ONE)) {
      await expect(parts.some((part) => part.block === block)).toBe(true);
    }
    for (const kind of ['text', 'longText', 'link', 'picture']) {
      await expect(parts.some((part) => part.kind === kind)).toBe(true);
    }

    const opened: string[] = [];
    const follow = (event: MouseEvent) => {
      const href = (event.target as Element).closest?.('a[href]');
      if (!href || event.defaultPrevented) return;
      opened.push(href.getAttribute('href') ?? '');
      event.preventDefault();
    };
    window.addEventListener('click', follow);
    const problems: string[] = [];
    try {
      for (const [n, { block, path, kind }] of parts.entries()) {
        const where = `${block} ${path} (${kind})`;
        const part = seenParts(page).find(
          (found) =>
            found
              .closest('[data-edit-block]')
              ?.getAttribute('data-edit-block') === block &&
            found.getAttribute('data-edit') === path
        );
        if (!part) {
          problems.push(`${where}: gone from the page`);
          continue;
        }
        if (part.tabIndex !== 0) problems.push(`${where}: not reached by Tab`);
        const before = changes().children.length;
        await userEvent.click(part, { skipHover: true });
        if (kind === 'text' || kind === 'longText') {
          const box = canvas.queryByRole('textbox', { name: `Edit ${path}` });
          if (!box) {
            problems.push(`${where}: no text box opened`);
            continue;
          }
          if (document.activeElement !== box) {
            problems.push(`${where}: the text box didn't take the typing`);
          }
          const value = `Edited ${n}`;
          await userEvent.clear(box);
          await userEvent.keyboard(
            kind === 'text'
              ? `${value}{Enter}`
              : `${value}{Control>}{Enter}{/Control}`
          );
          const kept = `${block} ${path} = ${value}`;
          await waitFor(() =>
            expect(changes().children.length).toBeGreaterThan(before)
          ).catch(() => undefined);
          if (changes().lastElementChild?.textContent !== kept) {
            problems.push(`${where}: typing wasn't kept`);
          } else if (!page.textContent?.includes(value)) {
            problems.push(`${where}: kept, but the page doesn't show it`);
          }
          if (canvas.queryByRole('textbox')) {
            problems.push(`${where}: the text box stayed open`);
          }
        } else {
          const picked = `${block} ${path} (${kind})`;
          if (changes().lastElementChild?.textContent !== picked) {
            problems.push(`${where}: a click didn't pick it`);
          }
        }
      }

      // The words turning around the picture are drawn on a curve, where
      // they can't be typed on: a click hands them to the editor instead.
      const ring = canvasElement.querySelector<SVGElement>(
        '[data-edit-block="header"] [data-word-ring] svg [data-edit]'
      );
      if (!ring) problems.push('header wordRing: not on the page');
      else {
        await userEvent.click(ring, { skipHover: true });
        if (
          changes().lastElementChild?.textContent !== 'header wordRing (text)'
        ) {
          problems.push(
            "header wordRing: a click didn't hand it to the editor"
          );
        }
        if (canvas.queryByRole('textbox')) {
          problems.push('header wordRing: a text box opened on the curve');
        }
      }

      // Escape puts the words back.
      const name = canvasElement.querySelector<HTMLElement>(
        '[data-edit-block="text"] [data-edit="text"]'
      )!;
      const shown = name.textContent;
      await userEvent.click(name, { skipHover: true });
      const box = await canvas.findByRole('textbox', { name: 'Edit text' });
      await userEvent.clear(box);
      await userEvent.keyboard('Not this{Escape}');
      await expect(name.textContent).toBe(shown);
    } finally {
      window.removeEventListener('click', follow);
    }
    await expect(problems).toEqual([]);
    await expect(opened).toEqual([]);
  },
};
