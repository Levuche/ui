import * as ui from '../src';
import { BLOCKS, type BlockInfo } from '../src/system/registry';
import type { SettingField } from '../src/system/settings';

/*
 * A value for every setting of every block, made from its field: the tests
 * render each block with all of them set, then each choice option and each
 * toggle in turn. Links are plain https addresses unless a block needs one
 * from a site it knows (LINKS).
 */

/** A start time a week after the tests' clock, so nothing has passed. */
export const SAMPLE_NOW = Date.UTC(2026, 11, 1, 9, 0, 0);
const LATER = new Date(SAMPLE_NOW + 7 * 86_400_000).toISOString();

/**
 * Values a block needs in its own form: links from a site it knows, times
 * as "09:00", prices it can compare.
 */
const BLOCK_SAMPLES: Record<string, Record<string, unknown>> = {
  'local-time': { from: '09:00', to: '17:00' },
  'event-card': { soldOut: false },
  'message-card': { channel: 'email', to: 'hello@example.com' },
  'youtube-video': { video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  'spotify-embed': {
    url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
  },
  'soundcloud-embed': {
    url: 'https://soundcloud.com/desi-origins/chai-at-dawn',
  },
  'apple-music-embed': {
    url: 'https://music.apple.com/us/album/chai-at-dawn/1440857781',
  },
  'deezer-embed': { url: 'https://www.deezer.com/en/track/3135556' },
  'tiktok-video': {
    url: 'https://www.tiktok.com/@chef/video/7212345678901234567',
  },
  'instagram-post': { url: 'https://www.instagram.com/reel/C1a2B3c4D5e/' },
  'link-embed': { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  'calendar-embed': {
    src: 'https://calendar.google.com/calendar/embed?src=c_8f1e2d3c4b5a%40group.calendar.google.com',
  },
  'ticket-embed': {
    src: 'https://luma.com/embed/event/evt-AbC123xyz/simple',
  },
};

/** Text settings that take a code, not words. */
const NAMED: Record<string, unknown> = {
  timeZone: 'Asia/Kolkata',
  visitorTimeZone: 'America/New_York',
  currency: 'EUR',
  // A word of the sample tagline, "Sample tagline 1".
  highlight: 'tagline',
  price: '$10',
  was: '$20',
  yearlyPrice: '$100',
  lang: 'en',
  font: "'Sora', sans-serif",
};

const AT = new Date(SAMPLE_NOW - 86_400_000).toISOString();
const SITE = 'https://example.com';

/** The data the app fetches for a block, as it would hand it over. */
export const APP_DATA: Record<string, Record<string, unknown>> = {
  'slot-picker': {
    data: [10, 11, 14].map((hour) =>
      new Date(SAMPLE_NOW + 86_400_000 + hour * 3_600_000).toISOString()
    ),
    defaultValue: new Date(
      SAMPLE_NOW + 86_400_000 + 10 * 3_600_000
    ).toISOString(),
  },
  'latest-videos': {
    data: [1, 2, 3, 4, 5].map((n) => ({
      title: `Video ${n}`,
      href: `${SITE}/videos/${n}`,
      thumbnail: `${SITE}/thumbs/${n}.jpg`,
      detail: `${n}K views`,
    })),
  },
  'latest-posts': {
    data: [1, 2, 3, 4, 5].map((n) => ({
      title: `Post ${n}`,
      // On the creator's own site, so "new tab" is the creator's choice.
      href: `/posts/${n}`,
      date: '1 Dec 2026',
      dateTime: AT,
      excerpt: `What post ${n} is about.`,
      image: `${SITE}/posts/${n}.jpg`,
    })),
  },
  'live-status': {
    data: {
      live: true,
      channel: 'desiorigins',
      url: 'https://www.twitch.tv/desiorigins',
      title: 'Cooking live',
      viewers: 120,
      schedule: 'Fridays at 7 PM',
    },
  },
  'review-summary': {
    data: {
      rating: 4.6,
      count: 120,
      url: `${SITE}/reviews`,
      reviews: [1, 2, 3, 4, 5].map((n) => ({
        author: `Reviewer ${n}`,
        rating: 5 - (n % 2),
        text: `Review ${n}.`,
        date: '2026-11-0' + n,
      })),
    },
  },
  'github-profile': {
    data: {
      login: 'desiorigins',
      name: 'Desi Origins',
      avatarUrl: `${SITE}/avatar.png`,
      bio: 'Food stories.',
      followers: 1200,
      publicRepos: 12,
      stars: 340,
      url: 'https://github.com/desiorigins',
    },
  },
  'contribution-graph': {
    data: {
      weeks: Array.from({ length: 53 }, (_, w) =>
        Array.from({ length: 7 }, (_, d) => (w * 7 + d) % 5)
      ),
      total: 700,
      currentStreak: 4,
      longestStreak: 21,
    },
  },
  'repo-card': {
    data: {
      name: 'recipes',
      owner: 'desiorigins',
      description: 'Every recipe.',
      stars: 40,
      forks: 3,
      language: 'TypeScript',
      languageColor: '#3178c6',
      url: 'https://github.com/desiorigins/recipes',
    },
  },
  'repo-list': {
    data: [1, 2, 3, 4, 5, 6, 7].map((n) => ({
      name: `repo-${n}`,
      description: `Repo ${n}.`,
      stars: n * 10,
      forks: n,
      language: 'TypeScript',
      url: `https://github.com/desiorigins/repo-${n}`,
    })),
  },
  'package-stats': {
    data: {
      name: '@desi/recipes',
      version: '1.2.0',
      weeklyDownloads: 1200,
      history: [1, 2, 3, 4, 5, 6, 7, 8],
      url: 'https://www.npmjs.com/package/@desi/recipes',
    },
  },
  'podcast-episodes': {
    data: [1, 2, 3, 4, 5].map((n) => ({
      title: `Episode ${n}`,
      audioUrl: `${SITE}/audio/${n}.mp3`,
      detail: '30 min',
      href: `${SITE}/episodes/${n}`,
      image: `${SITE}/episodes/${n}.jpg`,
    })),
  },
  'social-card': {
    posts: {
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
        href: `https://www.instagram.com/p/post${n}/`,
        image: `${SITE}/posts/${n}.jpg`,
        alt: `Post ${n}`,
        views: n * 100,
      })),
    },
  },
};

