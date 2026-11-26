import { usePageWords } from '../system/page-words';
import { consentNotice, siteName, type ConsentLabels } from '../system/privacy';

/**
 * Whether a file on another site waits for the visitor: `consent` is false
 * and `src` is a web address. A file on the page's own site never waits.
 */
export function mediaWaits(src: string, consent: boolean | undefined) {
  return consent === false && siteName(src) !== null;
}

/**
 * The line under an audio or video player, when the visitor hasn't agreed
 * to the sites its files are on. Nothing downloads before play, so play is
 * the agreement.
 */
export function MediaNotice({
  sources,
  consent,
  consentLabels,
}: {
  /** The files' addresses. */
  sources: string[];
  consent?: boolean;
  consentLabels?: Partial<ConsentLabels>;
}) {
  const consentWords = usePageWords('consent', consentLabels);
  if (consent !== false) return null;
  const sites = [
    ...new Set(sources.map(siteName).filter((s): s is string => !!s)),
  ];
  if (!sites.length) return null;
  return (
    <p data-consent="pending" className="text-site-text-2 m-0 text-sm">
      {consentNotice(sites.join(', '), consentWords)}
    </p>
  );
}
