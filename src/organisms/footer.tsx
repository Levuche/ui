import type { ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import { SiteLink } from '../atoms/link';
import { cn } from '../system/cn';
import { usePageWords } from '../system/page-words';

/** The page footer: policy links and "Made with Levuche". */
export function CreatorFooter({
  links,
  label: labelProp,
  credit: creditProp,
  creditHref,
  ...root
}: BlockRootProps & {
  links: { label: string; href: string }[];
  /** The policy links' name for screen readers. */
  label?: string;
  /** The words at the end; `null` for none. */
  credit?: ReactNode;
  /** Makes the credit a link. */
  creditHref?: string;
}) {
  const own = usePageWords('props');
  const label = labelProp === undefined ? own.policies : labelProp;
  const credit = creditProp === undefined ? own.madeWith : creditProp;
  return (
    <Block
      as="footer"
      name="creator-footer"
      defaults={{ tone: 'plain', radius: 'none' }}
      {...root}
      className={cn(
        'border-site-border text-site-text-2 flex-row flex-wrap justify-between gap-3 border-t px-4 py-3 text-xs',
        root.className
      )}
    >
      <nav aria-label={label} className="flex flex-wrap gap-3">
        {links.map((link) => (
          <SiteLink
            key={`${link.label} ${link.href}`}
            href={link.href}
            className="text-site-link"
          >
            {link.label}
          </SiteLink>
        ))}
      </nav>
      {credit ? (
        creditHref ? (
          <SiteLink href={creditHref} className="text-site-text-2">
            {credit}
          </SiteLink>
        ) : (
          <span>{credit}</span>
        )
      ) : null}
    </Block>
  );
}
