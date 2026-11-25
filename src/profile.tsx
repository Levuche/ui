import type { ReactNode } from 'react';
import { cn } from './cn';

/** First letters of up to two words: "Desi Origins" becomes "DO". */
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * The creator's round profile picture, or their initials when there is no
 * picture. Decorative, since their name is shown next to it.
 */
export function Avatar({
  name,
  src,
  size = 48,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size / 3) };
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        style={style}
        className={cn('flex-none rounded-full object-cover', className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        'inline-flex flex-none items-center justify-center rounded-full font-bold',
        'bg-site-accent text-site-on-accent',
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

/** The top of a creator's page: profile picture, name and tagline. */
export function CreatorHeader({
  name,
  tagline,
  avatar,
  avatarSize = 76,
  align = 'center',
  headingAs: Heading = 'h1',
  className,
}: {
  name: string;
  tagline?: ReactNode;
  avatar?: string | null;
  avatarSize?: number;
  align?: 'center' | 'start';
  /** 'h1' on the creator's own page; 'p' inside a preview on another page. */
  headingAs?: 'h1' | 'h2' | 'p';
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-2',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className
      )}
    >
      <Avatar name={name} src={avatar} size={avatarSize} />
      <Heading className="text-site-text m-0 text-lg font-bold">{name}</Heading>
      {tagline ? (
        <p className="text-site-text-2 m-0 text-[13px]">{tagline}</p>
      ) : null}
    </header>
  );
}
