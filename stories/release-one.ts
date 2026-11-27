import { SAMPLE_PICTURE } from './block-samples';
import { SAMPLE_SOCIALS } from './sample-page';

/*
 * What the editor stories share: release 1's blocks, filled in as a
 * creator's page would have them, and how the editor reads and sets a
 * block's settings by path.
 */

export type Props = Record<string, unknown>;

/** `props` with the setting at `path` ("links.0.label") set to `value`. */
export function setAt(props: Props, path: string, value: string): Props {
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
export function readAt(props: Props, path: string): string | undefined {
  const value = path
    .split('.')
    .reduce<unknown>((at, key) => (at as Props | undefined)?.[key], props);
  return typeof value === 'string' ? value : undefined;
}

/*
 * The blocks release 1 offers in the app's "Add a block" menu, with every
 * setting a visitor can see filled in, as a creator's page would have them.
 */
export const RELEASE_ONE: Record<string, Props> = {
  header: {
    name: 'Asha Menon',
    tagline: 'Recipes and stories from a Kerala kitchen. New book out now.',
    highlight: 'New book',
    avatar: SAMPLE_PICTURE,
    verified: true,
    verifiedLabel: 'Verified creator',
    badge: 'Home cook',
    wordRing: 'cook · write · share · ',
  },
  social: {
    // The icons come from the app, by each account's address.
    links: SAMPLE_SOCIALS.slice(0, 2),
    label: 'Asha on social media',
  },
  links: {
    links: [
      {
        label: 'My cookbook',
        href: 'https://example.com/book',
        detail: 'Sixty recipes from home',
        image: SAMPLE_PICTURE,
        imageAlt: 'The book’s cover',
        trailing: 'New',
      },
      {
        label: 'Weekly newsletter',
        href: 'https://example.com/news',
        detail: 'A recipe every Sunday',
        favicon: SAMPLE_PICTURE,
      },
    ],
    label: 'Asha’s links',
  },
  text: {
    text: 'Hello! I cook the food I grew up with.\nAsk me anything about spices.',
  },
  picture: {
    src: SAMPLE_PICTURE,
    alt: 'A pot of fish curry',
    caption: 'Sunday’s fish curry',
    href: 'https://example.com/curry',
  },
};
