/*
 * The little text format a creator writes in a text block. It is read into
 * plain data and drawn as React elements, never as HTML, so nothing a
 * creator types can add tags, scripts or styles to the page. Links go
 * through SiteLink, which drops any address that isn't safe.
 *
 *   **bold**  *italic* or _italic_  [words](https://example.com)
 *   - a bullet (or * or •)          1. a numbered item (or 1))
 *
 * A blank line starts a new paragraph and a single line break stays a line
 * break. A link written out in full (https://…) becomes a link by itself.
 * A backslash before * _ [ ] ( ) or \ keeps it as it is. Emoji are just
 * text. Plain functions only, so this runs on a server or in a test.
 */

/** A run of text inside a paragraph or list item. */
export type RichInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: RichInline[] }
  | { type: 'em'; children: RichInline[] }
  | { type: 'link'; href: string; children: RichInline[] };

/** One line of runs. */
export type RichLine = RichInline[];

/** A paragraph (its lines) or a list (its items). */
export type RichBlock =
  | { type: 'paragraph'; lines: RichLine[] }
  | { type: 'list'; ordered: boolean; start: number; items: RichLine[] };

/** The most text read; anything longer is cut, so a page can't stall. */
export const RICH_TEXT_MAX_LENGTH = 20_000;

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*(\d{1,6})[.)]\s+(.*)$/;
const ESCAPABLE = '*_[]()\\';
const URL = /^https?:\/\/[^\s<>"]+/i;
const WORD = /[\p{L}\p{N}]/u;
/** How far a mark or link may reach for its closing half. */
const REACH = 2000;
/** How deep marks may sit inside each other; deeper ones stay as typed. */
const MAX_DEPTH = 8;

/** Reads a creator's text into paragraphs and lists. */
export function parseRichText(text: string | null | undefined): RichBlock[] {
  if (typeof text !== 'string') return [];
  const lines = text
    .slice(0, RICH_TEXT_MAX_LENGTH)
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const blocks: RichBlock[] = [];
  // The block being added to: the last one, unless a blank line ended it.
  let open = false;
  for (const line of lines) {
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const last = open ? blocks.at(-1) : undefined;
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const words = parseInline((bullet ? bullet[1] : numbered![2])!.trim());
      if (last?.type === 'list' && last.ordered === ordered) {
        last.items.push(words);
      } else {
        blocks.push({
          type: 'list',
          ordered,
          start: numbered ? Number(numbered[1]) : 1,
          items: [words],
        });
      }
      open = true;
    } else if (line.trim() === '') {
      open = false;
    } else {
      const words = parseInline(line.trim());
      if (last?.type === 'paragraph') last.lines.push(words);
      else blocks.push({ type: 'paragraph', lines: [words] });
      open = true;
    }
  }
  return blocks;
}

/** Where `mark` closes after `from`, skipping escaped characters, or -1. */
function findClose(src: string, mark: string, from: number) {
  const last = Math.min(src.length, from + REACH);
  for (let i = from; i < last; i++) {
    if (src[i] === '\\') {
      i++;
      continue;
    }
    if (!src.startsWith(mark, i)) continue;
    // A single * never closes on half of a **.
    if (mark === '*' && src[i + 1] === '*') {
      i++;
      continue;
    }
    // In a run of three (***), ** closes on the last two.
    if (mark === '**' && src[i + 2] === '*') continue;
    return i;
  }
  return -1;
}

/** Where the bracket opened at `open` closes, counting nested ones, or -1. */
function findBracket(src: string, open: number, left: string, right: string) {
  const last = Math.min(src.length, open + REACH);
  let depth = 0;
  for (let i = open; i < last; i++) {
    if (src[i] === '\\') {
      i++;
      continue;
    }
    if (src[i] === left) depth++;
    else if (src[i] === right && --depth === 0) return i;
  }
  return -1;
}

const unescape = (value: string) =>
  value.replace(/\\([*_[\]()\\])/g, (_, char: string) => char);

