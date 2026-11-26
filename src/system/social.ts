import { contrastRatio } from './contrast';
import { SERVER_LOCALE } from './locale';
import { isSafeColor } from './theme';

/*
 * The social platforms a SocialCard can show, and what each one needs: its
 * name, its colour for the brand tint, the word on its button, what its
 * count is called, whether a handle is written with an "@", and where a
 * profile lives, so a card can link to one from the handle alone.
 *
 * Plain data and plain functions only, so they run on a server, in a browser
 * or in a test.
 */

export const SOCIAL_PLATFORMS = [
  'instagram',
  'tiktok',
  'youtube',
  'x',
  'threads',
  'linkedin',
  'facebook',
  'behance',
  'dribbble',
  'pinterest',
  'twitch',
  'discord',
  'substack',
  'medium',
  'github',
  'spotify',
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** The words a button can say; each is a key of SocialCardLabels. */
export const SOCIAL_ACTIONS = [
  'follow',
  'subscribe',
  'connect',
  'addFriend',
  'join',
  'message',
] as const;
export type SocialAction = (typeof SOCIAL_ACTIONS)[number];

/** What a platform's count is called; each is a key of SocialCardLabels. */
export const SOCIAL_COUNTS = [
  'followers',
  'subscribers',
  'members',
  'connections',
] as const;
export type SocialCount = (typeof SOCIAL_COUNTS)[number];

export type SocialPlatformInfo = {
  /** The platform's own name, as visitors know it. */
  name: string;
  /**
   * Its colour, for the brand tint. Some are a shade deeper than the logo's
   * so the words on the button can still be read (4.5:1).
   */
  color: string;
  /** The button's word unless the creator picks another. */
  action: SocialAction;
  /** What its count is called unless the creator says otherwise. */
  count: SocialCount;
  /** Handles are written "@name" there. */
  at: boolean;
  /**
   * The profile address for a plain handle, or null when the handle can't
   * be one there or a handle isn't enough.
   */
  profile: ((handle: string) => string | null) | null;
};

export const SOCIAL_PLATFORM_INFO: Record<SocialPlatform, SocialPlatformInfo> =
  {
    instagram: {
      name: 'Instagram',
      color: '#c13584',
      action: 'follow',
      count: 'followers',
      at: true,
      profile: (h) => `https://www.instagram.com/${h}/`,
    },
    tiktok: {
      name: 'TikTok',
      color: '#000000',
      action: 'follow',
      count: 'followers',
      at: true,
      profile: (h) => `https://www.tiktok.com/@${h}`,
    },
    youtube: {
      name: 'YouTube',
      color: '#cc0000',
      action: 'subscribe',
      count: 'subscribers',
      at: true,
      profile: (h) => `https://www.youtube.com/@${h}`,
    },
    x: {
      name: 'X',
      color: '#000000',
      action: 'follow',
      count: 'followers',
      at: true,
      profile: (h) => `https://x.com/${h}`,
    },
    threads: {
      name: 'Threads',
      color: '#000000',
      action: 'follow',
      count: 'followers',
      at: true,
      profile: (h) => `https://www.threads.net/@${h}`,
    },
    linkedin: {
      name: 'LinkedIn',
      color: '#0a66c2',
      action: 'connect',
      count: 'followers',
      at: false,
      profile: (h) => `https://www.linkedin.com/in/${h}/`,
    },
    facebook: {
      name: 'Facebook',
      color: '#0866ff',
      action: 'follow',
      count: 'followers',
      at: false,
      profile: (h) => `https://www.facebook.com/${h}`,
    },
    behance: {
      name: 'Behance',
      color: '#0057ff',
      action: 'follow',
      count: 'followers',
      at: false,
      profile: (h) => `https://www.behance.net/${h}`,
    },
    dribbble: {
      name: 'Dribbble',
      color: '#c32361',
      action: 'follow',
      count: 'followers',
      at: false,
      profile: (h) => `https://dribbble.com/${h}`,
    },
    pinterest: {
      name: 'Pinterest',
      color: '#e60023',
      action: 'follow',
      count: 'followers',
      at: true,
      profile: (h) => `https://www.pinterest.com/${h}/`,
    },
    twitch: {
      name: 'Twitch',
      color: '#9146ff',
      action: 'follow',
      count: 'followers',
      at: false,
      profile: (h) => `https://www.twitch.tv/${h}`,
    },
    discord: {
      name: 'Discord',
      color: '#5865f2',
      action: 'join',
      count: 'members',
      at: false,
      // A server is joined by its invite link, which a name doesn't give.
      profile: null,
    },
    substack: {
      name: 'Substack',
      color: '#ff6719',
      action: 'subscribe',
      count: 'subscribers',
      at: true,
      // A publication's name is its subdomain: letters, digits and hyphens.
      profile: (h) =>
        /^[A-Za-z0-9-]+$/.test(h) && !/^-|-$/.test(h)
          ? `https://${h.toLowerCase()}.substack.com/`
          : null,
    },
    medium: {
      name: 'Medium',
      color: '#000000',
      action: 'follow',
      count: 'followers',
      at: true,
      profile: (h) => `https://medium.com/@${h}`,
    },
    github: {
      name: 'GitHub',
      color: '#181717',
      action: 'follow',
      count: 'followers',
      at: true,
      profile: (h) => `https://github.com/${h}`,
    },
    spotify: {
      name: 'Spotify',
      color: '#1db954',
      action: 'follow',
      count: 'followers',
      at: false,
      // Artists and podcasts are found by an id, not a name.
      profile: null,
    },
  };

/** True when `value` is one of SOCIAL_PLATFORMS. */
export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return SOCIAL_PLATFORMS.includes(value as SocialPlatform);
}

