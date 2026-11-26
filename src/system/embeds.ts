/*
 * Turning a link a creator pastes into a player's address. Each service has
 * its own parser that checks the host exactly and keeps only an id, so a
 * pasted link can never put another address in a frame. Plain functions, so
 * the app's server can check a link before saving it.
 */

import { colorHex, contrastRatio, TEXT_CONTRAST } from './contrast';

/**
 * The shape a player takes on the page: `audio` is a short bar, `track` a
 * single song's player with its artwork, `tall` a list of songs.
 */
export type EmbedShape =
  'video' | 'vertical' | 'square' | 'audio' | 'track' | 'tall';

/** A player for a pasted link: where it loads from and its shape. */
export type Embed = {
  service: EmbedService;
  src: string;
  shape: EmbedShape;
  /**
   * For a player that takes a colour: the name of the address's setting
   * that the page's button colour goes in, as #rrggbb, when play is pressed
   * (see tintedSrc).
   */
  tint?: string;
};

export const EMBED_SERVICES = [
  'youtube',
  'spotify',
  'tiktok',
  'instagram',
  'vimeo',
  'soundcloud',
  'loom',
  'applemusic',
  'deezer',
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

/**
 * A SoundCloud track or playlist page. `visual` shows the big artwork player
 * in place of the compact one. The player takes the page's button colour.
 */
export function soundcloudEmbed(
  input: string,
  { visual = false }: { visual?: boolean } = {}
): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'soundcloud.com') return null;
  const path = parts(url);
  if (path.length < 2 || !path.every((p) => /^[\w-]+$/.test(p))) return null;
  const page = `https://soundcloud.com/${path.join('/')}`;
  return {
    service: 'soundcloud',
    src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(page)}&visual=${visual}`,
    shape: visual || path.includes('sets') ? 'tall' : 'track',
    tint: 'color',
  };
}

const APPLE_MUSIC_KINDS = new Set(['song', 'album', 'playlist']);
const APPLE_MUSIC_IDS = /^\d{4,15}$/;

/**
 * An Apple Music song, album or playlist, as
 * music.apple.com/us/album/name/123, with ?i=456 for one song of an album.
 */
export function appleMusicEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'music.apple.com') return null;
  const [store, kind, ...rest] = parts(url);
  if (
    !store ||
    !/^[a-z]{2}$/i.test(store) ||
    !kind ||
    !APPLE_MUSIC_KINDS.has(kind) ||
    rest.length < 1 ||
    rest.length > 2
  )
    return null;
  const id = rest[rest.length - 1] ?? '';
  const valid =
    kind === 'playlist' ? /^pl\.[A-Za-z0-9-]{8,64}$/ : APPLE_MUSIC_IDS;
  if (!valid.test(id)) return null;
  // The name in the address is only for people; one in another script (or
  // anything odd) is left out, and the player still finds the music by id.
  const name = rest.length === 2 && /^[\w-]{1,120}$/.test(rest[0] ?? '');
  const song = kind === 'album' ? url.searchParams.get('i') : null;
  if (song !== null && !APPLE_MUSIC_IDS.test(song)) return null;
  const path = [store.toLowerCase(), kind, ...(name ? [rest[0]] : []), id];
  return {
    service: 'applemusic',
    src: `https://embed.music.apple.com/${path.join('/')}${song ? `?i=${song}` : ''}`,
    shape: kind === 'song' || song ? 'track' : 'tall',
  };
}

const DEEZER_KINDS = new Set(['track', 'album', 'playlist']);

/**
 * A Deezer track, album or playlist, as www.deezer.com/en/album/123. The
 * player follows the visitor's light or dark setting.
 */
