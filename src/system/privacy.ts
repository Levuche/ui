/*
 * What each block loads from other sites, and the cookies that may come with
 * it, so a page can show an honest cookie notice, keep its privacy page
 * accurate and hold back those blocks until a visitor agrees. Each entry in
 * BLOCKS (registry.ts) has a `privacy` note made of these; `pagePrivacy`
 * adds up a whole page's. Plain data and functions, so the app's server can
 * use them too.
 */

/**
 * The kinds of cookie (or other storage in the browser) a block may lead to,
 * from least to most, as a cookie notice groups them:
 *
 * - none: none at all
 * - needed: only what the block needs to do what the visitor asked
 * - preferences: remembers a visitor's choices, such as a player's volume
 * - statistics: counts visits and plays
 * - marketing: follows the visitor across sites, for adverts
 */
export const COOKIE_KINDS = [
  'none',
  'needed',
  'preferences',
  'statistics',
  'marketing',
] as const;
export type CookieKind = (typeof COOKIE_KINDS)[number];

/** A site a block can load from, as a visitor and a privacy page name it. */
export type OutsideServiceInfo = {
  /** Its name in a sentence, as "YouTube" or "the booking site". */
  name: string;
  /**
   * The hosts the block loads from. Empty when it's whatever site the
   * creator links (a booking page, an audio file).
   */
  hosts: readonly string[];
  /** The most the service may set once it loads. */
  cookies: CookieKind;
};

/**
 * Every site a block can load something from. The players and the map load
 * only after a press; with `consent={false}` the block says first what
 * loading will share.
 */
export const OUTSIDE_SERVICES = {
  youtube: {
    name: 'YouTube',
    hosts: ['www.youtube-nocookie.com', 'i.ytimg.com'],
    cookies: 'marketing',
  },
  spotify: {
    name: 'Spotify',
    hosts: ['open.spotify.com'],
    cookies: 'marketing',
  },
  tiktok: { name: 'TikTok', hosts: ['www.tiktok.com'], cookies: 'marketing' },
  instagram: {
    name: 'Instagram',
    hosts: ['www.instagram.com'],
    cookies: 'marketing',
  },
  vimeo: { name: 'Vimeo', hosts: ['player.vimeo.com'], cookies: 'statistics' },
  soundcloud: {
    name: 'SoundCloud',
    hosts: ['w.soundcloud.com'],
    cookies: 'marketing',
  },
  applemusic: {
    name: 'Apple Music',
    hosts: ['embed.music.apple.com'],
    cookies: 'marketing',
  },
  deezer: {
    name: 'Deezer',
    hosts: ['widget.deezer.com'],
    cookies: 'marketing',
  },
  loom: { name: 'Loom', hosts: ['www.loom.com'], cookies: 'statistics' },
  twitch: {
    name: 'Twitch',
    hosts: ['player.twitch.tv'],
    cookies: 'marketing',
  },
  openstreetmap: {
    name: 'OpenStreetMap',
    hosts: ['www.openstreetmap.org'],
    cookies: 'needed',
  },
  booking: { name: 'the booking site', hosts: [], cookies: 'marketing' },
  'audio-host': {
    name: 'the site the audio is on',
    hosts: [],
    cookies: 'none',
  },
} as const satisfies Record<string, OutsideServiceInfo>;
export type OutsideService = keyof typeof OUTSIDE_SERVICES;

/** Every outside service's id, in the order a privacy page lists them. */
export const OUTSIDE_SERVICE_IDS = Object.keys(
  OUTSIDE_SERVICES
) as OutsideService[];

/** A block's privacy note, on its entry in BLOCKS. */
export type BlockPrivacy = {
  /** The other sites it can load from, in a visitor's browser. */
  services: readonly OutsideService[];
  /** The most it may set, itself or through those services. */
  cookies: CookieKind;
  /** One line a visitor can read on the privacy page. */
  reason: string;
};

/** A block's accessibility note, on its entry in BLOCKS. */
export type BlockAccessibility = {
  /** How it's used with a keyboard. */
  keyboard: string;
  /** What a screen reader hears. */
  screenReader: string;
};

/** The note for a block that loads nothing from other sites. */
export const LOADS_NOTHING = {
  services: [],
  cookies: 'none',
  reason: 'Loads nothing from other sites and sets no cookies.',
} as const satisfies BlockPrivacy;