/** Reads bold, italic and links in one line of text. */
export function parseInline(
  src: string,
  inLink = false,
  depth = 0
): RichInline[] {
  if (depth > MAX_DEPTH)
    return src ? [{ type: 'text', text: unescape(src) }] : [];
  const out: RichInline[] = [];
  let text = '';
  const push = (node: RichInline) => {
    if (text) out.push({ type: 'text', text });
    text = '';
    out.push(node);
  };
  let i = 0;
  while (i < src.length) {
    const char = src[i]!;
    if (char === '\\' && ESCAPABLE.includes(src[i + 1] ?? '')) {
      text += src[i + 1];
      i += 2;
      continue;
    }
    if (src.startsWith('**', i)) {
      const end = findClose(src, '**', i + 2);
      if (end > i + 2) {
        push({
          type: 'strong',
          children: parseInline(src.slice(i + 2, end), inLink, depth + 1),
        });
        i = end + 2;
        continue;
      }
    }
    if (char === '*' || char === '_') {
      // _ inside a word (snake_case) stays as it is.
      const before = src[i - 1] ?? '';
      const opens = char === '*' || !WORD.test(before);
      const end = opens ? findClose(src, char, i + 1) : -1;
      const inner = end > i + 1 ? src.slice(i + 1, end) : '';
      const after = src[end + 1] ?? '';
      if (
        inner.trim() === inner &&
        inner !== '' &&
        (char === '*' || !WORD.test(after))
      ) {
        push({ type: 'em', children: parseInline(inner, inLink, depth + 1) });
        i = end + 1;
        continue;
      }
    }
    if (char === '[' && !inLink) {
      const close = findBracket(src, i, '[', ']');
      if (close > i + 1 && src[close + 1] === '(') {
        const end = findBracket(src, close + 1, '(', ')');
        if (end > close + 2) {
          push({
            type: 'link',
            href: unescape(src.slice(close + 2, end).trim()),
            children: parseInline(src.slice(i + 1, close), true, depth + 1),
          });
          i = end + 1;
          continue;
        }
      }
    }
    if ((char === 'h' || char === 'H') && !inLink) {
      const before = src[i - 1] ?? '';
      const url = WORD.test(before) ? null : URL.exec(src.slice(i));
      if (url) {
        // Punctuation at the end belongs to the sentence, not the link.
        let href = trimEnd(url[0], ".,;:!?'’");
        // A ) closes the link only if the link opened one.
        while (
          href.endsWith(')') &&
          (href.match(/\(/g)?.length ?? 0) < (href.match(/\)/g)?.length ?? 0)
        ) {
          href = href.slice(0, -1);
        }
        push({ type: 'link', href, children: [{ type: 'text', text: href }] });
        i += href.length;
        continue;
      }
    }
    text += char;
    i++;
  }
  if (text) out.push({ type: 'text', text });
  return out;
}

/** The plain words of a creator's text, without marks, as for a summary. */
export function richTextWords(text: string | null | undefined): string {
  const words = (nodes: RichInline[]): string =>
    nodes
      .map((node) => (node.type === 'text' ? node.text : words(node.children)))
      .join('');
  return parseRichText(text)
    .map((block) =>
      (block.type === 'list' ? block.items : block.lines).map(words).join('\n')
    )
    .join('\n\n');
}

/**
 * An id a page can link to (#my-works), from what a creator typed or a
 * heading's words: lower case letters (in any script), digits and hyphens,
 * at most 64 characters. Empty when nothing usable is left.
 */
export function anchorId(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  const id = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-');
  return trimEnd(trimStart(id, '-').slice(0, 64), '-');
}

/** `value` without any of `chars` at its start. A loop, not a regex, so long runs stay fast. */
function trimStart(value: string, chars: string): string {
  let start = 0;
  while (start < value.length && chars.includes(value[start]!)) start++;
  return value.slice(start);
}

/** `value` without any of `chars` at its end. */
function trimEnd(value: string, chars: string): string {
  let end = value.length;
  while (end > 0 && chars.includes(value[end - 1]!)) end--;
  return value.slice(0, end);
}