export function deezerEmbed(input: string): Embed | null {
  const url = parse(input);
  if (!url || hostOf(url) !== 'deezer.com') return null;
  const path = parts(url);
  // A language may come first, as /en/ or /pt-br/.
  const [kind, id, ...extra] = /^[a-z]{2}(-[a-z]{2})?$/i.test(path[0] ?? '')
    ? path.slice(1)
    : path;
  if (
    !kind ||
    !DEEZER_KINDS.has(kind) ||
    !id ||
    !/^\d{1,15}$/.test(id) ||
    extra.length
  )
    return null;
  return {
    service: 'deezer',
    src: `https://widget.deezer.com/widget/auto/${kind}/${id}`,
    shape: kind === 'track' ? 'track' : 'tall',
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
  appleMusicEmbed,
  deezerEmbed,
];

/**
 * A player's address with the page's colour put in, for a player that takes
 * one (`tint` names its setting). The colour must be a plain colour, as
 * isSafeColor lets through; anything else leaves the address as it was.
 */
export function tintedSrc(
  src: string,
  tint: string | undefined,
  color: string | null | undefined
): string {
  const hex = tint && color ? colorHex(color) : null;
  if (!tint || !hex) return src;
  try {
    const url = new URL(src);
    url.searchParams.set(tint, hex);
    return url.toString();
  } catch {
    return src;
  }
}

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

/* ---------- Calendars and tickets ---------- */

/** The calendar services a public calendar can be shown from. */
export const CALENDAR_SERVICES = ['googlecalendar', 'outlookcalendar'] as const;
export type CalendarService = (typeof CALENDAR_SERVICES)[number];

/** How a calendar lays out its events. Only Google's takes one. */
export const CALENDAR_VIEWS = ['agenda', 'month', 'week'] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

/** A public calendar: the page to show in a frame, and its service. */
export type CalendarPage = { service: CalendarService; src: string };

const GOOGLE_CALENDAR_ID =
  /^[A-Za-z0-9._%+#-]{1,128}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const GOOGLE_VIEWS: Record<CalendarView, string> = {
  agenda: 'AGENDA',
  month: 'MONTH',
  week: 'WEEK',
};

/** A Google calendar id, plain or as the base64 a share link carries. */
const googleCalendarId = (value: string | null): string | null => {
  if (!value) return null;
  const plain = value.trim();
  if (GOOGLE_CALENDAR_ID.test(plain)) return plain;
  if (!/^[A-Za-z0-9+/_-]{4,400}={0,2}$/.test(plain)) return null;
  try {
    const decoded = atob(plain.replace(/-/g, '+').replace(/_/g, '/'));
    return GOOGLE_CALENDAR_ID.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
};

/**
 * The calendar ids in a Google Calendar link: an embed link
 * (calendar.google.com/calendar/embed?src=…, one or more), a share link
 * (…/calendar/u/0?cid=…) or the public address in iCal form
 * (…/calendar/ical/<id>/public/basic.ics). Empty when it's none of those.
 */
export function googleCalendarIds(input: string): string[] {
  const url = parse(input);
  if (!url || url.protocol !== 'https:') return [];
  const host = url.hostname.toLowerCase();
  const path = parts(url);
  const onGoogle =
    (host === 'calendar.google.com' && path[0] === 'calendar') ||
    (host === 'www.google.com' && path[0] === 'calendar');
  if (!onGoogle) return [];
  if (path[1] === 'ical') {
    if (path[3] !== 'public') return [];
    let id: string;
    try {
      id = decodeURIComponent(path[2] ?? '');
    } catch {
      return [];
    }
    return GOOGLE_CALENDAR_ID.test(id) ? [id] : [];
  }
  const ids = [
    ...url.searchParams.getAll('src'),
    ...url.searchParams.getAll('cid'),
  ]
    .map(googleCalendarId)
    .filter((id): id is string => id !== null);
  return [...new Set(ids)].slice(0, 10);
}

/**
 * Whether a colour can be a Google calendar's background: its own text is
 * dark grey, so the colour must leave that readable (4.5:1).
 */
const googleBackground = (color: string | null | undefined) => {
  const hex = color ? colorHex(color) : null;
  if (!hex) return null;
  const ratio = contrastRatio('#3c4043', hex);
  return ratio !== null && ratio >= TEXT_CONTRAST ? hex : null;
};

/**
 * A public Google calendar in a frame. `view` is agenda, month or week;
 * `timeZone` (an IANA zone, checked by the caller) and `language` (as
 * "de") set how times and words read; `background` is the page's colour,
 * used only when the calendar's own dark text stays readable on it.
 */
export function googleCalendarEmbed(
  input: string,
  {
    view = 'agenda',
    timeZone,
    language,
    background,
  }: {
    view?: CalendarView;
    timeZone?: string;
    language?: string;
    background?: string | null;
  } = {}
): CalendarPage | null {
  const ids = googleCalendarIds(input);
  if (!ids.length) return null;
  const params = new URLSearchParams();
  for (const id of ids) params.append('src', id);
  params.set('mode', GOOGLE_VIEWS[view] ?? GOOGLE_VIEWS.agenda);
  for (const shown of ['showTitle', 'showPrint', 'showTabs', 'showCalendars'])
    params.set(shown, '0');
  if (timeZone && /^[A-Za-z][A-Za-z0-9_+\-/]{0,63}$/.test(timeZone))
    params.set('ctz', timeZone);
  const hl = language?.trim().split(/[-_]/)[0]?.toLowerCase();
  if (hl && /^[a-z]{2,3}$/.test(hl)) params.set('hl', hl);
  const bg = googleBackground(background);
  if (bg) params.set('bgcolor', bg);
  return {
    service: 'googlecalendar',
    src: `https://calendar.google.com/calendar/embed?${params}`,
  };
}

const OUTLOOK_HOSTS = new Set([
  'outlook.office365.com',
  'outlook.office.com',
  'outlook.live.com',
]);
const OUTLOOK_FILES = new Set([
  'calendar.html',
  'index.html',
  'calendar.ics',
  'reachcalendar.ics',
]);

/**
 * A published Outlook calendar, from the HTML or ICS link that Publish a
 * calendar gives (…/owa/calendar/<id>/<key>/calendar.html). It's shown as
 * Outlook lays it out: the link takes no colour or view.
 */
export function outlookCalendarEmbed(input: string): CalendarPage | null {
  const url = parse(input);
  if (!url || url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (!OUTLOOK_HOSTS.has(host)) return null;
  const path = parts(url);
  if (path.length !== 5) return null;
  const [owa, calendar, id = '', key = '', file = ''] = path;
  if (
    owa?.toLowerCase() !== 'owa' ||
    calendar?.toLowerCase() !== 'calendar' ||
    !OUTLOOK_FILES.has(file.toLowerCase())
  )
    return null;
  let owner: string;
  try {
    owner = decodeURIComponent(id);
  } catch {
    return null;
  }
  if (
    !/^[A-Za-z0-9._%+-]{1,128}(@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})?$/.test(
      owner
    ) ||
    !/^[A-Za-z0-9_-]{16,128}$/.test(key)
  )
    return null;
  return {
    service: 'outlookcalendar',
    src: `https://${host}/owa/calendar/${encodeURIComponent(owner).replace(/%40/g, '@')}/${key}/calendar.html`,
  };
}

/**
 * The calendar for a pasted link, Google's or Outlook's, or null when it's
 * neither (show it as a link instead). The options are Google's only.
 */
export function calendarEmbed(
  input: string,
  options: Parameters<typeof googleCalendarEmbed>[1] = {}
): CalendarPage | null {
  return googleCalendarEmbed(input, options) ?? outlookCalendarEmbed(input);
}

/** The ticket services TicketEmbed knows. */
export const TICKET_SERVICES = ['luma', 'eventbrite'] as const;
export type TicketService = (typeof TICKET_SERVICES)[number];

/**
 * An event's tickets. `src` is the checkout to show in a frame, when the
 * service has one a page can frame; `href` is the event's own page, for the
 * button and the plain link under the frame.
 */
export type TicketPage =
  | { service: 'luma'; src: string; href: string }
  | { service: 'eventbrite'; src?: undefined; href: string };

const LUMA_HOSTS = new Set(['luma.com', 'lu.ma']);
const LUMA_EVENT = /^evt-[A-Za-z0-9]{6,40}$/;
const LUMA_TICKET_TYPE = /^ttyp-[A-Za-z0-9]{6,40}$/;

/**
 * A Luma event's registration, from its embed code's address
 * (luma.com/embed/event/evt-…/simple) or the event's id (evt-…) as the
 * event's More tab shows it. A ticket type (?tt=ttyp-…) is kept. The
 * public page's own short address carries no id, so it can't be framed.
 */
export function lumaTickets(
  input: string
): Extract<TicketPage, { service: 'luma' }> | null {
  const text = input.trim();
  let id: string | undefined;
  let ticketType: string | null = null;
  if (LUMA_EVENT.test(text)) id = text;
  else {
    const url = parse(text);
    if (!url || url.protocol !== 'https:') return null;
    if (!LUMA_HOSTS.has(hostOf(url))) return null;
    const [embed, kind, evt] = parts(url);
    if (embed !== 'embed' || kind !== 'event' || !evt || !LUMA_EVENT.test(evt))
      return null;
    id = evt;
    ticketType = url.searchParams.get('tt');
    if (ticketType !== null && !LUMA_TICKET_TYPE.test(ticketType)) return null;
  }
  return {
    service: 'luma',
    src: `https://luma.com/embed/event/${id}/simple${ticketType ? `?tt=${ticketType}` : ''}`,
    href: `https://luma.com/event/${id}`,
  };
}

const EVENTBRITE_HOST =
  /^(www\.)?eventbrite\.(com|ca|ie|fr|de|es|it|nl|be|ch|at|pt|se|dk|fi|co\.uk|com\.au|co\.nz|com\.br|com\.mx|com\.ar|cl|co|com\.pe|sg|hk|in)$/;

/**
 * An Eventbrite event, from its page (eventbrite.com/e/name-tickets-123…).
 * Eventbrite shows its checkout in a page only through its own script,
 * which no block loads, so the tickets open on Eventbrite's page.
 */
export function eventbriteTickets(
  input: string
): Extract<TicketPage, { service: 'eventbrite' }> | null {
  const url = parse(input);
  if (!url || url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (!EVENTBRITE_HOST.test(host)) return null;
  const [e, slug, ...rest] = parts(url);
  const id = slug?.match(/(?:^|-)(\d{9,15})$/)?.[1];
  if (e !== 'e' || !id || rest.length || !/^[\w-]{1,200}$/.test(slug ?? ''))
    return null;
  return {
    service: 'eventbrite',
    href: `https://${host}/e/${slug}`,
  };
}

/** The tickets for a pasted link or id, or null for any other service. */
export function ticketsFor(input: string): TicketPage | null {
  return lumaTickets(input) ?? eventbriteTickets(input);
}
