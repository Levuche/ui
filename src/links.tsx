import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

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
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
