import type { ReactNode } from 'react';
import { Avatar } from '../atoms/avatar';
import { Block, type BlockRootProps } from '../atoms/block';
import { toImageSource, type ImageSrc } from '../system/image';

/** The top of a creator's page: profile picture, name, tagline and more. */
export function CreatorHeader({
  name,
  tagline,
  avatar,
  avatarSize = 76,
  avatarShape = 'circle',
  avatarRing = false,
  badge,
  layout = 'stack',
  headingAs: Heading = 'h1',
  children,
  ...root
}: BlockRootProps & {
  name: string;
  tagline?: ReactNode;
  avatar?: ImageSrc | null;
  avatarSize?: number;
  avatarShape?: 'circle' | 'rounded' | 'square';
  avatarRing?: boolean;
  /** Beside the name, such as a verified mark. */
  badge?: ReactNode;
  /** `stack` puts the picture above the name; `row` beside it. */
  layout?: 'stack' | 'row';
  /** 'h1' on the creator's own page; 'p' inside a preview on another page. */
  headingAs?: 'h1' | 'h2' | 'p';
  /** Under the tagline, such as social icons or a button. */
  children?: ReactNode;
}) {
  // The header is at the top of the page, so its picture loads at once.
  const source = toImageSource(avatar);
  const picture = source ? { priority: true, ...source } : null;
  const words = (
    <>
      <Heading className="text-site-text text-block-title m-0 inline-flex items-center gap-1.5 font-bold">
        {name}
        {badge}
      </Heading>
      {tagline ? (
        <p className="text-site-text-2 m-0 text-sm">{tagline}</p>
      ) : null}
    </>
  );
  return (
    <Block
      as="header"
      name="creator-header"
      defaults={{ tone: 'plain', align: 'center' }}
      {...root}
    >
      {layout === 'row' ? (
        <div className="flex items-center gap-3 text-start">
          <Avatar
            name={name}
            src={picture}
            size={avatarSize}
            shape={avatarShape}
            ring={avatarRing}
          />
          <div className="flex min-w-0 flex-col gap-1">{words}</div>
        </div>
      ) : (
        <div className="items-[inherit] flex flex-col gap-2">
          <Avatar
            name={name}
            src={picture}
            size={avatarSize}
            shape={avatarShape}
            ring={avatarRing}
          />
          {words}
        </div>
      )}
      {children}
    </Block>
  );
}
