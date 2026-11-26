import { expect, test } from '@playwright/test';
import { contrastRatio, TEXT_CONTRAST } from '../src/system/contrast';
import { isSafeHref } from '../src/system/href';
import { blockInfo } from '../src/system/registry';
import {
  cleanHandle,
  isSocialPlatform,
  shortCount,
  SOCIAL_ACTIONS,
  SOCIAL_COUNTS,
  SOCIAL_ON_DARK,
  SOCIAL_ON_LIGHT,
  SOCIAL_PLATFORM_INFO,
  SOCIAL_PLATFORMS,
  socialHandleText,
  socialProfileHref,
  socialTint,
} from '../src/system/social';
import { isSafeColor } from '../src/system/theme';
import { SOCIAL_CARD_LABELS } from '../src/organisms/social';

/* Plain checks of the social card's platforms and helpers. No browser. */

test('every platform has its name, a safe colour and words for its button', () => {
  expect(Object.keys(SOCIAL_PLATFORM_INFO)).toEqual([...SOCIAL_PLATFORMS]);
  for (const platform of SOCIAL_PLATFORMS) {
    const info = SOCIAL_PLATFORM_INFO[platform];
    expect(info.name.length, platform).toBeGreaterThan(0);
    expect(isSafeColor(info.color), platform).toBe(true);
    expect(SOCIAL_ACTIONS).toContain(info.action);
    expect(SOCIAL_COUNTS).toContain(info.count);
    expect(SOCIAL_CARD_LABELS[info.action].length).toBeGreaterThan(0);
    expect(SOCIAL_CARD_LABELS[info.count]).toContain('{n}');
    expect(isSocialPlatform(platform)).toBe(true);
  }
  expect(isSocialPlatform('myspace')).toBe(false);
  expect(isSocialPlatform(undefined)).toBe(false);
});

test('the brand tint can always be read (4.5:1)', () => {
  for (const platform of SOCIAL_PLATFORMS) {
    const tint = socialTint(platform)!;
    expect(tint.color).toBe(SOCIAL_PLATFORM_INFO[platform].color);
    expect(contrastRatio(tint.on, tint.color), platform).toBeGreaterThanOrEqual(
      TEXT_CONTRAST
    );
  }
  expect(socialTint('youtube')?.on).toBe(SOCIAL_ON_DARK);
  expect(socialTint('spotify')?.on).toBe(SOCIAL_ON_LIGHT);
  expect(socialTint('substack')?.on).toBe(SOCIAL_ON_LIGHT);
});

test('a creator’s own tint is used only when it’s a plain colour', () => {
  expect(socialTint('x', '#facc15')).toEqual({
    color: '#facc15',
    on: SOCIAL_ON_LIGHT,
  });
  expect(socialTint('x', ' #1e3a8a ')).toEqual({
    color: '#1e3a8a',
    on: SOCIAL_ON_DARK,
  });
  for (const bad of [
    'red; background: url(x)',
    'url(https://example.com/a.png)',
    'var(--site-accent)',
    '',
  ]) {
    expect(socialTint('instagram', bad)?.color, bad).toBe('#c13584');
  }
});

test('counts are written short, in the visitor’s way', () => {
  expect(shortCount(1100)).toBe('1.1K');
  expect(shortCount(860000)).toBe('860K');
  expect(shortCount(12400)).toBe('12K');
  expect(shortCount(2_100_000)).toBe('2.1M');
  expect(shortCount(950)).toBe('950');
  expect(shortCount(0)).toBe('0');
  expect(shortCount(1100, 'fr')).toMatch(/^1,1\sk$/);
  expect(shortCount(2_100_000, 'de')).toMatch(/^2,1\sMio\.$/);
  // The same on the server and in the browser when no locale is given.
  expect(shortCount(1100)).toBe(shortCount(1100, 'en-US'));
  for (const bad of [-1, Number.NaN, Infinity, '12', null, undefined]) {
    expect(shortCount(bad), String(bad)).toBe('');
  }
  // An unknown locale falls back instead of throwing.
  expect(shortCount(1100, 'not a locale!')).toBe('1.1K');
});

test('handles are trimmed and written as the platform writes them', () => {
  expect(cleanHandle('  @@desiorigins ')).toBe('desiorigins');
  expect(cleanHandle('@')).toBeNull();
  expect(cleanHandle(42)).toBeNull();
  expect(cleanHandle('x'.repeat(300))).toHaveLength(100);
  expect(socialHandleText('instagram', 'desiorigins')).toBe('@desiorigins');
  expect(socialHandleText('youtube', '@desiorigins')).toBe('@desiorigins');
  expect(socialHandleText('linkedin', 'asha-menon')).toBe('asha-menon');
  expect(socialHandleText('discord', 'Desi Origins Club')).toBe(
    'Desi Origins Club'
  );
  expect(socialHandleText('x', '  ')).toBeNull();
});

test('a profile link is made from a plain handle and nothing else', () => {
  expect(socialProfileHref('instagram', '@desi.origins')).toBe(
    'https://www.instagram.com/desi.origins/'
  );
  expect(socialProfileHref('tiktok', 'desiorigins')).toBe(
    'https://www.tiktok.com/@desiorigins'
  );
  expect(socialProfileHref('youtube', 'desiorigins')).toBe(
    'https://www.youtube.com/@desiorigins'
  );
  expect(socialProfileHref('linkedin', 'asha-menon')).toBe(
    'https://www.linkedin.com/in/asha-menon/'
  );
  expect(socialProfileHref('substack', 'DesiOrigins')).toBe(
    'https://desiorigins.substack.com/'
  );
  expect(socialProfileHref('substack', 'desi_origins')).toBeNull();
  expect(socialProfileHref('github', 'asha-builds')).toBe(
    'https://github.com/asha-builds'
  );
  // A handle isn't enough on these.
  expect(socialProfileHref('discord', 'desiorigins')).toBeNull();
  expect(socialProfileHref('spotify', 'desiorigins')).toBeNull();
  // Nothing a creator types can add a host, a path, a query or a scheme.
  for (const bad of [
    'evil.com/x',
    'a?b=c',
    'a#b',
    'a b',
    '../admin',
    'a..b',
    '.hidden',
    'javascript:alert(1)',
    '//evil.com',
    'a\\b',
    'ünïcode',
    'x'.repeat(61),
    '',
  ]) {
    expect(socialProfileHref('instagram', bad), bad).toBeNull();
  }
  for (const platform of SOCIAL_PLATFORMS) {
    const href = socialProfileHref(platform, 'desiorigins');
    if (href) {
      expect(isSafeHref(href), platform).toBe(true);
      expect(href, platform).toMatch(/^https:\/\/[a-z0-9.-]+\//);
    }
  }
});

test('the social card is in the registry, free, in the profile group', () => {
  expect(blockInfo('social-card')).toMatchObject({
    component: 'SocialCard',
    kind: 'card',
    group: 'profile',
    pack: 'core',
    client: false,
  });
});
