import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { mapEmbedUrl } from '../src';
import { EMBED_SERVICES, embedFor } from '../src/system/embeds';
import { youtubeId } from '../src/organisms/media';
import {
  COOKIE_KINDS,
  OUTSIDE_SERVICES,
  OUTSIDE_SERVICE_IDS,
  consentNotice,
  moreCookies,
  needsConsent,
  siteName,
  type OutsideService,
} from '../src/system/privacy';
import { BLOCKS, blockInfo, pagePrivacy } from '../src/system/registry';
import { CONSENT_LABELS_SETTING } from '../src/system/settings';

/*
 * Each block's privacy and accessibility notes, and the rule that every
 * block that loads another site says so and can wait for consent.
 */

const ORGANISMS = new URL('../src/organisms/', import.meta.url);

/** Code without its comments, so an address in a comment isn't counted. */
const code = (file: string) =>
  readFileSync(new URL(file, ORGANISMS), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

/** Each exported function's code, by name, up to the next one. */
function regions(source: string) {
  const starts = [...source.matchAll(/export function (\w+)/g)];
  return starts.map((match, n) => ({
    name: match[1] ?? '',
    body: source.slice(match.index, starts[n + 1]?.index ?? source.length),
  }));
}

const FILES = readdirSync(ORGANISMS).filter((f) => f.endsWith('.tsx'));
const ALL_REGIONS = FILES.flatMap((file) => regions(code(file)));

/** Hosts a block links to, which open only when a visitor follows them. */
const LINK_ONLY_HOSTS = ['www.google.com'];

const hostService = (host: string) =>
  OUTSIDE_SERVICE_IDS.find((id) =>
    (OUTSIDE_SERVICES[id].hosts as readonly string[]).includes(host)
  );

test('every block has a privacy note and an accessibility note', () => {
  for (const block of BLOCKS) {
    const { privacy, accessibility } = block;
    expect(COOKIE_KINDS, block.id).toContain(privacy.cookies);
    for (const service of privacy.services) {
      expect(OUTSIDE_SERVICE_IDS, block.id).toContain(service);
    }
    expect(new Set(privacy.services).size, block.id).toBe(
      privacy.services.length
    );
    for (const line of [
      privacy.reason,
      accessibility.keyboard,
      accessibility.screenReader,
    ]) {
      expect(line.trim().length, block.id).toBeGreaterThan(10);
      expect(line, block.id).not.toMatch(/\n/);
      expect(line, block.id).toMatch(/\.$/);
    }
  }
});

test("a block's cookies are at least its services'", () => {
  for (const block of BLOCKS) {
    const most = block.privacy.services.reduce<(typeof COOKIE_KINDS)[number]>(
      (kind, id) => moreCookies(kind, OUTSIDE_SERVICES[id].cookies),
      'none'
    );
    expect(moreCookies(block.privacy.cookies, most), block.id).toBe(
      block.privacy.cookies
    );
  }
});

test('every block that loads another site can wait for consent', () => {
  for (const block of BLOCKS) {
    const loads = block.privacy.services.length > 0;
    const takes = (block.appOnly as readonly string[]).includes('consent');
    expect(takes, `${block.id} takes consent`).toBe(loads);
    expect(
      block.settings.some(
        (field) => field.name === CONSENT_LABELS_SETTING.name
      ),
      `${block.id} has consentLabels`
    ).toBe(loads);
  }
});

test('every block that puts a frame or player on the page lists a service', () => {
  const players = /<(iframe|PlayFrame|EmbedBody|AudioBar)\b/;
  let found = 0;
  for (const region of ALL_REGIONS) {
    const block = BLOCKS.find((b) => b.component === region.name);
    if (!block || !players.test(region.body)) continue;
    found++;
    expect(
      block.privacy.services.length,
      `${block.id} loads another site, so its privacy note lists it`
    ).toBeGreaterThan(0);
  }
  // The check found the players: YouTube, the embeds, map, booking, live, audio.
  expect(found).toBeGreaterThanOrEqual(10);
});

test('every outside address in a block is a listed service', () => {
  for (const region of ALL_REGIONS) {
    const hosts = [...region.body.matchAll(/https:\/\/([a-z0-9.-]+)/gi)].map(
      (m) => (m[1] ?? '').toLowerCase()
    );
    const block = BLOCKS.find((b) => b.component === region.name);
    for (const host of hosts) {
      if (LINK_ONLY_HOSTS.includes(host)) continue;
      const service = hostService(host);
      expect(
        service,
        `${host} in ${region.name} is in OUTSIDE_SERVICES`
      ).toBeDefined();
      if (block && service) {
        expect(
          block.privacy.services,
          `${block.id} lists ${service}`
        ).toContain(service);
      }
    }
  }
});

test('every pasted-link player loads from its listed hosts', () => {
  const samples: Record<(typeof EMBED_SERVICES)[number], string> = {
    youtube: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    spotify: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
    tiktok: 'https://www.tiktok.com/@chef/video/7212345678901234567',
    instagram: 'https://www.instagram.com/reel/C1a2B3c4D5e/',
    vimeo: 'https://vimeo.com/76979871',
    soundcloud: 'https://soundcloud.com/artist/track-name',
    applemusic: 'https://music.apple.com/us/album/chai-at-dawn/1440857781',
    deezer: 'https://www.deezer.com/album/302127',
    loom: 'https://www.loom.com/share/0123456789abcdef0123456789abcdef',
  };
  const linkEmbed = blockInfo('link-embed')?.privacy.services ?? [];
  for (const service of EMBED_SERVICES) {
    const embed = embedFor(samples[service], { youtubeId });
    expect(embed?.service).toBe(service);
    expect(OUTSIDE_SERVICES[service].hosts).toContain(
      new URL(embed?.src ?? '').hostname
    );
    expect(linkEmbed).toContain(service);
  }
  for (const [id, service] of [
    ['spotify-embed', 'spotify'],
    ['soundcloud-embed', 'soundcloud'],
    ['apple-music-embed', 'applemusic'],
    ['deezer-embed', 'deezer'],
    ['tiktok-video', 'tiktok'],
    ['instagram-post', 'instagram'],
    ['youtube-video', 'youtube'],
    ['map-card', 'openstreetmap'],
    ['booking-embed', 'booking'],
    ['live-status', 'twitch'],
  ] as const) {
    expect(blockInfo(id)?.privacy.services, id).toContain(service);
  }
  expect(OUTSIDE_SERVICES.openstreetmap.hosts).toContain(
    new URL(mapEmbedUrl(9.9658, 76.2421)).hostname
  );
});

test('a page adds up its blocks’ services and cookies', () => {
  expect(pagePrivacy([])).toEqual({
    services: [],
    cookies: [],
    blocks: [],
    needsConsent: false,
  });

  const plain = pagePrivacy(['creator-header', 'link-list', 'locked-link']);
  expect(plain.services).toEqual([]);
  expect(plain.cookies).toEqual(['needed']);
  expect(plain.blocks.map((b) => b.id)).toEqual(['locked-link']);
  expect(plain.needsConsent).toBe(false);

  const page = pagePrivacy([
    'creator-header',
    'youtube-video',
    { id: 'link-embed', services: ['vimeo'] },
    'youtube-video',
    'locked-link',
    'not-a-block',
  ]);
  expect(page.services.map((s) => s.id)).toEqual(['youtube', 'vimeo']);
  expect(page.services[0]).toMatchObject({
    name: 'YouTube',
    blocks: ['youtube-video'],
  });
  expect(page.services[1]?.blocks).toEqual(['link-embed']);
  expect(page.cookies).toEqual(['needed', 'statistics', 'marketing']);
  expect(page.blocks.map((b) => b.id)).toEqual([
    'youtube-video',
    'link-embed',
    'locked-link',
  ]);
  expect(page.needsConsent).toBe(true);

  // A feed whose thumbnails come straight from YouTube says so.
  const feed = pagePrivacy([{ id: 'latest-videos', services: ['youtube'] }]);
  expect(feed.services.map((s) => s.id)).toEqual(['youtube']);
  expect(feed.cookies).toEqual(['marketing']);

  // Audio on another host shares the address, so the page asks first.
  expect(pagePrivacy(['audio-player'])).toMatchObject({
    cookies: [],
    needsConsent: true,
  });
});

test('cookie kinds and consent', () => {
  expect(moreCookies('needed', 'marketing')).toBe('marketing');
  expect(moreCookies('statistics', 'none')).toBe('statistics');
  expect(COOKIE_KINDS.filter(needsConsent)).toEqual([
    'preferences',
    'statistics',
    'marketing',
  ]);
  const ids: OutsideService[] = [...OUTSIDE_SERVICE_IDS];
  expect(new Set(ids).size).toBe(ids.length);
});

test('the notice names the site, and only another site', () => {
  expect(consentNotice('YouTube')).toBe(
    'This loads from YouTube, which will see your IP address and may set cookies.'
  );
  expect(consentNotice('Vimeo', { notice: 'Lädt von {service}.' })).toBe(
    'Lädt von Vimeo.'
  );
  expect(siteName('https://www.Cal.example.com/asha')).toBe('cal.example.com');
  expect(siteName('/audio/ep1.mp3')).toBeNull();
  expect(siteName('data:audio/wav;base64,AAAA')).toBeNull();
  expect(siteName('javascript:alert(1)')).toBeNull();
});
