import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';
import { Thumb } from './thumb';

const isExternal = (href: string) => /^https?:\/\//i.test(href);
const newTab = (href: string) =>
  isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

/**
 * A link on the creator's page, such as their YouTube channel or an app.
 * Links to other sites open in a new tab.
 */
export function LinkTile({
  icon,
  detail,
  href,
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  icon?: ReactNode;
  /** A second line, such as "New video every Friday". */
  detail?: ReactNode;
}) {
  return (
    <a
      href={href}
      {...newTab(href)}
      className={cn(
        'bg-site-surface text-site-text rounded-site flex min-h-14 items-center gap-3 p-3 font-semibold no-underline',
        className
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden
          className="bg-site-surface-2 flex size-10 flex-none items-center justify-center rounded-[calc(var(--site-radius)*0.6)]"
        >
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        {children}
        {detail ? (
          <span className="text-site-text-2 text-sm font-normal">{detail}</span>
        ) : null}
      </span>
    </a>
  );
}

/** A column of links, as on a link-in-bio page. */
export function LinkList({
  links,
  label = 'Links',
  className,
}: {
  links: {
    label: string;
    href: string;
    icon?: ReactNode;
    detail?: ReactNode;
  }[];
  /** Accessible name for the list. */
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {links.map((link, i) => (
          <li key={`${i}-${link.href}`} className="m-0">
            <LinkTile href={link.href} icon={link.icon} detail={link.detail}>
              {link.label}
            </LinkTile>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * A link shown big: a 16:9 picture over its title, for the one link a creator
 * wants seen first (a new video, a launch).
 */
export function FeaturedLink({
  href,
  title,
  detail,
  image,
  imageAlt = '',
  className,
}: {
  href: string;
  title: string;
  detail?: ReactNode;
  image?: string | null;
  /** Leave empty when the picture only repeats the title. */
  imageAlt?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      {...newTab(href)}
      className={cn(
        'bg-site-surface text-site-text rounded-site flex flex-col overflow-hidden no-underline',
        className
      )}
    >
      <Thumb src={image} alt={imageAlt} className="aspect-video w-full" />
      <span className="flex flex-col gap-0.5 p-3">
        <span className="font-semibold">{title}</span>
        {detail ? (
          <span className="text-site-text-2 text-sm">{detail}</span>
        ) : null}
      </span>
    </a>
  );
}

/** A row of round icon links to the creator's social accounts. */
export function SocialIcons({
  links,
  label = 'Social accounts',
  className,
}: {
  /** `label` names each link for screen readers, as "Instagram". */
  links: { label: string; href: string; icon: ReactNode }[];
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="m-0 flex list-none flex-wrap justify-center gap-1 p-0">
        {links.map((link, i) => (
          <li key={`${i}-${link.href}`} className="m-0">
            <a
              href={link.href}
              aria-label={link.label}
              title={link.label}
              {...newTab(link.href)}
              className="text-site-text hover:bg-site-surface size-control-md inline-flex items-center justify-center rounded-full"
            >
              {link.icon}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
