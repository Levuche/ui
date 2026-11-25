import type {
  ComponentPropsWithoutRef,
  ComponentType,
  CSSProperties,
  ElementType,
  Ref,
} from 'react';
import { cn } from '../system/cn';
import { lookProps, splitLook, type BlockLook } from '../system/look';

/** The elements a block can be. */
export type BlockTag =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'figure'
  | 'form'
  | 'header'
  | 'footer'
  | 'nav';

/** `data-*` attributes, passed through to the block's element. */
export type DataAttributes = { [key: `data-${string}`]: string | undefined };

/**
 * What every block takes on its outermost element besides its content: the
 * creator's look (tone, size, corners, colours, motion...), plus an id, a
 * class, a style, a ref and data attributes for the app.
 */
export type BlockRootProps = BlockLook &
  DataAttributes & {
    id?: string;
    className?: string;
    style?: CSSProperties;
    ref?: Ref<HTMLElement>;
  };

/**
 * The box every block is built on: it puts the creator's look on one element
 * and lays out what's inside as a column with the block's gap.
 *
 *   <Block name="booking-card" as="article" tone="accent">...</Block>
 *
 * The look reaches everything inside through CSS variables, not React
 * context, so a Block renders on the server as well as in the browser.
 */
export function Block({
  as = 'div',
  name,
  defaults,
  className,
  style,
  ...props
}: BlockLook &
  Omit<ComponentPropsWithoutRef<'form'>, 'color'> & {
    as?: BlockTag;
    /** The block's id from the registry, written as data-block. */
    name: string;
    /** The block's own look where the creator set none. */
    defaults?: BlockLook;
    ref?: Ref<HTMLElement>;
  }) {
  const [look, rest] = splitLook(props);
  const looks = lookProps(
    name,
    look,
    defaults,
    cn('flex flex-col gap-block-gap text-block', className)
  );
  const Tag = as as ElementType;
  return <Tag {...rest} {...looks} style={{ ...looks.style, ...style }} />;
}

/**
 * Gives any component the block look: the creator's tone, size, corners,
 * colours and motion, the same as the built-in blocks. For an app's own
 * blocks; the component must pass className, style and data-* props to its
 * outermost element.
 *
 *   const MyQuote = withBlockLook(Quote, 'my-quote', { tone: 'muted' });
 *   <MyQuote tone="accent" size="lg" text="..." />
 */
export function withBlockLook<
  P extends { className?: string; style?: CSSProperties },
>(Component: ComponentType<P>, name: string, defaults?: BlockLook) {
  function WithBlockLook(props: P & BlockLook) {
    const [look, rest] = splitLook(props);
    const looks = lookProps(name, look, defaults, rest.className);
    return (
      <Component
        {...(rest as unknown as P)}
        {...looks}
        style={{ ...looks.style, ...rest.style }}
      />
    );
  }
  WithBlockLook.displayName = `withBlockLook(${
    Component.displayName ?? Component.name ?? 'Component'
  })`;
  return WithBlockLook;
}