/**
 * The note for a block that shows data the app's server fetched. Its
 * pictures come from wherever the app points them: serve them from the
 * page's own host, or pass the service to pagePrivacy.
 */
export const SERVER_FETCHED = {
  services: [],
  cookies: 'none',
  reason:
    'Shows data this site fetched on its own server; your browser doesn’t contact the service.',
} as const satisfies BlockPrivacy;

const rank = (kind: CookieKind) => COOKIE_KINDS.indexOf(kind);

/** The larger of two cookie kinds. */
export function moreCookies(a: CookieKind, b: CookieKind): CookieKind {
  return rank(a) >= rank(b) ? a : b;
}

/** True for kinds a visitor must agree to first: anything past `needed`. */
export function needsConsent(kind: CookieKind) {
  return rank(kind) > rank('needed');
}

/** The words a block shows before it loads another site. */
export type ConsentLabels = {
  /** What loading shares. {service} is filled in. */
  notice: string;
  /** The button that loads it. */
  load: string;
};

export const CONSENT_LABELS: ConsentLabels = {
  notice:
    'This loads from {service}, which will see your IP address and may set cookies.',
  load: 'Load',
};

/** The notice for one service or site, with its name filled in. */
export function consentNotice(
  service: string,
  labels?: Partial<ConsentLabels>
) {
  const words = { ...CONSENT_LABELS, ...labels };
  return words.notice.replace('{service}', service);
}

/**
 * A link's host, without "www.", to name the site in a notice; null for an
 * address on the page's own site (a path), which needs no notice.
 */
export function siteName(src: string): string | null {
  try {
    const url = new URL(src.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** A block on a page, by id, as pagePrivacy takes it. */
export type PageBlock =
  | string
  | {
      id: string;
      /**
       * The services this block really loads, in place of its registry
       * note's: the one a LinkEmbed link plays, or `youtube` when a feed's
       * thumbnails come straight from YouTube.
       */
      services?: readonly OutsideService[];
    };

/** What a page's blocks load and set, for its cookie notice and privacy page. */
export type PagePrivacy = {
  /** Each outside service the page can load, with the blocks that load it. */
  services: (OutsideServiceInfo & {
    id: OutsideService;
    blocks: string[];
  })[];
  /** The kinds of cookie the page may set, past `none`, least first. */
  cookies: CookieKind[];
  /** The blocks that load or set anything, with their reasons. */
  blocks: { id: string; reason: string }[];
  /**
   * True when the page should ask before loading: it loads another site, or
   * may set cookies past `needed`.
   */
  needsConsent: boolean;
};

/**
 * Adds up the privacy notes of a page's blocks: every outside service and
 * kind of cookie, in a fixed order. `notes` finds a block's note by id; ids
 * it doesn't know are skipped. `pagePrivacy` (registry.ts) reads BLOCKS.
 */
export function addUpPrivacy(
  blocks: readonly PageBlock[],
  notes: (id: string) => BlockPrivacy | undefined
): PagePrivacy {
  const users = new Map<OutsideService, string[]>();
  const kinds = new Set<CookieKind>();
  const reasons = new Map<string, string>();
  for (const block of blocks) {
    const id = typeof block === 'string' ? block : block.id;
    const note = notes(id);
    if (!note) continue;
    const own = typeof block === 'string' ? undefined : block.services;
    const services = own ?? note.services;
    const cookies = own
      ? own.reduce<CookieKind>(
          (most, service) =>
            moreCookies(most, OUTSIDE_SERVICES[service].cookies),
          note.services.length ? 'none' : note.cookies
        )
      : note.cookies;
    for (const service of services) {
      const list = users.get(service) ?? [];
      if (!list.includes(id)) list.push(id);
      users.set(service, list);
    }
    if (cookies !== 'none') kinds.add(cookies);
    if (services.length || cookies !== 'none') reasons.set(id, note.reason);
  }
  const services = OUTSIDE_SERVICE_IDS.filter((id) => users.has(id)).map(
    (id) => ({ id, ...OUTSIDE_SERVICES[id], blocks: users.get(id) ?? [] })
  );
  const cookies = COOKIE_KINDS.filter((kind) => kinds.has(kind));
  return {
    services,
    cookies,
    blocks: [...reasons].map(([id, reason]) => ({ id, reason })),
    needsConsent: services.length > 0 || cookies.some(needsConsent),
  };
}