/**
 * A handle as the creator typed it, made plain: spaces trimmed, a pasted "@"
 * dropped, and cut to 100 characters. Null when nothing is left.
 */
export function cleanHandle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const handle = Array.from(value.trim().replace(/^@+/, '').trim())
    .slice(0, 100)
    .join('');
  return handle || null;
}

/** The handle as the platform writes it, as "@asha.cooks" on Instagram. */
export function socialHandleText(
  platform: SocialPlatform,
  handle: unknown
): string | null {
  const plain = cleanHandle(handle);
  if (!plain) return null;
  return SOCIAL_PLATFORM_INFO[platform]?.at ? `@${plain}` : plain;
}

/**
 * The profile's address from its handle, or null when the handle isn't a
 * plain username (letters, digits, dots, underscores and hyphens, up to 60)
 * or the platform needs more than a name (Discord, Spotify). Nothing else
 * goes into the address, so a handle can't add a host, a path or a query.
 */
export function socialProfileHref(
  platform: SocialPlatform,
  handle: unknown
): string | null {
  const plain = cleanHandle(handle);
  const profile = SOCIAL_PLATFORM_INFO[platform]?.profile;
  if (!plain || !profile) return null;
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,58}[A-Za-z0-9_])?$/.test(plain)) {
    return null;
  }
  if (/\.\./.test(plain)) return null;
  return profile(plain);
}

/** Text on the brand colour: white, or near-black when that reads better. */
export const SOCIAL_ON_LIGHT = '#111111';
export const SOCIAL_ON_DARK = '#ffffff';

/**
 * The colours for a brand tint: the brand colour and the colour for words on
 * it, whichever of white and near-black reads better. `color` is the
 * creator's own colour, used when it's a plain one (see isSafeColor);
 * otherwise the platform's. Null for an unknown platform with no colour.
 */
export function socialTint(
  platform: SocialPlatform,
  color?: string | null
): { color: string; on: string } | null {
  const own = typeof color === 'string' && isSafeColor(color);
  const brand = own ? color.trim() : SOCIAL_PLATFORM_INFO[platform]?.color;
  if (!brand) return null;
  const light = contrastRatio(SOCIAL_ON_DARK, brand) ?? 0;
  const dark = contrastRatio(SOCIAL_ON_LIGHT, brand) ?? 0;
  return { color: brand, on: light >= dark ? SOCIAL_ON_DARK : SOCIAL_ON_LIGHT };
}

/**
 * A count written short in the visitor's way, as "1.1K", "860K" or "2.4M".
 * Formats with SERVER_LOCALE unless `locale` is given, so the server and the
 * browser write the same. Empty for anything that isn't a count.
 */
export function shortCount(value: unknown, locale: string = SERVER_LOCALE) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return '';
  }
  try {
    return new Intl.NumberFormat(locale, { notation: 'compact' }).format(value);
  } catch {
    // An unknown locale tag: fall back rather than break the page.
    return new Intl.NumberFormat(SERVER_LOCALE, {
      notation: 'compact',
    }).format(value);
  }
}
