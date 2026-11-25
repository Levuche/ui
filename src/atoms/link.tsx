import type { AnchorHTMLAttributes, Ref } from 'react';
import { linkAttrs, type LinkBehavior } from '../system/href';

/**
 * A link on a creator's page. It checks the address first: a link that isn't
 * safe (javascript: and the like) shows its words without a link. Other
 * sites open in a new tab unless `newTab` says otherwise. `action` names the
 * click for analytics (see useBlockActions), such as "buy".
 */
export function SiteLink({
  href,
  newTab,
  sponsored,
  nofollow,
  action,
  children,
  className,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  LinkBehavior & {
    href: string | null | undefined;
    action?: string;
    ref?: Ref<HTMLAnchorElement>;
  }) {
  const attrs = linkAttrs(href, { newTab, sponsored, nofollow });
  if (!attrs) {
    return (
      <span className={className} data-unsafe-link="">
        {children}
      </span>
    );
  }
  return (
    <a
      {...props}
      {...attrs}
      {...(action ? { 'data-action': action } : {})}
      className={className}
    >
      {children}
    </a>
  );
}
