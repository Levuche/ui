/*
 * Turning a link a creator pastes into a player's address. Each service has
 * its own parser that checks the host exactly and keeps only an id, so a
 * pasted link can never put another address in a frame. Plain functions, so
 * the app's server can check a link before saving it.
 */

/** The shape a player takes on the page. */
export type EmbedShape = 'video' | 'vertical' | 'square' | 'audio' | 'tall';

/** A player for a pasted link: where it loads from and its shape. */
export type Embed = {
  service: EmbedService;
  src: string;
  shape: EmbedShape;
};

export const EMBED_SERVICES = [
  'youtube',
  'spotify',
  'tiktok',
  'instagram',
  'vimeo',
  'soundcloud',
  'loom',
] as const;
export type EmbedService = (typeof EMBED_SERVICES)[number];

const parse = (input: string) => {
  try {
    const url = new URL(input.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
};
const hostOf = (url: URL) =>
  url.hostname.toLowerCase().replace(/^(www|m)\./, '');
const parts = (url: URL) => url.pathname.split('/').filter(Boolean);

const SPOTIFY_KINDS = [
  'track',
  'album',
  'playlist',
  'show',
  'episode',
  'artist',
];

/** A Spotify track, album, playlist, show, episode or artist. */
export function spotifyEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'open.spotify.com') return null;
  const path = parts(url).filter((p) => !/^intl-[a-z-]+$/i.test(p));
  const [kind, id] = path;
  if (
    !kind ||
    !SPOTIFY_KINDS.includes(kind) ||
    !id ||
    !/^[A-Za-z0-9]{22}$/.test(id)
  )
    return null;
  return {
    service: 'spotify',
    src: `https://open.spotify.com/embed/${kind}/${id}`,
    shape: kind === 'track' || kind === 'episode' ? 'audio' : 'tall',
  };
}

/** One TikTok video, as www.tiktok.com/@name/video/123. */
export function tiktokEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'tiktok.com') return null;
  const path = parts(url);
  const at = path.indexOf('video');
  const id = at >= 0 ? path[at + 1] : undefined;
  if (!id || !/^\d{8,25}$/.test(id)) return null;
  return {
    service: 'tiktok',
    src: `https://www.tiktok.com/player/v1/${id}`,
    shape: 'vertical',
  };
}

/** One Instagram post or reel. */
export function instagramEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'instagram.com') return null;
  const path = parts(url);
  const at = path.findIndex((p) => p === 'p' || p === 'reel' || p === 'tv');
  const kind = path[at];
  const code = path[at + 1];
  if (at < 0 || !code || !/^[A-Za-z0-9_-]{5,40}$/.test(code)) return null;
  return {
    service: 'instagram',
    src: `https://www.instagram.com/${kind === 'p' ? 'p' : 'reel'}/${code}/embed`,
    shape: 'vertical',
  };
}

const VIMEO_COLLECTIONS = new Set(['showcase', 'album', 'event', 'ondemand']);

/** A Vimeo video, as vimeo.com/123 or player.vimeo.com/video/123. */
export function vimeoEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url) return null;
  const host = hostOf(url);
  const path = parts(url);
  // In a showcase or album the number after it is the collection's, not a
  // video's: only "…/video/123" inside one names a video.
  const inVideo = path.indexOf('video');
  const id =
    host === 'vimeo.com'
      ? inVideo >= 0
        ? path[inVideo + 1]
        : VIMEO_COLLECTIONS.has(path[0] ?? '')
          ? undefined
          : path.find((p) => /^\d+$/.test(p))
      : host === 'player.vimeo.com' && path[0] === 'video'
        ? path[1]
        : undefined;
  if (!id || !/^\d{4,12}$/.test(id)) return null;
  return {
    service: 'vimeo',
    src: `https://player.vimeo.com/video/${id}?dnt=1`,
    shape: 'video',
  };
}

/** A SoundCloud track or playlist page. */
export function soundcloudEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'soundcloud.com') return null;
  const path = parts(url);
  if (path.length < 2 || !path.every((p) => /^[\w-]+$/.test(p))) return null;
  const page = `https://soundcloud.com/${path.join('/')}`;
  return {
    service: 'soundcloud',
    src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(page)}&visual=false`,
    shape: path.includes('sets') ? 'tall' : 'audio',
  };
}

/** A Loom recording, as loom.com/share/abc. */
export function loomEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'loom.com') return null;
  const [kind, id] = parts(url);
  if (
    (kind !== 'share' && kind !== 'embed') ||
    !id ||
    !/^[a-f0-9]{32}$/i.test(id)
  )
    return null;
  return {
    service: 'loom',
    src: `https://www.loom.com/embed/${id}`,
    shape: 'video',
  };
}

/** A YouTube video, through the privacy-enhanced player. */
export function youtubeEmbed(input: string, id: string | null): Embed | null {
  if (!id) return null;
  return {
    service: 'youtube',
    src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    shape: /\/shorts\//.test(input) ? 'vertical' : 'video',
  };
}

const PARSERS = [
  spotifyEmbed,
  tiktokEmbed,
  instagramEmbed,
  vimeoEmbed,
  soundcloudEmbed,
  loomEmbed,
];

/**
 * The player for a pasted link, or null when its service isn't on the list
 * (show it as a link instead). `services` narrows the list. YouTube needs its
 * id parser passed in, to keep this file free of block code.
 */
export function embedFor(
  input: string,
  {
    services,
    youtubeId,
  }: {
    services?: readonly EmbedService[];
    youtubeId?: (input: string) => string | null;
  } = {}
): Embed | null {
  const allowed = (s: EmbedService) => !services || services.includes(s);
  if (allowed('youtube') && youtubeId) {
    const yt = youtubeEmbed(input, parse(input) ? youtubeId(input) : null);
    if (yt) return yt;
  }
  for (const parser of PARSERS) {
    const embed = parser(input);
    if (embed && allowed(embed.service)) return embed;
  }
  return null;
}