const words = (from: string) => {
  const found = (ui as Record<string, unknown>)[from];
  if (!found || typeof found !== 'object') return {};
  return Object.fromEntries(
    Object.entries(found).map(([key, value]) => [
      key,
      typeof value === 'string' ? `${value} (own)` : value,
    ])
  );
};

/** One value for a field, the n-th of its kind in its block. */
export function sampleValue(
  field: SettingField,
  blockId: string,
  n = 0
): unknown {
  const own = BLOCK_SAMPLES[blockId]?.[field.name];
  if (own !== undefined) return own;
  if (field.name in NAMED && field.type !== 'group' && field.type !== 'list') {
    return NAMED[field.name];
  }
  switch (field.type) {
    case 'text':
      return `Sample ${field.label.toLowerCase()} ${n + 1}`;
    case 'longText':
      return `A longer ${field.label.toLowerCase()}, with a second sentence.`;
    case 'link':
      return `https://example.com/${field.name}/${n + 1}`;
    case 'picture':
      return `https://example.com/pictures/${field.name}-${n + 1}.jpg`;
    case 'toggle':
      return !(field.default ?? false);
    case 'number': {
      const low = field.min ?? 1;
      const high = field.max ?? low + 10;
      const value = field.default ?? Math.min(high, Math.max(low, 3));
      return value === high ? value : Math.min(high, value + (field.step ?? 1));
    }
    case 'colour':
      return '#336699';
    case 'dateTime':
      return LATER;
    case 'choice': {
      const pick =
        field.options.find((option) => option !== field.default) ??
        field.options[0];
      // Two of a many-option pick: a gradient needs at least two colours.
      return field.multiple ? field.options.slice(0, 2) : pick;
    }
    case 'list': {
      const count = Math.max(field.min ?? 0, Math.min(field.max ?? 3, 3));
      return Array.from({ length: count }, (_, i) => {
        if (field.of === 'number') return i + 1;
        if (field.of === 'link') return `https://example.com/item/${i + 1}`;
        if (field.of) return `Item ${i + 1}`;
        return sampleProps(field.fields ?? [], blockId, i);
      });
    }
    case 'group':
      return sampleProps(field.fields, blockId, n);
    case 'words':
      return words(field.from);
    case 'product': {
      const kind = field.sells[0];
      if (kind === 'plan') return { planVersionId: 'plan-1' };
      if (kind === 'credits') return { creditPackageId: 'credits-1' };
      return { itemId: 'item-1', variantId: 'variant-1', priceId: 'price-1' };
    }
  }
}

/** A value for every field that is a prop, by name. */
export function sampleProps(
  fields: readonly SettingField[],
  blockId: string,
  n = 0
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.forApp) continue;
    props[field.name] = sampleValue(field, blockId, n);
  }
  return props;
}

/** Only the required fields, plus the defaults: a block as first added. */
export function leastProps(
  fields: readonly SettingField[],
  blockId: string
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.forApp) continue;
    if ('default' in field && field.default !== undefined) {
      props[field.name] = field.default;
    } else if (field.required) {
      props[field.name] = sampleValue(field, blockId);
    }
  }
  return props;
}

/** Props every block can take from the app, for a fixed clock. */
export function appProps(block: BlockInfo): Record<string, unknown> {
  return {
    ...(block.appOnly.includes('now') ? { now: SAMPLE_NOW } : {}),
    ...(block.appOnly.includes('live') ? { live: false } : {}),
    ...(block.appOnly.includes('visitorTimeZone')
      ? { visitorTimeZone: 'America/New_York' }
      : {}),
    ...(block.appOnly.includes('nextFree') ? { nextFree: LATER } : {}),
    // Twitch plays only on the sites it's told about.
    ...(block.appOnly.includes('parents') ? { parents: ['example.com'] } : {}),
    ...APP_DATA[block.id],
  };
}

/** Each way one setting can be set, beyond the sample: options and toggles. */
export function variants(
  field: SettingField
): { label: string; value: unknown }[] {
  if (field.forApp) return [];
  if (field.type === 'choice') {
    return field.options.map((option) => ({
      label: String(option),
      value: field.multiple ? [option] : option,
    }));
  }
  if (field.type === 'toggle') {
    return [
      { label: 'on', value: true },
      { label: 'off', value: false },
    ];
  }
  if (field.type === 'number') {
    const low = field.min ?? 0;
    const values = [low, low + 1, field.default, field.max].filter(
      (value): value is number =>
        value !== undefined && (field.max === undefined || value <= field.max)
    );
    return [...new Set(values)].map((value) => ({
      label: String(value),
      value,
    }));
  }
  if (field.type === 'list' && !(field.min && field.min > 0)) {
    return [{ label: 'empty', value: [] }];
  }
  if (field.type === 'text' && !field.required) {
    return [
      { label: 'empty', value: '' },
      { label: 'long', value: 'A very long line of words '.repeat(12).trim() },
    ];
  }
  return [];
}

export const BLOCK_COMPONENT = (block: BlockInfo) =>
  (ui as Record<string, unknown>)[block.component] as React.ComponentType<
    Record<string, unknown>
  >;

export { BLOCKS };
