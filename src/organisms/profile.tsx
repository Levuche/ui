import type { ReactNode } from 'react';
import { Avatar } from '../atoms/avatar';
import { Block, type BlockRootProps } from '../atoms/block';
import { CheckIcon } from '../atoms/icons';
import { WordRing, type WordRingLabels } from '../molecules/word-ring';
import { cn } from '../system/cn';
import { editable } from '../system/edit';
import { toImageSource, type ImageSrc } from '../system/image';
import {
  nameLook,
  type NameCase,
  type NameColor,
  type NameWeight,
} from '../system/name-style';
import { usePageWords } from '../system/page-words';

const NAME_SIZES = {
  md: 'text-block-title',
  lg: 'text-3xl tracking-tight',
  xl: 'text-4xl tracking-tight',
} as const;

/** The tagline with `highlight` set apart in the theme's display font. */
function withHighlight(tagline: ReactNode, highlight?: string) {
  if (!highlight || typeof tagline !== 'string') return tagline;
  const at = tagline.indexOf(highlight);
  if (at < 0) return tagline;
  return (
    <>
      {tagline.slice(0, at)}
      <em className="text-site-text font-[family-name:var(--site-display-font,var(--site-font))] text-[1.15em] italic">
        {highlight}
      </em>
      {tagline.slice(at + highlight.length)}
    </>
  );
}

/** The top of a creator's page: profile picture, name, tagline and more. */
export function CreatorHeader({
  name,
  tagline,
  avatar,
  avatarSize = 76,
  avatarShape = 'circle',
  avatarRing = false,
  initialsFont = 'body',
  badge,
  verified = false,
  verifiedLabel: verifiedLabelProp,
  nameSize = 'md',
  nameColor,
  nameTint,
  nameCase,
  nameWeight,
  highlight,
  layout = 'stack',
  headingAs: Heading = 'h1',
  wordRing,
  wordRingSpeed,
  wordRingLabels,
  children,
  ...root
}: BlockRootProps & {
  name: string;
  tagline?: ReactNode;
  avatar?: ImageSrc | null;
  avatarSize?: number;
  avatarShape?: 'circle' | 'rounded' | 'square';
  avatarRing?: boolean;
  /**
   * The font of the initials shown when there's no picture: the page's own,
   * or the theme's display font.
   */
  initialsFont?: 'body' | 'display';
  /** Beside the name, after the verified tick. */
  badge?: ReactNode;
  /** A tick in the button colour beside the name. */
  verified?: boolean;
  /** What a screen reader says for the tick. */
  verifiedLabel?: string;
  /** `lg` and `xl` make the name bigger, for a page that leads with it. */
  nameSize?: 'md' | 'lg' | 'xl';
  /** The name's colour from the theme: text (as the rest), accent or links. */
  nameColor?: NameColor;
  /**
   * A colour of the creator's own for the name, in place of `nameColor`.
   * Only a plain colour is used (isSafeColor); nameColorIssue says whether
   * it can be read on the block.
   */
  nameTint?: string;
  /** `upper` writes the name in capitals; screen readers hear it as typed. */
  nameCase?: NameCase;
  /** How heavy the name is: bold if left out. */
  nameWeight?: NameWeight;
  /**
   * Words of the tagline to set apart, in italics and the theme's display
   * font. The tagline must be plain text that contains them.
   */
  highlight?: string;
  /** `stack` puts the picture above the name; `row` beside it. */
  layout?: 'stack' | 'row';
  /** 'h1' on the creator's own page; 'p' inside a preview on another page. */
  headingAs?: 'h1' | 'h2' | 'p';
  /**
   * Words that turn slowly in a ring around the picture, such as "Chai •
   * Stories • Since 2019". It has a pause button and stays still for
   * visitors who ask for less motion; screen readers hear the words once.
   */
  wordRing?: string;
  /** Seconds for one turn of the ring, at least 5. */
  wordRingSpeed?: number;
  /** What the ring's pause button says. */
  wordRingLabels?: Partial<WordRingLabels>;
  /** Under the tagline, such as social icons or a button. */
  children?: ReactNode;
}) {
  const own = usePageWords('props');
  const nameStyle = nameLook({
    color: nameColor,
    tint: nameTint,
    case: nameCase,
    weight: nameWeight,
  });
  const verifiedLabel =
    verifiedLabelProp === undefined ? own.verified : verifiedLabelProp;
  // The header is at the top of the page, so its picture loads at once.
  const source = toImageSource(avatar);
  const picture = source ? { priority: true, ...source } : null;
  const words = (
    <>
      <Heading
        className={cn(
          'm-0 inline-flex items-center gap-1.5',
          NAME_SIZES[nameSize] ?? NAME_SIZES.md,
          nameStyle.className
        )}
        style={nameStyle.style}
      >
        <span {...editable('name')}>{name}</span>
        {verified ? (
          <span
            role="img"
            aria-label={verifiedLabel}
            className="bg-site-button text-site-on-button inline-flex size-5 flex-none items-center justify-center rounded-full"
          >
            <CheckIcon size={13} strokeWidth={3} />
          </span>
        ) : null}
        {badge ? <span {...editable('badge')}>{badge}</span> : null}
      </Heading>
      {tagline ? (
        <p
          {...editable('tagline', 'longText')}
          className="text-site-text-2 m-0 text-sm"
        >
          {withHighlight(tagline, highlight)}
        </p>
      ) : null}
    </>
  );
  const avatarImage = (
    <Avatar
      name={name}
      src={picture}
      size={avatarSize}
      shape={avatarShape}
      ring={avatarRing}
      initialsFont={initialsFont}
      marks={editable('avatar', 'picture')}
    />
  );
  const photo = wordRing?.trim() ? (
    <WordRing
      words={wordRing}
      size={avatarSize}
      speed={wordRingSpeed}
      labels={wordRingLabels}
      edit="wordRing"
    >
      {avatarImage}
    </WordRing>
  ) : (
    avatarImage
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
          {photo}
          <div className="flex min-w-0 flex-col gap-1">{words}</div>
        </div>
      ) : (
        // Lines up with the block's own align. Tailwind has no items-inherit
        // class, so the style says it.
        <div className="flex flex-col gap-2" style={{ alignItems: 'inherit' }}>
          {photo}
          {words}
        </div>
      )}
      {children}
    </Block>
  );
}
