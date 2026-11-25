import { cn } from './cn';

/** The page footer: policy links and "Made with Levuche". */
export function CreatorFooter({
  links,
  className,
}: {
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <footer
      className={cn(
        'border-site-border text-site-text-2 flex flex-wrap justify-between gap-3 border-t px-[18px] py-3 text-xs',
        className
      )}
    >
      <nav aria-label="Site policies" className="flex gap-3">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="text-site-link">
            {link.label}
          </a>
        ))}
      </nav>
      <span>Made with Levuche</span>
    </footer>
  );
}
